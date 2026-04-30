import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { fetchUnreadEmails } from "@/lib/gmail";
import { generateEmailSummary } from "@/lib/gemini";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emails = await fetchUnreadEmails((session as any).accessToken, 15);
    
    // Process summaries concurrently
    const emailsWithSummaries = await Promise.all(
      emails.map(async (email) => {
        try {
          const summary = await generateEmailSummary(email.bodyText || email.snippet);
          return { ...email, summary };
        } catch (error) {
          console.error(`Failed to summarize email ${email.id}`, error);
          return { ...email, summary: "Summary unavailable." };
        }
      })
    );

    return NextResponse.json({ emails: emailsWithSummaries });
  } catch (error: any) {
    console.error("Gmail API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch emails" }, { status: 500 });
  }
}
