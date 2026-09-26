import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Solver } from "@/lib/types";

vi.mock("@/lib/i18n/I18nProvider", () => ({
  useLocale: () => "en",
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/lib/format", () => ({
  localeToBcp47: (l: string) => (l === "es" ? "es-419" : "en-US"),
  formatUsdCompact: (v: number) => `$${v}`,
}));

import { SolverHeaderCard } from "./SolverHeaderCard";

const solver: Solver = {
  name: "AlphaMax",
  address: "GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING",
  bondUsd: 500,
  fills: 42,
  failed: 1,
  volumeUsd: 125_000,
  avgFillTimeSeconds: 12,
  successRatePct: 97.67,
  chains: ["ethereum", "polygon"],
  status: "active",
};

describe("SolverHeaderCard", () => {
  it("renders the solver name", () => {
    render(<SolverHeaderCard solver={solver} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("AlphaMax");
  });

  it("shows an active status badge for an active solver", () => {
    render(<SolverHeaderCard solver={solver} />);
    const badge = screen.getByLabelText(/Solver status:/);
    expect(badge).toHaveTextContent("Active");
    expect(badge).toHaveClass("bg-vx-sage-bg");
    expect(badge).toHaveClass("text-vx-sage");
  });

  it("shows an inactive status badge for an inactive solver", () => {
    render(<SolverHeaderCard solver={{ ...solver, status: "inactive" }} />);
    const badge = screen.getByLabelText(/Solver status:/);
    expect(badge).toHaveTextContent("Inactive");
    expect(badge).toHaveClass("bg-vx-surface");
    expect(badge).toHaveClass("text-vx-muted");
  });

  it("renders the solver address", () => {
    render(<SolverHeaderCard solver={solver} />);
    expect(screen.getByText(/GBRPYHIL2CI3WHZDTOOQFC6EB4CGQOFN4QO5JTJVSXBLEDSOMETHING/)).toBeInTheDocument();
  });

  it("renders a copy button for the solver address", () => {
    render(<SolverHeaderCard solver={solver} />);
    expect(screen.getByRole("button", { name: /copy solver address/i })).toBeInTheDocument();
  });

  it("copies solver address to clipboard when copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<SolverHeaderCard solver={solver} />);
    await userEvent.click(screen.getByRole("button", { name: /copy solver address/i }));

    expect(writeText).toHaveBeenCalledWith(solver.address);
  });

  it("renders all metric labels", () => {
    render(<SolverHeaderCard solver={solver} />);
    expect(screen.getByText("Fills")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Success Rate")).toBeInTheDocument();
    expect(screen.getByText("Total Volume")).toBeInTheDocument();
    expect(screen.getByText("Avg Fill Time")).toBeInTheDocument();
    expect(screen.getByText("Bond")).toBeInTheDocument();
  });

  it("renders metric values", () => {
    render(<SolverHeaderCard solver={solver} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("97.67%")).toBeInTheDocument();
    expect(screen.getByText("12s")).toBeInTheDocument();
  });

  it("renders supported chains", () => {
    render(<SolverHeaderCard solver={solver} />);
    expect(screen.getByText("Supported Chains")).toBeInTheDocument();
    expect(screen.getByText("ethereum")).toBeInTheDocument();
    expect(screen.getByText("polygon")).toBeInTheDocument();
  });

  it("shows a fallback when no chains are supported", () => {
    render(<SolverHeaderCard solver={{ ...solver, chains: [] }} />);
    expect(screen.getByText("No chains supported yet")).toBeInTheDocument();
  });
});
