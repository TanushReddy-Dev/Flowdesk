export interface EmailInfo {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  timestamp: string;
  summary?: string;
  bodyText?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface DayBriefingData {
  summary: string;
  priorities: string[];
  conflicts: string[];
  suggestedFocus: string;
}
