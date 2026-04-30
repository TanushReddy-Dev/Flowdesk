/** @jest-environment node */

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/gemini", () => ({
  generateDailyBriefing: jest.fn(),
}));

import { getServerSession } from "next-auth/next";
import { generateDailyBriefing } from "@/lib/gemini";
import { POST as postBriefing } from "@/app/api/briefing/route";

const mockedSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedGenerateDailyBriefing = generateDailyBriefing as jest.MockedFunction<
  typeof generateDailyBriefing
>;

describe("POST /api/briefing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns fallback briefing when Gemini is unavailable", async () => {
    mockedSession.mockResolvedValue({ user: { name: "Test" } } as never);
    mockedGenerateDailyBriefing.mockRejectedValue(new Error("gemini down"));

    const request = new Request("http://localhost/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emails: [{ subject: "Follow up", sender: "a@example.com", snippet: "Need update" }],
        events: [{ summary: "Standup", startTime: "2026-05-01T09:00:00.000Z" }],
      }),
    });

    const response = await postBriefing(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.briefing).toBeDefined();
    expect(Array.isArray(body.briefing.priorities)).toBe(true);
  });
});
