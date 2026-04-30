"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DayBriefingData } from "@/types";
import { Sparkles, AlertCircle, Target } from "lucide-react";

interface Props {
  briefing: DayBriefingData | null;
  loading: boolean;
}

export default function DayBriefing({ briefing, loading }: Props) {
  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100" aria-live="polite" aria-busy={true}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Generating Daily Briefing...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-blue-100" />
          <Skeleton className="h-4 w-5/6 bg-blue-100" />
          <Skeleton className="h-4 w-4/6 bg-blue-100" />
        </CardContent>
      </Card>
    );
  }

  if (!briefing) return null;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm" aria-live="polite" aria-busy={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" />
          Today's AI Briefing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-neutral-800 leading-relaxed text-lg">{briefing.summary}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-100/50">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
              <Target className="h-4 w-4" aria-hidden="true" /> Priorities
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
                  <h4 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" /> Potential Conflicts
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
