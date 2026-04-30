/** @jest-environment node */

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  test("returns HTTP 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  test('response body contains { status: "ok" }', async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  test("response body contains a timestamp field", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.timestamp).toBeDefined();
  });
});
