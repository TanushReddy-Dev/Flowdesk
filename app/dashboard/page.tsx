"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { EmailInfo, CalendarEvent, DayBriefingData } from "@/types";
import DayBriefing from "@/components/DayBriefing";
import EmailList from "@/components/EmailList";
import CalendarView from "@/components/CalendarView";
import ChatPanel from "@/components/ChatPanel";
import DraftModal from "@/components/DraftModal";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [briefing, setBriefing] = useState<DayBriefingData | null>(null);
  
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(true);
  
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailInfo | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch emails
      const emailsRes = await fetch("/api/gmail");
      const emailsData = await emailsRes.json();
      if (!emailsRes.ok) throw new Error(emailsData.error || "Failed to fetch emails");
      setEmails(emailsData.emails);
      setEmailsLoading(false);

      // Fetch events
      const eventsRes = await fetch("/api/calendar");
      const eventsData = await eventsRes.json();
      if (!eventsRes.ok) throw new Error(eventsData.error || "Failed to fetch events");
      setEvents(eventsData.events);
      setEventsLoading(false);

      // Fetch briefing (using emails and events client-side might be slow, so we could have an endpoint, 
      // but we don't have a specific endpoint. We can call Gemini directly using an API route or pass data.
      // Wait, let's create a briefing API route!)
      // Wait, let me check the instructions. "On dashboard load, fetch: last 10 unread emails + today's calendar events, Send both to Gemini..."
      // I can add a `/api/briefing` route, or I can do it here by POSTing to `/api/briefing`. 
      // I haven't created `/api/briefing` yet. I will create it.
      
      const briefingRes = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailsData.emails, events: eventsData.events })
      });
      const briefingData = await briefingRes.json();
      if (briefingRes.ok) {
        setBriefing(briefingData.briefing);
      }
      setBriefingLoading(false);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching your data");
      setEmailsLoading(false);
      setEventsLoading(false);
      setBriefingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[600px] w-full rounded-xl" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
          Good morning, {session?.user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-neutral-500">Here's what you need to know today.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-8 pb-20">
        <DayBriefing briefing={briefing} loading={briefingLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <EmailList 
            emails={emails} 
            loading={emailsLoading} 
            onDraftReply={setSelectedEmail} 
          />
          <CalendarView 
            events={events} 
            loading={eventsLoading} 
            conflicts={briefing?.conflicts || []}
          />
        </div>
      </div>

      <ChatPanel />
      <DraftModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
    </div>
  );
}
