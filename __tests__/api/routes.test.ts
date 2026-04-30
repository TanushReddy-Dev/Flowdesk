/** @jest-environment node */

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/gmail", () => ({
  fetchUnreadEmails: jest.fn(),
}));

jest.mock("@/lib/calendar", () => ({
  fetchTodayEvents: jest.fn(),
}));

jest.mock("@/lib/gemini", () => ({
  generateEmailSummary: jest.fn(),
  getGeminiModel: jest.fn(),
}));

import { getServerSession } from "next-auth/next";
import { fetchUnreadEmails } from "@/lib/gmail";
import { fetchTodayEvents } from "@/lib/calendar";
import { generateEmailSummary, getGeminiModel } from "@/lib/gemini";
import { GET as gmailGet } from "@/app/api/gmail/route";
import { GET as calendarGet } from "@/app/api/calendar/route";
import { POST as chatPost } from "@/app/api/chat/route";

const mockedSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedFetchUnreadEmails = fetchUnreadEmails as jest.MockedFunction<typeof fetchUnreadEmails>;
const mockedFetchTodayEvents = fetchTodayEvents as jest.MockedFunction<typeof fetchTodayEvents>;
const mockedGenerateEmailSummary = generateEmailSummary as jest.MockedFunction<typeof generateEmailSummary>;
const mockedGetGeminiModel = getGeminiModel as jest.MockedFunction<typeof getGeminiModel>;

describe("API route behaviors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSession.mockResolvedValue({ accessToken: "token" } as never);
  });

  test("GET /api/gmail returns 200 with summarized emails", async () => {
    mockedFetchUnreadEmails.mockResolvedValue([
      {
        id: "e1",
        sender: "alice@example.com",
        subject: "Hello",
        snippet: "Snippet",
        timestamp: "2026-05-01T10:00:00.000Z",
        bodyText: "Email body",
      },
    ] as never);
    mockedGenerateEmailSummary.mockResolvedValue("One-line summary");

    const response = await gmailGet();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.emails[0].summary).toBe("One-line summary");
  });

  test("GET /api/gmail returns 503 when Gmail API fails", async () => {
    mockedFetchUnreadEmails.mockRejectedValue(new Error("upstream down"));
    const response = await gmailGet();
    expect(response.status).toBe(503);
  });

  test("GET /api/calendar returns 200 with events", async () => {
    mockedFetchTodayEvents.mockResolvedValue([
      {
        id: "c1",
        summary: "Standup",
        startTime: "2026-05-01T09:00:00.000Z",
        endTime: "2026-05-01T09:30:00.000Z",
      },
    ] as never);

    const response = await calendarGet();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.events).toHaveLength(1);
  });

  test("GET /api/calendar returns 503 when Calendar API fails", async () => {
    mockedFetchTodayEvents.mockRejectedValue(new Error("calendar down"));
    const response = await calendarGet();
    expect(response.status).toBe(503);
  });

  test("POST /api/chat returns 400 for invalid JSON body", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{invalid-json",
    });

    const response = await chatPost(request);
    expect(response.status).toBe(400);
  });

  test("POST /api/chat returns 400 for invalid messages format", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: "not-array" }),
    });

    const response = await chatPost(request);
    expect(response.status).toBe(400);
  });

  test("POST /api/chat returns 503 when Gemini initialization fails", async () => {
    mockedGetGeminiModel.mockImplementation(() => {
      throw new Error("gemini unavailable");
    });

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });

    const response = await chatPost(request);
    expect(response.status).toBe(503);
  });
});
