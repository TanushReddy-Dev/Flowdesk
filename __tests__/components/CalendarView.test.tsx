import { render, screen } from "@testing-library/react";
import CalendarView from "@/components/CalendarView";

describe("CalendarView", () => {
  const events = [
    {
      id: "event-late",
      summary: "Late Event",
      startTime: "2026-05-01T12:00:00.000Z",
      endTime: "2026-05-01T13:00:00.000Z",
      location: "Room B",
    },
    {
      id: "event-early",
      summary: "Early Event",
      startTime: "2026-05-01T09:00:00.000Z",
      endTime: "2026-05-01T10:00:00.000Z",
      location: "Room A",
    },
  ];

  test("renders events sorted by start time", () => {
    render(
      <CalendarView
        events={events}
        loading={false}
        error=""
        conflicts={[]}
        onRetry={jest.fn()}
      />
    );

    const titles = screen
      .getAllByRole("heading", { level: 4 })
      .map((heading) => heading.textContent);

    expect(titles).toEqual(["Early Event", "Late Event"]);
  });

  test("renders empty state when events prop is []", () => {
    render(
      <CalendarView
        events={[]}
        loading={false}
        error=""
        conflicts={[]}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText("📅 No meetings today")).toBeInTheDocument();
  });

  test("conflicting events have a red indicator class", () => {
    render(
      <CalendarView
        events={events}
        loading={false}
        error=""
        conflicts={["Early Event overlaps"]}
        onRetry={jest.fn()}
      />
    );

    const conflictRow = screen.getByTestId("calendar-event-event-early");
    expect(conflictRow.className).toContain("border-red-200");
  });
});
