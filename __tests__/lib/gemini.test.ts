jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(),
      startChat: jest.fn(),
    })),
  })),
}));

describe("gemini helpers", () => {
  test("gemini client initializes without throwing", async () => {
    const previous = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-api-key";
    jest.resetModules();

    expect(() => {
      const { getGeminiModel } = require("@/lib/gemini");
      getGeminiModel();
    }).not.toThrow();

    process.env.GEMINI_API_KEY = previous;
  });

  test("prompt helper returns a non-empty string", async () => {
    const { buildDailyBriefingPrompt } = await import("@/lib/gemini");
    const prompt = buildDailyBriefingPrompt(
      [{ sender: "test@example.com", subject: "Hi", snippet: "Hello" }],
      [{ id: "event-1", title: "Standup" }]
    );

    expect(typeof prompt).toBe("string");
    expect(prompt.trim().length).toBeGreaterThan(0);
  });
});
