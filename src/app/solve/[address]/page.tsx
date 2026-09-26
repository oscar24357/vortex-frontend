"use client";

import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { SolverHeaderCard } from "@/components/SolverHeaderCard";
import { SolverTimeline } from "@/components/SolverTimeline";
import { SolverFillHistory } from "@/components/SolverFillHistory";
import { useSolver } from "@/hooks/useSolver";
import { useIntentFeed } from "@/hooks/useIntentFeed";
import { isValidStellarPublicKey } from "@/lib/stellarAddress";

export default function SolverDetailPage({ params }: { params: { address: string } }) {
  const isValidAddress = isValidStellarPublicKey(params.address);
  const { solver, isLoading, error } = useSolver(isValidAddress ? params.address : null);
  const { items: fillHistory, isLoading: historyLoading } = useIntentFeed();

  return (
    <div className="min-h-screen">
      <Nav
        variant="breadcrumb"
        label={`Solver ${params.address.slice(0, 8)}`}
      />

      <main
        id="main-content"
        className="max-w-3xl mx-auto px-3 sm:px-5 py-8 sm:py-12"
      >
        <Link
          href="/solve"
          tabIndex={-1}
          className="text-xs text-vx-sage hover:underline mb-6 inline-block focus:outline-none focus:ring-2 focus:ring-vx-sage focus:ring-offset-2 focus:ring-offset-vx-ink rounded"
        >
          ← Back to solvers
        </Link>

        {!isValidAddress ? (
          <EmptyState variant="error" message="Invalid solver address format." />
        ) : isLoading ? (
          <div
            className="card p-6 sm:p-8 space-y-3 animate-pulse"
            data-testid="skeleton"
          >
            <div className="h-6 w-2/3 bg-vx-surface rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-vx-surface rounded animate-pulse" />
            <SkeletonCard rows={2} />
          </div>
        ) : error ? (
          <EmptyState variant="error" message="Couldn't load solver details right now. Try again shortly." />
        ) : !solver ? (
          <EmptyState variant="error" message="No solver found at that address." />
        ) : (
          <>
            {/* Header card */}
            <SolverHeaderCard solver={solver} />

            {/* ── Solver Timeline ─────────────────────────────────────────── */}
            <div className="mb-6">
              <SolverTimeline
                solverAddress={solver.address}
                fills={fillHistory}
                isLoading={historyLoading && fillHistory.length === 0}
              />
            </div>

            {/* ── Fill history table ──────────────────────────────────────── */}
            <SolverFillHistory solverAddress={solver.address} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
