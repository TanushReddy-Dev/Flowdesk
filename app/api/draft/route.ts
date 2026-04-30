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

    const { emailContent } = await req.json();
    if (!emailContent) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 });
    }

    const draft = await generateEmailDraft(emailContent);
    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error("Draft API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate draft" }, { status: 500 });
  }
}
