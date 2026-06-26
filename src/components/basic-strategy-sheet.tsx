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
  const [lookupHand, setLookupHand] = useState(hardTotalChart[0].hand);
  const [lookupDealer, setLookupDealer] = useState("10");
  const chart = chartFor(tab);
  const lookupRow = chart.find((row) => row.hand === lookupHand) ?? chart[0];
  const lookupAction = lookupRow.values[lookupDealer] as StrategyAction;

  function changeTab(nextTab: SheetTab) {
    setTab(nextTab);
    setLookupHand(chartFor(nextTab)[0].hand);
  }

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
              onClick={() => changeTab(item.id)}
              className={`sheet-tab ${tab === item.id ? "sheet-tab-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-md border border-emerald-100 bg-emerald-50 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <div>
          <label htmlFor="strategy-hand" className="text-xs font-black uppercase tracking-wide text-emerald-800">
            Your hand
          </label>
          <select
            id="strategy-hand"
            value={lookupRow.hand}
            onChange={(event) => setLookupHand(event.target.value)}
            className="strategy-select mt-2"
          >
            {chart.map((row) => (
              <option key={row.hand} value={row.hand}>
                {row.hand}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="strategy-dealer" className="text-xs font-black uppercase tracking-wide text-emerald-800">
            Dealer upcard
          </label>
          <select
            id="strategy-dealer"
            value={lookupDealer}
            onChange={(event) => setLookupDealer(event.target.value)}
            className="strategy-select mt-2"
          >
            {dealerUpcards.map((upcard) => (
              <option key={upcard} value={upcard === "J" || upcard === "Q" || upcard === "K" ? "10" : upcard}>
                {upcard}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Book says</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-black text-neutral-950">
            <span className={`strategy-cell ${actionClass(lookupAction)}`}>{lookupAction}</span>
            {actionLabels[lookupAction]}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-neutral-700">{actionDescriptions[lookupAction]}</p>
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
