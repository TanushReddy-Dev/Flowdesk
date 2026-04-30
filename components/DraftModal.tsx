"use client";

import { useState, useEffect } from "react";
import { EmailInfo } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  email: EmailInfo | null;
  onClose: () => void;
}

export default function DraftModal({ email, onClose }: Props) {
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (email) {
      generateDraft(email.bodyText || email.snippet);
    } else {
      setDraft("");
      setError("");
      setCopied(false);
    }
  }, [email]);

  const generateDraft = async (content: string) => {
    setIsLoading(true);
    setError("");
    setDraft("");
    try {
      const response = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        const isAiError = response.status === 503;
        setError(isAiError
          ? "AI service is currently unavailable. Please try again later."
          : "Couldn't generate draft. Please try again."
        );
        return;
      }

      setDraft(data.draft);
    } catch {
      setError("Couldn't generate draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed silently — button just won't toggle
    }
  };

  return (
    <Dialog open={!!email} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] gap-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-blue-500" aria-hidden="true" />
            AI Draft Reply
          </DialogTitle>
        </DialogHeader>

        {email && (
          <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600 border border-neutral-100">
            <div className="font-medium text-neutral-900 mb-1">Replying to: {email.sender}</div>
            <div className="truncate">Subject: {email.subject}</div>
          </div>
        )}

        <div className="min-h-[200px]" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[80%]" />
              <div className="pt-4 flex items-center justify-center text-sm text-neutral-500">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse text-blue-400" aria-hidden="true" />
                Drafting response...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <p className="text-sm text-neutral-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => email && generateDraft(email.bodyText || email.snippet)}
                aria-label="Retry draft generation"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : (
            <textarea
              className="w-full h-full min-h-[250px] p-4 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your draft will appear here..."
              aria-label="Draft email reply"
            />
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={isLoading || !draft}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
