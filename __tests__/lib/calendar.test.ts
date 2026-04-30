jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn(),
    },
    calendar: jest.fn(),
  },
}));

import { detectConflictingEvents, parseCalendarEvents } from "@/lib/calendar";

describe("calendar helpers", () => {
  test("event parser returns correct shape", () => {
    const result = parseCalendarEvents([
      {
        id: "event-1",
        summary: "Design Review",
        start: { dateTime: "2026-05-01T09:00:00.000Z" },
        end: { dateTime: "2026-05-01T10:00:00.000Z" },
      },
    ]);

    expect(result).toEqual([
      {
        id: "event-1",
        title: "Design Review",
        start: "2026-05-01T09:00:00.000Z",
        end: "2026-05-01T10:00:00.000Z",
      },
    ]);
  });

  test("two overlapping time events are detected as conflicts", () => {
    const conflicts = detectConflictingEvents([
      {
        id: "event-1",
        title: "Interview",
        start: "2026-05-01T10:00:00.000Z",
        end: "2026-05-01T11:00:00.000Z",
      },
      {
        id: "event-2",
        title: "Client call",
        start: "2026-05-01T10:30:00.000Z",
        end: "2026-05-01T11:30:00.000Z",
      },
    ]);

    expect(conflicts).toContain("Interview conflicts with Client call");
  });
});
