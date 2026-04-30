# FlowDesk

FlowDesk is an intelligent, AI-powered workday assistant built for professionals. By securely connecting to your Google Calendar and Gmail, it leverages the reasoning capabilities of Google Gemini AI to analyze your schedule, summarize priority unread emails, and proactively flag schedule conflicts. FlowDesk features a natural-language chat panel for asking questions about your day, automated morning briefings, and an AI drafting tool for instantly generating context-aware email replies—all within a modern, responsive interface.

**Vertical:** Productivity / Work

---

## Architecture Diagram

```text
                        +----------------------------------------+
                        |        FlowDesk Frontend Client        |
                        | (React, Tailwind CSS, shadcn/ui, a11y) |
                        +----------------------------------------+
                                /            |             \
                (OAuth Login)  /      (Fetch Data)          \ (Chat & Prompts)
                              /              |               \
+-------------------------+  v               v                v  +-------------------------+
|     Google Identity     | <-> +--------------------------+ <-> | Google Gemini API       |
|       (NextAuth)        |     |   Next.js API Routes     |     | (gemini-2.5-flash &     |
+-------------------------+     | (/api/gmail, /api/chat,  |     |  gemini-2.5-pro)        |
                                |  /api/calendar, etc.)    |     +-------------------------+
                                +--------------------------+
                                       /            \
                       (Fetch Emails) /              \ (Fetch Events)
                                     /                \
                    +-------------------------+  +-------------------------+
                    |        Gmail API        |  |   Google Calendar API   |
                    |      (Read-Only)        |  |      (Read-Only)        |
                    +-------------------------+  +-------------------------+
```

---

## Google Services Used & Justification

- **Google OAuth (via NextAuth.js):** Provides a seamless, secure, and passwordless authentication flow. Crucially, it manages the OAuth token handshakes necessary to request the scopes required by other Google APIs.
- **Gmail API (`gmail.readonly`):** Used to fetch the user's unread, primary emails. The read-only scope ensures user trust and strict security boundaries—FlowDesk can only read data for summarization and drafting, and cannot independently send, archive, or delete emails.
- **Google Calendar API (`calendar.readonly`):** Used to fetch events from the user's primary calendar specifically for the current day. This is essential for timeline generation, schedule querying, and AI-driven conflict detection.
- **Google Gemini API (`@google/generative-ai`):** The core intelligence engine. We utilize `gemini-2.5-flash` for high-speed chat streaming and quick email summaries, while leveraging `gemini-2.5-pro` for complex analytical tasks like generating the structured JSON daily briefing and drafting context-heavy email replies.

---

## AI Decision Logic

1. **Context Aggregation:** Upon logging in, the Next.js server utilizes the user's OAuth access token to fetch today's calendar events and recent unread priority emails.
2. **Daily Briefing Generation:** The aggregated raw events and emails are passed directly to `gemini-2.5-pro` alongside a strict system prompt. The model analyzes the data to pinpoint overlaps or urgencies, returning a rigidly formatted JSON object (parsed via `JSON.parse` on the server) that outlines the day's summary, priorities, conflicts, and suggested focus.
3. **Email Summarization:** As unread emails are fetched, their raw text or snippets are asynchronously mapped and sent to `gemini-2.5-flash`, which returns a clear, one-sentence summary to prevent user overwhelm.
4. **Interactive Chat:** When a user opens the chat panel and submits a query, a dynamic system prompt is constructed containing the current timestamp, their calendar events, and their emails. This prompt is hidden from the user but prepended to the conversation history, allowing `gemini-2.5-flash` to answer highly specific questions about their day and stream the response back using Server-Sent Events (SSE).
5. **AI Email Drafting:** If a user clicks "Draft Reply" on an email, the raw email context is sent to a dedicated `/api/draft` route, where `gemini-2.5-pro` drafts a professional reply based solely on the context of the sender's message.

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FlowDesk
   ```
2. **Configure Environment Variables:**
   Copy the example environment file to create your local environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the variables in `.env.local` using your Google Cloud Console credentials and Google AI Studio key.
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
5. **Open the App:** Navigate to `http://localhost:3000` to sign in.

---

## Deploy to Google Cloud Run

FlowDesk is optimized for containerized deployment on Google Cloud Run. Follow these steps to deploy:

1. **Install and Initialize Google Cloud SDK:**
   Make sure you have the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated.
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Set up Secrets in Cloud Run:**
   Before deploying, ensure you configure the environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GEMINI_API_KEY`) as Secrets in the Google Cloud Secret Manager or define them directly in the Cloud Run service configuration after the initial deployment.

3. **Deploy using the helper script:**
   A `deploy.sh` script is provided which triggers Google Cloud Build using the `cloudbuild.yaml` configuration.
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   *Alternatively, run the command manually:*
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

This will build a Docker image, push it to Google Container Registry, and deploy a managed, highly-available Cloud Run service in `us-central1` with `0` to `2` auto-scaling instances.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Your Google Cloud OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Cloud OAuth 2.0 Client Secret |
| `NEXTAUTH_SECRET` | A randomly generated 32-character string for NextAuth session encryption |
| `NEXTAUTH_URL` | Base URL of the application (e.g., `http://localhost:3000`) |
| `GEMINI_API_KEY` | Your Google Gemini API Key from Google AI Studio |

*Note: Ensure your Google Cloud OAuth consent screen has the `.../auth/gmail.readonly` and `.../auth/calendar.readonly` scopes explicitly enabled.*

---

## Assumptions Made

- **Inbox Management:** Users primarily rely on the `primary` inbox category to find their most important unread emails.
- **Calendar Usage:** Users only require visibility into their current day (midnight to midnight local time) to organize their immediate workload.
- **Stateless AI:** AI summaries, briefings, and chat histories are generated on the fly and do not need to be persistently saved to a database.
- **Email Parsing:** We assume standard plain-text email bodies can be extracted. For heavily formatted HTML emails, the system defaults to using the Gmail `snippet` to preserve Gemini context window limits and minimize token waste.

---

## Future Improvements

- **Full Read/Write Integration:** By expanding OAuth scopes, FlowDesk could allow users to directly archive, delete, or send drafted emails straight from the UI.
- **Multi-Day Planning:** Extend the calendar views and AI logic to analyze upcoming days or entire weeks, rather than strictly today.
- **Persistent Chat Context:** Connect a database (e.g., PostgreSQL or Redis) to save chat histories and user preferences, allowing the assistant to remember long-term context across sessions.
- **Customizable Assistant Personas:** Introduce user settings that allow tweaking the system prompt (e.g., "Respond in a more casual tone," "Keep answers under two sentences").
- **WebSocket Streaming:** Upgrade the Chat Panel streaming infrastructure to WebSockets for lower-latency messaging.
