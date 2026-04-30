import { google } from "googleapis";
import { startOfDay, endOfDay } from "date-fns";

export type CalendarEventLike = {
  id?: string | null;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
};

export function parseCalendarEvents(events: CalendarEventLike[]) {
  return events.flatMap((event) => {
    if (!event.id) return [];
    return [
      {
        id: event.id,
        title: event.summary || "Untitled Event",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
      },
    ];
  });
}

type TimelineEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
};

export function detectConflictingEvents(events: TimelineEvent[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const conflicts: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const first = sorted[i];
      const second = sorted[j];
      const firstStart = new Date(first.start).getTime();
      const firstEnd = new Date(first.end).getTime();
      const secondStart = new Date(second.start).getTime();
      const secondEnd = new Date(second.end).getTime();

      if ([firstStart, firstEnd, secondStart, secondEnd].some((time) => Number.isNaN(time))) {
        continue;
      }

      if (firstStart < secondEnd && secondStart < firstEnd) {
        conflicts.push(`${first.title} conflicts with ${second.title}`);
      }
    }
  }

  return conflicts;
}

export async function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function fetchTodayEvents(accessToken: string) {
  const calendar = await getCalendarClient(accessToken);
  const now = new Date();
  const timeMin = startOfDay(now).toISOString();
  const timeMax = endOfDay(now).toISOString();

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  const parsedEvents = parseCalendarEvents(response.data.items || []);
  return parsedEvents.map((event) => ({
    id: event.id,
    summary: event.title,
    startTime: event.start,
    endTime: event.end,
    location: (response.data.items || []).find((item) => item.id === event.id)?.location,
  }));
}
