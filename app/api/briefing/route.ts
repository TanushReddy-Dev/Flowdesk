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

    const { emails, events } = await req.json();
    
    if (!emails || !events) {
      return NextResponse.json({ error: "Missing emails or events data" }, { status: 400 });
    }

    const briefing = await generateDailyBriefing(emails, events);
    return NextResponse.json({ briefing });
  } catch (error: any) {
    console.error("Briefing API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate briefing" }, { status: 500 });
  }
}
