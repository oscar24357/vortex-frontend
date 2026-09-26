"use client";

import type { Solver } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";
import { formatUsdCompact, localeToBcp47 } from "@/lib/format";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { sanitizeDisplayText } from "@/lib/textSafety";

function truncateAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 8)}...${address.slice(-13)}`;
}

export function SolverHeaderCard({ solver }: { solver: Solver }) {
  const locale = useLocale();
  const bcp47 = localeToBcp47(locale);

  return (
    <div className="card p-4 sm:p-6 space-y-4 sm:space-y-6 mb-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <div className="eyebrow mb-1 sm:mb-2 text-xs">Solver</div>
          <h1 className="text-lg sm:text-2xl font-bold text-vx-text break-words">
            {sanitizeDisplayText(solver.name)}
          </h1>
        </div>
        <div
          className={`flex-shrink-0 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${
            solver.status === "active"
              ? "bg-vx-sage-bg text-vx-sage border-vx-sage/30"
              : "bg-vx-surface text-vx-muted border-vx-border"
          }`}
          aria-label={`Solver status: ${solver.status}`}
        >
          {solver.status === "active" ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs sm:text-sm text-vx-muted font-mono break-all">
        <span>Address: {truncateAddress(solver.address)}</span>
        <CopyButton value={solver.address} label="Copy solver address" />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Fills", value: solver.fills },
          { label: "Failed", value: solver.failed },
          { label: "Success Rate", value: `${solver.successRatePct}%` },
          {
            label: "Total Volume",
            value: formatUsdCompact(solver.volumeUsd, bcp47),
          },
          {
            label: "Avg Fill Time",
            value: `${solver.avgFillTimeSeconds}s`,
          },
          { label: "Bond", value: formatUsdCompact(solver.bondUsd, bcp47) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-vx-surface/40 rounded-lg p-3">
            <div className="eyebrow text-[10px] sm:text-xs mb-1">
              {label}
            </div>
            <div className="num text-xs sm:text-sm font-semibold text-vx-text">
              {value}
            </div>
          </div>
        ))}
        <div className="bg-vx-surface/40 rounded-lg p-3">
          <div className="eyebrow text-[10px] sm:text-xs mb-1">Status</div>
          <div className="flex items-center">
            <div
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                solver.status === "active"
                  ? "bg-vx-sage-bg text-vx-sage border-vx-sage/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {solver.status}
            </div>
          </div>
        </div>
      </div>

      {/* Chain coverage */}
      <div className="pt-3 sm:pt-4 border-t border-vx-border">
        <h2 className="eyebrow text-xs mb-2">Supported Chains</h2>
        <div className="flex flex-wrap gap-2">
          {solver.chains && solver.chains.length > 0 ? (
            solver.chains.map((chain) => (
              <span
                key={chain}
                className="text-xs px-2 py-1 bg-vx-surface rounded text-vx-text border border-vx-border"
              >
                {chain}
              </span>
            ))
          ) : (
            <span className="text-xs text-vx-muted">
              No chains supported yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
