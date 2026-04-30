import { render, screen } from "@testing-library/react";
import DayBriefing from "@/components/DayBriefing";

describe("DayBriefing", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  test("renders loading skeleton when data is null", () => {
    render(<DayBriefing briefing={null} loading={true} error="" onRetry={jest.fn()} />);
    expect(screen.getByText("Generating Daily Briefing...")).toBeInTheDocument();
  });

  test("renders summary text when data is provided", () => {
    render(
      <DayBriefing
        briefing={{
          summary: "You have two critical meetings today.",
          priorities: ["Prepare roadmap review"],
          conflicts: [],
          suggestedFocus: "Finish planning docs by noon.",
        }}
        loading={false}
        error=""
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText("You have two critical meetings today.")).toBeInTheDocument();
  });

  test("renders error message when fetch fails", () => {
    render(<DayBriefing briefing={null} loading={false} error="Failed request" onRetry={jest.fn()} />);
    expect(screen.getByText("⚠️ Couldn't load your briefing.")).toBeInTheDocument();
  });
});
