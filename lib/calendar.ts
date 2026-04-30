import { google } from "googleapis";
import { startOfDay, endOfDay } from "date-fns";

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

  const events = response.data.items || [];
  return events.map((event) => ({
    id: event.id!,
    summary: event.summary || "Untitled Event",
    startTime: event.start?.dateTime || event.start?.date || "",
    endTime: event.end?.dateTime || event.end?.date || "",
    location: event.location,
  }));
}
