import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGeminiModel } from "@/lib/gemini";
import { fetchUnreadEmails } from "@/lib/gmail";
import { fetchTodayEvents } from "@/lib/calendar";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const accessToken = (session as any).accessToken;

    // Fetch context — degrade gracefully if Google APIs fail
    let emails: any[] = [];
    let events: any[] = [];
    try {
      [emails, events] = await Promise.all([
        fetchUnreadEmails(accessToken, 5),
        fetchTodayEvents(accessToken),
      ]);
    } catch (googleError: any) {
      console.error("Google API error during chat context fetch:", googleError);
      // Continue with empty context — chat can still work
    }

    const systemContext = `
      You are FlowDesk, a professional executive assistant.
      Current Time: ${new Date().toLocaleString()}
      
      User's Today Events: ${JSON.stringify(events)}
      User's Recent Unread Emails: ${JSON.stringify(emails.map(e => ({ sender: e.sender, subject: e.subject, snippet: e.snippet })))}
      
      Answer the user's questions about their day based ONLY on this context. Be concise, helpful, and professional.
    `;

    let model;
    try {
      model = getGeminiModel("gemini-2.5-flash");
    } catch (geminiError: any) {
      console.error("Gemini init error:", geminiError);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    // Convert messages format for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Add system context to history
    if (history.length === 0) {
      history.push({ role: "user", parts: [{ text: systemContext }] });
      history.push({ role: "model", parts: [{ text: "Understood. How can I help you today?" }] });
    } else {
      history[0].parts[0].text = `${systemContext}\n\n${history[0].parts[0].text}`;
    }

    try {
      const chat = model.startChat({ history });
      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessageStream(lastMessage);

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              controller.enqueue(new TextEncoder().encode(chunk.text()));
            }
          } catch (streamError) {
            console.error("Stream error:", streamError);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (geminiError: any) {
      console.error("Gemini chat error:", geminiError);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
