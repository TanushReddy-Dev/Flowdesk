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

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Fetch context
    const accessToken = (session as any).accessToken;
    const [emails, events] = await Promise.all([
      fetchUnreadEmails(accessToken, 5), // Limit to 5 for context token limit
      fetchTodayEvents(accessToken),
    ]);

    const systemContext = `
      You are FlowDesk, a professional executive assistant.
      Current Time: ${new Date().toLocaleString()}
      
      User's Today Events: ${JSON.stringify(events)}
      User's Recent Unread Emails: ${JSON.stringify(emails.map(e => ({ sender: e.sender, subject: e.subject, snippet: e.snippet })))}
      
      Answer the user's questions about their day based ONLY on this context. Be concise, helpful, and professional.
    `;
    const model = getGeminiModel("gemini-2.5-flash");
    // Convert messages format for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));
    
    // Add system context to the first message or history if empty
    if (history.length === 0) {
      history.push({ role: "user", parts: [{ text: systemContext }] });
      history.push({ role: "model", parts: [{ text: "Understood. How can I help you today?" }] });
    } else {
      // Modify first user message to include system context
      history[0].parts[0].text = `${systemContext}\n\n${history[0].parts[0].text}`;
    }

    const chat = model.startChat({ history });
    
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(lastMessage);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
