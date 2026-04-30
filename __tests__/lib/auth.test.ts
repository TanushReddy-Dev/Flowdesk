import { authOptions } from "@/lib/auth";

describe("auth token lifecycle", () => {
  const jwtCallback = authOptions.callbacks?.jwt;

  test("refreshes expired access token using refresh token", async () => {
    expect(jwtCallback).toBeDefined();

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "new-access-token",
        expires_in: 3600,
        refresh_token: "new-refresh-token",
      }),
    } as Response);

    const result = await jwtCallback!(
      {
        token: {
          accessToken: "expired-token",
          accessTokenExpires: Date.now() - 1000,
          refreshToken: "refresh-token",
        } as never,
        account: undefined,
        profile: undefined,
        user: undefined,
        trigger: "update",
        isNewUser: false,
        session: undefined,
      } as never
    );

    expect((result as any).accessToken).toBe("new-access-token");
    expect((result as any).refreshToken).toBe("new-refresh-token");
    expect((result as any).accessTokenExpires).toBeGreaterThan(Date.now());

    global.fetch = originalFetch;
  });
});
