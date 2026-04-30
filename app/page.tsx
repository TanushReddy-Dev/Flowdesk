"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <main className="min-h-screen bg-[#0D1117] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-4 py-12 md:px-8 md:py-16">
        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs tracking-wide text-white/70 backdrop-blur">
            AI-Powered Workday Assistant
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl">
            FlowDesk
          </h1>
          <p className="mt-4 text-xl font-medium text-white/90 md:text-2xl">
            Your AI-powered workday, organized.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/65 md:text-lg">
            Connect Gmail and Google Calendar. Let AI surface what matters, draft your replies, and keep
            you focused.
          </p>

          <button
            type="button"
            onClick={() => signIn("google")}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-3 font-semibold text-[#111827] shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105 md:w-auto"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.5 3.1 14.5 2.3 12 2.3 6.8 2.3 2.6 6.6 2.6 12s4.2 9.7 9.4 9.7c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.5H12Z"
              />
              <path
                fill="#34A853"
                d="M3.7 7.4 6.9 9.7C7.8 7.9 9.7 6.7 12 6.7c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.5 3.1 14.5 2.3 12 2.3 8.4 2.3 5.2 4.4 3.7 7.4Z"
              />
              <path
                fill="#FBBC05"
                d="M12 21.7c2.4 0 4.4-.8 5.9-2.2l-2.7-2.2c-.7.5-1.7.9-3.2.9-2.5 0-4.6-1.7-5.4-4l-3.3 2.5c1.5 3 4.6 5 8.7 5Z"
              />
              <path
                fill="#4285F4"
                d="M21 12.5c0-.7-.1-1.2-.2-1.8H12v3.9h5.4c-.3 1.4-1.1 2.5-2.1 3.2l2.7 2.2c1.6-1.5 3-3.9 3-7.5Z"
              />
            </svg>
            Continue with Google
          </button>
        </section>

        <section className="mx-auto mt-14 flex w-full max-w-5xl flex-col gap-4 md:mt-8 md:flex-row">
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-2xl">📧</div>
            <h3 className="mt-3 text-lg font-semibold text-white">Smart Email Summaries</h3>
            <p className="mt-2 text-sm text-white/65">Cut through inbox noise instantly</p>
          </div>
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-2xl">📅</div>
            <h3 className="mt-3 text-lg font-semibold text-white">Calendar Awareness</h3>
            <p className="mt-2 text-sm text-white/65">Never miss a conflict or deadline</p>
          </div>
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-2xl">🤖</div>
            <h3 className="mt-3 text-lg font-semibold text-white">AI Assistant</h3>
            <p className="mt-2 text-sm text-white/65">Ask anything about your day in plain English</p>
          </div>
        </section>

        <footer className="mt-8 pb-8 flex flex-col items-center gap-4 text-center text-sm text-white/30">
          <p>Built with Gemini AI + Google Cloud</p>
          <div className="flex gap-4 justify-center">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
