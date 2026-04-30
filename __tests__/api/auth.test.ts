/** @jest-environment node */

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

import { getServerSession } from "next-auth/next";
import { GET as getGmail } from "@/app/api/gmail/route";
import { GET as getCalendar } from "@/app/api/calendar/route";
import { POST as postChat } from "@/app/api/chat/route";

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe("unauthenticated API auth guards", () => {
  beforeEach(() => {
    mockedGetServerSession.mockResolvedValue(null);
  });

  test("GET /api/gmail returns 401 when unauthenticated", async () => {
    const response = await getGmail();
    expect(response.status).toBe(401);
  });

  test("GET /api/calendar returns 401 when unauthenticated", async () => {
    const response = await getCalendar();
    expect(response.status).toBe(401);
  });

  test("POST /api/chat returns 401 when unauthenticated", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });

    const response = await postChat(request);
    expect(response.status).toBe(401);
  });
});
