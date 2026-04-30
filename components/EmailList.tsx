"use client";

import { EmailInfo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  emails: EmailInfo[];
  loading: boolean;
  onDraftReply: (email: EmailInfo) => void;
}

export default function EmailList({ emails, loading, onDraftReply }: Props) {
  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader className="border-b bg-neutral-50/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-neutral-800 text-lg">
          <Mail className="h-5 w-5 text-neutral-500" aria-hidden="true" />
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
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
              <div className="bg-neutral-100 p-3 rounded-full mb-3">
                <Mail className="h-6 w-6 text-neutral-400" />
              </div>
              <p>Inbox zero! No unread priority emails.</p>
            </div>
          ) : (
            emails.map((email) => {
              // Parse sender name (e.g. "John Doe <john@doe.com>" -> "John Doe")
              const senderMatch = email.sender.match(/^([^<]+)/);
              const senderName = senderMatch ? senderMatch[1].trim() : email.sender;
              
              const date = new Date(email.timestamp);
              const timeAgo = isNaN(date.getTime()) ? "" : formatDistanceToNow(date, { addSuffix: true });

              return (
                <div key={email.id} className="p-4 hover:bg-neutral-50 transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-neutral-900 truncate pr-4">{senderName}</h4>
                    <span className="text-xs text-neutral-400 whitespace-nowrap">{timeAgo}</span>
                  </div>
                  <h5 className="text-sm font-medium text-neutral-700 mb-1.5 line-clamp-1">{email.subject}</h5>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2 bg-blue-50/50 p-2 rounded border border-blue-100/50">
                    <span className="font-semibold text-blue-700 text-xs uppercase tracking-wider mr-2">AI Summary</span>
                    {email.summary || email.snippet}
                  </p>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs flex items-center gap-1.5"
                      aria-label={`Draft reply to ${senderName}`}
                      onClick={() => onDraftReply(email)}
                    >
                      <Reply className="h-3.5 w-3.5" aria-hidden="true" /> Draft Reply
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
