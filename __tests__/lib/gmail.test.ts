jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn(),
    },
    gmail: jest.fn(),
  },
}));

import { parseGmailMessages } from "@/lib/gmail";

describe("gmail parser", () => {
  test("email parser returns correct shape", () => {
    const result = parseGmailMessages([
      {
        id: "email-1",
        snippet: "Short preview",
        payload: {
          headers: [
            { name: "Subject", value: "Status update" },
            { name: "From", value: "Alice <alice@example.com>" },
          ],
        },
      },
    ]);

    expect(result).toEqual([
      {
        id: "email-1",
        subject: "Status update",
        sender: "Alice <alice@example.com>",
        snippet: "Short preview",
      },
    ]);
  });

  test("empty array input returns empty array output", () => {
    expect(parseGmailMessages([])).toEqual([]);
  });
});
