"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DayBriefingData } from "@/types";
import { Sparkles, AlertCircle, Target, RefreshCw } from "lucide-react";

interface Props {
  briefing: DayBriefingData | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export default function DayBriefing({ briefing, loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100" aria-live="polite" aria-busy={true}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-base md:text-lg">
            <Sparkles className="h-5 w-5 animate-pulse shrink-0" aria-hidden="true" />
            Generating Daily Briefing...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 md:p-6 pt-0">
          <Skeleton className="h-4 w-full bg-blue-100" />
          <Skeleton className="h-4 w-5/6 bg-blue-100" />
          <Skeleton className="h-4 w-4/6 bg-blue-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-100/50">
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/3 bg-blue-100" />
              <Skeleton className="h-3 w-full bg-blue-100" />
              <Skeleton className="h-3 w-5/6 bg-blue-100" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/3 bg-blue-100" />
              <Skeleton className="h-3 w-full bg-blue-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100" aria-live="polite">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-amber-900">⚠️ Couldn&apos;t load your briefing.</p>
              <p className="text-sm text-amber-700 mt-0.5">Please refresh or try again.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-full sm:w-auto min-h-[44px] border-amber-300 text-amber-800 hover:bg-amber-100"
            aria-label="Retry loading briefing"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!briefing) return null;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm" aria-live="polite" aria-busy={false}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-base md:text-lg">
          <Sparkles className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />
          Today&apos;s AI Briefing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
        <p className="text-neutral-800 leading-relaxed text-sm md:text-base">{briefing.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-blue-100/50">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-3 text-sm md:text-base">
              <Target className="h-4 w-4 shrink-0" aria-hidden="true" /> Priorities
            </h4>
            <ul className="space-y-2">
              {briefing.priorities.map((priority, i) => (
                <li key={i} className="flex items-start gap-2 text-neutral-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                  <span className="text-sm">{priority}</span>
                </li>
              ))}
            </ul>
          </div>

          {(briefing.conflicts.length > 0 || briefing.suggestedFocus) && (
            <div>
              {briefing.conflicts.length > 0 && (
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 font-semibold text-red-700 mb-3 text-sm md:text-base">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Potential Conflicts
                  </h4>
                  <ul className="space-y-2">
                    {briefing.conflicts.map((conflict, i) => (
                      <li key={i} className="flex items-start gap-2 text-red-600">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                        <span className="text-sm">{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {briefing.suggestedFocus && (
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-2 text-sm">Suggested Focus</h4>
                  <p className="text-sm text-indigo-700 bg-indigo-100/50 p-3 rounded-lg border border-indigo-100">
                    {briefing.suggestedFocus}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
