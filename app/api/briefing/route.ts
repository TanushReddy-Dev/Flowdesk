import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateDailyBriefing } from "@/lib/gemini";

type BriefingEmail = {
  subject?: string;
  sender?: string;
  snippet?: string;
};

type BriefingEvent = {
  summary?: string;
  startTime?: string;
};

function buildFallbackBriefing(emails: BriefingEmail[], events: BriefingEvent[]) {
  const priorities: string[] = [];

  if (emails.length > 0) {
    const topSubjects = emails.slice(0, 2).map((email) => email.subject || "Unread email");
    priorities.push(`Review: ${topSubjects.join(", ")}`);
  } else {
    priorities.push("Check inbox for new updates.");
  }

  if (events.length > 0) {
    const topEvents = events.slice(0, 2).map((event) => event.summary || "Upcoming event");
    priorities.push(`Prepare for: ${topEvents.join(", ")}`);
  } else {
    priorities.push("Block deep-focus time on your calendar.");
  }

  return {
    summary:
      "AI briefing is temporarily unavailable. Here is a quick snapshot based on your current inbox and calendar context.",
    priorities,
    conflicts: [],
    suggestedFocus: "Start with your top priority email and next calendar commitment.",
  };
}

function normalizeBriefingEmails(emails: BriefingEmail[]) {
  return emails.map((email) => ({
    sender: email.sender || "Unknown Sender",
    subject: email.subject || "No Subject",
    snippet: email.snippet || "",
  }));
}

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

    const { emails, events } = body as { emails?: BriefingEmail[]; events?: BriefingEvent[] };
    if (!emails || !events) {
      return NextResponse.json(
        { error: "Missing emails or events data" },
        { status: 400 }
      );
    }

    const normalizedEmails = normalizeBriefingEmails(emails);

    let briefing;
    let usedFallback = false;
    try {
      briefing = await generateDailyBriefing(normalizedEmails, events);
    } catch (geminiError: unknown) {
      console.error("Gemini briefing error:", geminiError);
      briefing = buildFallbackBriefing(emails, events);
      usedFallback = true;
    }

    return NextResponse.json({ briefing, usedFallback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate briefing";
    console.error("Briefing route error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
