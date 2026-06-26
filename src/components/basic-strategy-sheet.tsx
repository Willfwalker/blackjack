"use client";

import { useState } from "react";
import { dealerUpcards } from "@/lib/blackjack/cards";
import {
  actionDescriptions,
  actionLabels,
  hardTotalChart,
  pairChart,
  softTotalChart,
  surrenderNotes,
  type StrategyAction,
  type StrategyChartRow,
} from "@/lib/blackjack/strategy";
import { rulesLabel } from "@/lib/blackjack/rules";

type SheetTab = "hard" | "soft" | "pairs";

const tabs: { id: SheetTab; label: string }[] = [
  { id: "hard", label: "Hard totals" },
  { id: "soft", label: "Soft totals" },
  { id: "pairs", label: "Pairs" },
];

function chartFor(tab: SheetTab): StrategyChartRow[] {
  if (tab === "soft") return softTotalChart;
  if (tab === "pairs") return pairChart;
  return hardTotalChart;
}

function actionClass(action: StrategyAction) {
  if (action === "H") return "strategy-hit";
  if (action === "S") return "strategy-stand";
  if (action === "D") return "strategy-double";
  if (action === "P") return "strategy-split";
  if (action === "R") return "strategy-surrender";
  return "strategy-insurance";
}

export function BasicStrategySheet() {
  const [tab, setTab] = useState<SheetTab>("hard");
  const chart = chartFor(tab);

  return (
    <section className="min-w-0 rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-800">The Book</p>
          <h2 className="mt-2 text-2xl font-black">Perfect basic strategy sheet</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
            Default rules: {rulesLabel()}. Read left to right: your hand on the left, dealer upcard across the top.
          </p>
        </div>
        <div className="inline-grid grid-cols-3 rounded-md border border-neutral-200 bg-neutral-100 p-1">
          {tabs.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`sheet-tab ${tab === item.id ? "sheet-tab-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 max-w-full overflow-x-auto">
        <table className="strategy-table">
          <thead>
            <tr>
              <th>Your hand</th>
              {dealerUpcards.map((upcard) => (
                <th key={upcard}>{upcard}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.map((row) => (
              <tr key={row.hand}>
                <th>{row.hand}</th>
                {dealerUpcards.map((upcard) => {
                  const action = row.values[upcard === "J" || upcard === "Q" || upcard === "K" ? "10" : upcard] as StrategyAction;
                  return (
                    <td key={`${row.hand}-${upcard}`}>
                      <span className={`strategy-cell ${actionClass(action)}`} title={actionLabels[action]}>
                        {action}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-neutral-600">Legend</h3>
          <div className="mt-3 grid gap-2 text-sm text-neutral-700">
            {(["H", "S", "D", "P", "R"] as StrategyAction[]).map((action) => (
              <p key={action}>
                <span className={`strategy-cell mr-2 ${actionClass(action)}`}>{action}</span>
                <strong>{actionLabels[action]}:</strong> {actionDescriptions[action]}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-neutral-200 bg-[#fffaf0] p-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-neutral-600">Surrender and insurance</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-neutral-700">
            {surrenderNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
