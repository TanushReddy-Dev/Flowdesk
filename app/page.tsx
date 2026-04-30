"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Sparkles } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-[calc(100vh-64px)] bg-white" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-white">
      <div className="text-center max-w-3xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-100 p-3 text-blue-600">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl mb-6">
          Your AI-Powered <br className="hidden sm:block" /> Workday Assistant
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          FlowDesk connects to your Gmail and Google Calendar. Using Google Gemini AI, it summarizes your day, surfaces action items, and drafts emails—all in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" onClick={() => signIn("google")} className="text-md px-8 py-6 h-auto w-full sm:w-auto">
            Get Started with Google
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-neutral-100 pt-16">
          <div className="flex flex-col items-start p-6 bg-neutral-50 rounded-2xl">
            <div className="rounded-lg bg-neutral-200/50 p-2 text-neutral-600 mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2 text-lg">Smart Email Triage</h3>
            <p className="text-neutral-600">Get instant AI summaries of unread emails and draft replies in seconds.</p>
          </div>
          
          <div className="flex flex-col items-start p-6 bg-neutral-50 rounded-2xl">
            <div className="rounded-lg bg-neutral-200/50 p-2 text-neutral-600 mb-4">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2 text-lg">Schedule Insights</h3>
            <p className="text-neutral-600">Proactively spot conflicts and view your day at a glance.</p>
          </div>

          <div className="flex flex-col items-start p-6 bg-neutral-50 rounded-2xl">
            <div className="rounded-lg bg-neutral-200/50 p-2 text-neutral-600 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2 text-lg">AI Daily Briefing</h3>
            <p className="text-neutral-600">Start your morning with a generated briefing of your top priorities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
