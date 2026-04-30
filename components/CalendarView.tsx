"use client";

import { CalendarEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Props {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  conflicts: string[];
  onRetry: () => void;
}

export default function CalendarView({ events, loading, error, conflicts, onRetry }: Props) {
  const sortedEvents = [...events].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return aTime - bTime;
  });

  return (
    <Card className="col-span-1 shadow-sm w-full">
      <CardHeader className="border-b bg-neutral-50/50 p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-neutral-800 text-base md:text-lg">
          <Calendar className="h-5 w-5 text-neutral-500 shrink-0" aria-hidden="true" />
          Today&apos;s Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-3 md:p-4 max-h-[600px] overflow-y-auto" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <p className="text-neutral-600 text-sm">Calendar unavailable right now.</p>
              <Button variant="outline" size="sm" onClick={onRetry} className="min-h-[44px]" aria-label="Retry loading calendar">
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
              <div className="bg-blue-50 p-3 rounded-full mb-3">
                <Calendar className="h-6 w-6 text-blue-300" aria-hidden="true" />
              </div>
              <p className="font-medium text-neutral-700">📅 No meetings today</p>
              <p className="text-sm text-neutral-400 mt-1">Enjoy the free time!</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-5">
              {sortedEvents.map((event) => {
                const startDate = new Date(event.startTime);
                const endDate = new Date(event.endTime);
                const timeString = isNaN(startDate.getTime())
                  ? "All Day"
                  : `${format(startDate, "h:mm a")} – ${format(endDate, "h:mm a")}`;
                const isConflict = conflicts.some(c =>
                  c.toLowerCase().includes(event.summary.toLowerCase())
                );

                return (
                    <div
                      key={event.id}
                      data-testid={`calendar-event-${event.id}`}
                      className={`flex items-start gap-3 p-3 md:p-4 rounded-xl border ${
                        isConflict
                          ? "border-red-200 bg-red-50/50"
                          : "border-neutral-200 bg-white"
                    } shadow-sm`}
                  >
                    <div
                      className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full ${
                        isConflict ? "bg-red-500" : "bg-blue-500"
                      } shadow shrink-0 mt-0.5`}
                    >
                      <Clock className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <time className={`text-xs font-semibold ${isConflict ? "text-red-600" : "text-blue-600"}`}>
                        {timeString}
                      </time>
                      <h4 className="font-bold text-neutral-900 text-sm md:text-base leading-snug">
                        {event.summary}
                      </h4>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
