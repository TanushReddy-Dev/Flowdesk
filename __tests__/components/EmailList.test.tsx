import { render, screen } from "@testing-library/react";
import EmailList from "@/components/EmailList";

describe("EmailList", () => {
  const emails = [
    {
      id: "e1",
      sender: "Alex <alex@example.com>",
      subject: "Kickoff notes",
      snippet: "Here are the notes...",
      timestamp: "2026-05-01T10:00:00.000Z",
    },
    {
      id: "e2",
      sender: "Jamie <jamie@example.com>",
      subject: "Budget review",
      snippet: "Can we review budget?",
      timestamp: "2026-05-01T11:00:00.000Z",
    },
  ];

  test("renders correct number of email items from props", () => {
    render(
      <EmailList
        emails={emails}
        loading={false}
        error=""
        onDraftReply={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText("Kickoff notes")).toBeInTheDocument();
    expect(screen.getByText("Budget review")).toBeInTheDocument();
  });

  test("renders empty state UI when emails prop is []", () => {
    render(
      <EmailList
        emails={[]}
        loading={false}
        error=""
        onDraftReply={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText("✉️ Your inbox is all clear!")).toBeInTheDocument();
  });

  test('each email item has a "Draft Reply" button', () => {
    render(
      <EmailList
        emails={emails}
        loading={false}
        error=""
        onDraftReply={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    const draftButtons = screen.getAllByRole("button", { name: /draft reply/i });
    expect(draftButtons).toHaveLength(emails.length);
  });
});
