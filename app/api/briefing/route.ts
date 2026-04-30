import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateDailyBriefing } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { emails, events } = body;
    if (!emails || !events) {
      return NextResponse.json(
        { error: "Missing emails or events data" },
        { status: 400 }
      );
    }

    let briefing;
    try {
      briefing = await generateDailyBriefing(emails, events);
    } catch (geminiError: any) {
      console.error("Gemini briefing error:", geminiError);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ briefing });
  } catch (error: any) {
    console.error("Briefing route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate briefing" },
      { status: 500 }
    );
  }
}
