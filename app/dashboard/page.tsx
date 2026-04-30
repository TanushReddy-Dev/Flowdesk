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

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [emails, setEmails] = useState<EmailInfo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [briefing, setBriefing] = useState<DayBriefingData | null>(null);

  const [emailsLoading, setEmailsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(true);

  const [emailsError, setEmailsError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [briefingError, setBriefingError] = useState("");

  const [selectedEmail, setSelectedEmail] = useState<EmailInfo | null>(null);

  const fetchEmails = useCallback(async () => {
    setEmailsLoading(true);
    setEmailsError("");
    try {
      const res = await fetch("/api/gmail");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch emails");
      setEmails(data.emails);
    } catch (err: any) {
      console.error(err);
      setEmailsError(err.message || "Failed to fetch emails");
    } finally {
      setEmailsLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError("");
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch events");
      setEvents(data.events);
    } catch (err: any) {
      console.error(err);
      setEventsError(err.message || "Failed to fetch events");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchBriefing = useCallback(async (emailData: EmailInfo[], eventData: CalendarEvent[]) => {
    setBriefingLoading(true);
    setBriefingError("");
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailData, events: eventData }),
      });
      const data = await res.json();
      if (res.ok) setBriefing(data.briefing);
      else throw new Error(data.error || "Failed to generate briefing");
    } catch (err: any) {
      console.error(err);
      setBriefingError(err.message || "Failed to generate briefing");
    } finally {
      setBriefingLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    // Fetch emails and events in parallel
    const [fetchedEmails, fetchedEvents] = await Promise.all([
      fetch("/api/gmail").then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setEmailsError(d.error || "Failed to fetch emails"); setEmailsLoading(false); return [] as EmailInfo[]; }
        setEmails(d.emails);
        setEmailsLoading(false);
        return d.emails as EmailInfo[];
      }).catch((e) => { setEmailsError(e.message); setEmailsLoading(false); return [] as EmailInfo[]; }),
      fetch("/api/calendar").then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setEventsError(d.error || "Failed to fetch events"); setEventsLoading(false); return [] as CalendarEvent[]; }
        setEvents(d.events);
        setEventsLoading(false);
        return d.events as CalendarEvent[];
      }).catch((e) => { setEventsError(e.message); setEventsLoading(false); return [] as CalendarEvent[]; }),
    ]);

    // Only fetch briefing if we have some data
    await fetchBriefing(fetchedEmails, fetchedEvents);
  }, [fetchBriefing]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAll();
    }
  }, [status, fetchAll]);

  const retryBriefing = useCallback(() => {
    fetchBriefing(emails, events);
  }, [emails, events, fetchBriefing]);

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
        <p className="text-neutral-500">Here&apos;s what you need to know today.</p>
      </div>

      <div className="space-y-6 md:space-y-8 pb-24">
        <DayBriefing
          briefing={briefing}
          loading={briefingLoading}
          error={briefingError}
          onRetry={retryBriefing}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <EmailList
            emails={emails}
            loading={emailsLoading}
            error={emailsError}
            onDraftReply={setSelectedEmail}
            onRetry={fetchEmails}
          />
          <CalendarView
            events={events}
            loading={eventsLoading}
            error={eventsError}
            conflicts={briefing?.conflicts || []}
            onRetry={fetchEvents}
          />
        </div>
      </div>

      <ChatPanel />
      <DraftModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
    </div>
  );
}
