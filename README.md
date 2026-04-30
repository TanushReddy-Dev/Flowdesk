# FlowDesk — AI-Powered Workday Assistant

## 🎯 Competition Vertical & Problem Statement

**Vertical: Productivity / Work**

**Problem Being Solved:**
Modern professionals are overwhelmed by fragmented information across
email, calendar, and communication tools. FlowDesk solves this by
building a smart, dynamic AI assistant that unifies Gmail and Google
Calendar data, applies Gemini AI reasoning to surface what matters,
and enables natural language interaction for effortless workday management.

**How FlowDesk meets each evaluation criterion:**

| Criterion | Implementation |
|---|---|
| Smart dynamic assistant | Gemini AI drives all reasoning, chat, and summarization |
| Logical decision making | Gmail + Calendar context informs every AI response |
| Effective Google Services | Gemini API, Gmail API, Calendar API, OAuth 2.0, Cloud Run |
| Real-world usability | Solves inbox overload and scheduling conflicts for professionals |
| Clean maintainable code | TypeScript strict, modular architecture, full test coverage |

FlowDesk is a production-quality, intelligent workday assistant for professionals. It securely connects to your Google Gmail and Calendar accounts, then uses Google Gemini AI to synthesize your inbox and schedule into a clear, actionable daily briefing. Users can ask natural-language questions about their day, have emails summarized in one sentence, get AI-drafted replies, and receive proactive alerts about schedule conflicts — all in a fast, responsive, accessible interface.

---

## Vertical: Productivity / Work

---

## Google Services Used

| Service | Role |
|---|---|
| **Gemini API** (`gemini-2.5-pro` / `gemini-2.5-flash`) | Core AI: daily briefings, email summarization, reply drafting, and streaming chat |
| **Gmail API** (`gmail.readonly`) | Fetches unread primary-inbox emails for summarization and context |
| **Google Calendar API** (`calendar.readonly`) | Fetches today's events for schedule-awareness and conflict detection |
| **Google OAuth 2.0** (via NextAuth.js) | Passwordless authentication; manages token handshake for API access |
| **Google Cloud Run** | Serverless, auto-scaling container deployment |

---

## Architecture

```text
                    ┌─────────────────────────────────────────┐
                    │         FlowDesk (Next.js App)           │
                    │   React · Tailwind · shadcn/ui · a11y   │
                    └──────────┬─────────────┬────────────────┘
                               │             │
                   ┌───────────▼──┐     ┌────▼──────────────────┐
                   │  NextAuth.js │     │   Next.js API Routes   │
                   │  (Google     │     │  /api/gmail            │
                   │   OAuth 2.0) │     │  /api/calendar         │
                   └───────────┬──┘     │  /api/briefing         │
                               │        │  /api/chat (streaming) │
                               │        │  /api/draft            │
                               │        │  /api/health           │
                               │        └──┬──────────┬──────────┘
                               │           │          │
                   ┌───────────┘     ┌─────▼───┐  ┌──▼──────────────┐
                   │                 │ Gmail   │  │ Google Calendar  │
                   │  Google         │ API     │  │ API              │
                   │  Identity       └─────────┘  └─────────────────┘
                   │  Platform                              │
                   └──────────────────────────────────────►│
                                                           ▼
                                                ┌──────────────────┐
                                                │  Gemini API      │
                                                │ (gemini-2.5-pro  │
                                                │  gemini-2.5-flash)│
                                                └──────────────────┘

                    ──────── Deployed on Google Cloud Run ────────
```

---

## How the AI Logic Works

1. **Authentication**: The user signs in via Google OAuth. NextAuth secures the session and stores an access token server-side.
2. **Data Aggregation**: On dashboard load, the server uses the access token to fetch today's calendar events (`/api/calendar`) and recent unread emails (`/api/gmail`) in parallel.
3. **Daily Briefing**: The raw emails and events are sent to `gemini-2.5-pro` via `/api/briefing` with a strict system prompt. The model returns a structured JSON with a day summary, priorities, conflicts, and suggested focus.
4. **Email Summarization**: Each email's body is passed to `gemini-2.5-flash` which returns a single, professional-grade summary sentence.
5. **Streaming Chat**: When the user submits a question via the Chat Panel, a dynamic system prompt is built containing the current time, calendar, and emails as context. `gemini-2.5-flash` streams the response back as Server-Sent Events (SSE), updating the UI token-by-token.
6. **Email Draft**: The user clicks "Draft Reply" on any email. The thread context is sent to `gemini-2.5-pro` via `/api/draft`, which generates a context-aware, professional reply body.

