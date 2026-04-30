import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateEmailDraft } from "@/lib/gemini";

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

    const { emailContent } = body;
    if (!emailContent) {
      return NextResponse.json(
        { error: "Email content is required" },
        { status: 400 }
      );
    }

    let draft;
    try {
      draft = await generateEmailDraft(emailContent);
    } catch (geminiError: any) {
      console.error("Gemini draft error:", geminiError);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error("Draft route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate draft" },
      { status: 500 }
    );
  }
}
