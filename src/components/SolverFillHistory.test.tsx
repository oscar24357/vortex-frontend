import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { FeedItem } from "@/lib/types";

const useIntentFeedMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useIntentFeed", () => ({ useIntentFeed: useIntentFeedMock }));
vi.mock("@/lib/i18n/I18nProvider", () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        "solverDetail.fillHistory.empty.title": "No fills yet",
        "solverDetail.fillHistory.empty.message":
          "Once this solver starts accepting and filling intents, their history will appear here.",
      };
      return map[k] ?? k;
    },
  }),
}));

import { SolverFillHistory } from "./SolverFillHistory";

const SOLVER_ADDRESS = "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING";
const OTHER_ADDRESS = "GDIFFERENTSOLVERADDRESS000000000000000000000000000000000";

const makeFill = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: "fill-1",
  srcChain: "ethereum",
  srcToken: "USDC",
  srcAmount: "500",
  dstToken: "XLM",
  solver: SOLVER_ADDRESS,
  status: "filled",
  createdAt: new Date(Date.now() - 60_000).toISOString(),
  ...overrides,
});

describe("SolverFillHistory", () => {
  it("shows a loading skeleton while fetching", () => {
    useIntentFeedMock.mockReturnValue({
      items: [],
      isLoading: true,
      error: undefined,
    });
    const { container } = render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows an error state when the feed fails", () => {
    useIntentFeedMock.mockReturnValue({
      items: [],
      isLoading: false,
      error: new Error("boom"),
    });
    render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Couldn't load fill history/);
  });

  it("shows an empty state when no fills match the solver address", () => {
    useIntentFeedMock.mockReturnValue({
      items: [makeFill({ solver: OTHER_ADDRESS })],
      isLoading: false,
      error: undefined,
    });
    render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    expect(screen.getByText("No fills yet")).toBeInTheDocument();
  });

  it("renders the heading", () => {
    useIntentFeedMock.mockReturnValue({ items: [], isLoading: false, error: undefined });
    render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    expect(screen.getByText("Recent Fills by Solver")).toBeInTheDocument();
  });

  it("renders fill rows for the matching solver", () => {
    useIntentFeedMock.mockReturnValue({
      items: [makeFill(), makeFill({ id: "fill-2", srcAmount: "100", solver: OTHER_ADDRESS })],
      isLoading: false,
      error: undefined,
    });
    render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    // Only the fill belonging to SOLVER_ADDRESS should appear
    expect(screen.getByText("500 USDC → XLM")).toBeInTheDocument();
    expect(screen.queryAllByText(/100 USDC → XLM/).length).toBe(0);
  });

  it("filters out fills from other solvers", () => {
    const fills: FeedItem[] = [
      makeFill({ id: "f1", solver: SOLVER_ADDRESS }),
      makeFill({ id: "f2", solver: OTHER_ADDRESS, srcAmount: "999" }),
    ];
    useIntentFeedMock.mockReturnValue({ items: fills, isLoading: false, error: undefined });
    render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    expect(screen.queryByText(/999/)).not.toBeInTheDocument();
  });

  it("caps displayed fills at 10", () => {
    const fills = Array.from({ length: 15 }, (_, i) =>
      makeFill({ id: `f${i}`, srcAmount: String(i + 1) }),
    );
    useIntentFeedMock.mockReturnValue({ items: fills, isLoading: false, error: undefined });
    render(<SolverFillHistory solverAddress={SOLVER_ADDRESS} />);
    // Each row shows "{amount} USDC → XLM" — only first 10 should appear
    const rows = screen.getAllByText(/USDC → XLM/);
    expect(rows.length).toBe(10);
  });
});