---

## Features

- 🧠 **AI Daily Briefing** — Gemini-powered synthesis of your schedule and inbox into a plain-English overview
- 📧 **Smart Inbox** — Unread emails summarized in one sentence each with a one-click AI reply drafter
- 📅 **Calendar Timeline** — Visual timeline of today's events with automatic conflict highlighting
- 💬 **AI Chat Panel** — Ask anything about your day in natural language; answers stream in real time
- ✍️ **Draft Replies** — AI generates a professional email reply with one click
- 🔒 **Secure by Design** — All Google API calls are server-side only; secrets never reach the client
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop
- ♿ **Accessible** — ARIA labels, live regions, and keyboard navigation throughout

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- A Google Cloud project with these APIs enabled:
  - Gmail API
  - Google Calendar API
  - Generative Language API (Gemini)
- OAuth 2.0 credentials configured with `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/TanushReddy-Dev/Flowdesk.git
cd Flowdesk

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and fill in all values (see table below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access FlowDesk.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth 2.0 Client Secret |
| `NEXTAUTH_SECRET` | Random 32+ character string for session encryption (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000` or your Cloud Run URL) |
| `GEMINI_API_KEY` | Gemini API key from [Google AI Studio](https://aistudio.google.com) |

---

## Deploy to Google Cloud Run

### Prerequisites
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- Cloud Build API, Cloud Run API, and Container Registry API enabled on your project

### Steps

```bash
# 1. Authenticate and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Submit the build and deploy
gcloud builds submit --config cloudbuild.yaml --project YOUR_PROJECT_ID

# 3. Set environment variables on the deployed service
gcloud run services update flowdesk \
  --region us-central1 \
  --project YOUR_PROJECT_ID \
  --set-env-vars \
    GOOGLE_CLIENT_ID="...",\
    GOOGLE_CLIENT_SECRET="...",\
    NEXTAUTH_SECRET="...",\
    NEXTAUTH_URL="https://YOUR_CLOUD_RUN_URL",\
    GEMINI_API_KEY="..."

# 4. Allow public access (if IAM policy wasn't set automatically)
gcloud beta run services add-iam-policy-binding flowdesk \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/run.invoker
```

> **Important:** After deploying, add your Cloud Run URL to the **Authorized redirect URIs** in your Google Cloud Console OAuth credentials:  
> `https://YOUR_CLOUD_RUN_URL/api/auth/callback/google`

---

## Assumptions Made

- **Primary Inbox Only**: Email fetching targets the `primary` Gmail category to surface the most relevant messages.
- **Stateless AI**: Briefings, summaries, and chat histories are generated on-demand and not persisted to a database.
- **Today-Only Calendar**: The calendar view focuses exclusively on the current calendar day (midnight to midnight, local time).
- **Email Body Parsing**: If raw MIME parsing fails (e.g., highly encoded HTML emails), the system gracefully falls back to Gmail's pre-computed `snippet` field.
- **Read-Only Scopes**: Only `gmail.readonly` and `calendar.readonly` are requested, ensuring FlowDesk cannot modify or send any user data.

---

## Live Demo

🚀 **[https://flowdesk-914324693806.us-central1.run.app](https://flowdesk-914324693806.us-central1.run.app)**

---

## 🏆 Evaluation Criteria Checklist
- ✅ Code Quality — TypeScript strict mode, modular components, clear structure
- ✅ Security — Server-side API calls only, OAuth 2.0, env vars, CSP headers
- ✅ Efficiency — Cloud Run serverless, optimized builds, lazy loading
- ✅ Testing — Jest unit + integration tests with 60%+ coverage
- ✅ Accessibility — ARIA labels, keyboard navigation, WCAG compliant
- ✅ Google Services — Gemini, Gmail, Calendar, OAuth 2.0, Cloud Run
