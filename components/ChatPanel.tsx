"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  isError?: boolean;
}

const TIMEOUT_MS = 15000;

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Lock body scroll when chat open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const addErrorMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "model", content: text, isError: true }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      addErrorMessage("⏱️ Response timed out. Please try again.");
    }, TIMEOUT_MS);

    try {
      const history = [...messages.slice(-9), userMessage];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        addErrorMessage(
          response.status === 503
            ? "🤖 AI is unavailable right now. Please try again later."
            : `Something went wrong: ${data.error || "Unknown error"}`
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) { addErrorMessage("Failed to read response."); return; }

      const decoder = new TextDecoder();
      let done = false;
      let modelContent = "";
      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: "model", content: "" }]);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          modelContent += decoder.decode(value, { stream: true });
          setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, content: modelContent } : msg));
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name !== "AbortError") addErrorMessage("🤖 AI is unavailable, try again.");
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat panel"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 z-50"
      >
        <Bot className="h-6 w-6 text-white" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <>
      {/* Mobile: full-screen overlay; Desktop: fixed side panel */}
      <div
        className={[
          "fixed z-50 flex flex-col bg-white shadow-2xl border-blue-100",
          // Mobile: full screen
          "inset-0",
          // Desktop: side panel
          "sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:max-h-[80vh] sm:rounded-2xl sm:border",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white sm:rounded-t-2xl">
          <div className="flex items-center gap-2 font-semibold text-base">
            <Bot className="h-5 w-5" aria-hidden="true" />
            Ask FlowDesk
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-blue-500/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close chat panel"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
          {messages.length === 0 && (
            <div className="text-center text-neutral-500 my-8">
              <Bot className="h-10 w-10 mx-auto text-blue-300 mb-3" />
              <p className="text-sm">Ask me about your schedule or emails.</p>
              <div className="mt-4 flex flex-col gap-2">
                <button onClick={() => setInput("What is my next meeting?")} className="text-xs bg-white border border-neutral-200 rounded-lg p-3 text-left hover:bg-neutral-50 transition-colors min-h-[44px]">
                  &quot;What is my next meeting?&quot;
                </button>
                <button onClick={() => setInput("Do I have time for lunch today?")} className="text-xs bg-white border border-neutral-200 rounded-lg p-3 text-left hover:bg-neutral-50 transition-colors min-h-[44px]">
                  &quot;Do I have time for lunch today?&quot;
                </button>
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.isError ? (
                <div className="max-w-[85%] flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-3 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{m.content}</span>
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm shadow-sm"
                }`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm shadow-sm p-4 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input — pinned to bottom */}
        <div className="p-3 bg-white border-t border-neutral-100 sm:rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your day..."
              aria-label="Chat input"
              className="flex-1 border-neutral-200 focus-visible:ring-blue-500 min-h-[44px] text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
