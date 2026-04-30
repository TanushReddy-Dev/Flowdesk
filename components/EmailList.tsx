"use client";

import { EmailInfo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Reply, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  emails: EmailInfo[];
  loading: boolean;
  error: string;
  onDraftReply: (email: EmailInfo) => void;
  onRetry: () => void;
}

export default function EmailList({ emails, loading, error, onDraftReply, onRetry }: Props) {
  return (
    <Card className="col-span-1 shadow-sm w-full">
      <CardHeader className="border-b bg-neutral-50/50 p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-neutral-800 text-base md:text-lg">
          <Mail className="h-5 w-5 text-neutral-500 shrink-0" aria-hidden="true" />
          Unread Priority Emails
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto" aria-live="polite" aria-busy={loading}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : error ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <p className="text-neutral-600 text-sm">Unable to load emails right now.</p>
              <Button variant="outline" size="sm" onClick={onRetry} className="min-h-[44px]" aria-label="Retry loading emails">
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
              <div className="bg-green-50 p-3 rounded-full mb-3">
                <Mail className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <p className="font-medium text-neutral-700">✉️ Your inbox is all clear!</p>
              <p className="text-sm text-neutral-400 mt-1">No unread priority emails.</p>
            </div>
          ) : (
            emails.map((email) => {
              const senderMatch = email.sender.match(/^([^<]+)/);
              const senderName = senderMatch ? senderMatch[1].trim() : email.sender;

              const date = new Date(email.timestamp);
              const timeAgo = isNaN(date.getTime()) ? "" : formatDistanceToNow(date, { addSuffix: true });

              return (
                <div key={email.id} className="p-4 hover:bg-neutral-50 transition-colors group">
                  {/* Sender row — stacks naturally at small width */}
                  <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                    <h4 className="font-medium text-neutral-900 text-sm min-w-0 flex-1">{senderName}</h4>
                    <span className="text-xs text-neutral-400 whitespace-nowrap">{timeAgo}</span>
                  </div>
                  <h5 className="text-sm font-medium text-neutral-700 mb-2 line-clamp-2">{email.subject}</h5>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-3 bg-blue-50/50 p-2 rounded border border-blue-100/50">
                    <span className="font-semibold text-blue-700 text-xs uppercase tracking-wider mr-2">AI Summary</span>
                    {email.summary || email.snippet}
                  </p>
                  {/* Full-width on mobile, right-aligned on desktop */}
                  <div className="flex justify-end md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 md:transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto min-h-[44px] text-xs flex items-center justify-center gap-1.5"
                      aria-label={`Draft reply to ${senderName}`}
                      onClick={() => onDraftReply(email)}
                    >
                      <Reply className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Draft Reply
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
