"use client";

import { Coins } from "lucide-react";

export function BettingRail({
  bankroll,
  bet,
  startingChips,
  tableMinBet,
  tableMaxBet,
  sessionChipsWon,
  sessionChipsLost,
  sessionHandsWon,
  sessionHandsLost,
  sessionHandsPushed,
  disabled,
  onBetChange,
}: {
  bankroll: number;
  bet: number;
  startingChips: number;
  tableMinBet: number;
  tableMaxBet: number;
  sessionChipsWon: number;
  sessionChipsLost: number;
  sessionHandsWon: number;
  sessionHandsLost: number;
  sessionHandsPushed: number;
  disabled: boolean;
  onBetChange: (bet: number) => void;
}) {
  const chips = [10, 25, 50, 75, 100];
  const net = bankroll - startingChips;

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-emerald-800" />
          <h2 className="text-lg font-black">Betting rail</h2>
        </div>
        <p className="text-sm font-black text-neutral-700">Total chips: {bankroll}</p>
      </div>
      <div className="mt-3 grid gap-2 text-sm font-bold text-neutral-700 sm:grid-cols-3">
        <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3">
          <span className="block text-xs font-black uppercase tracking-wide text-neutral-500">Table</span>
          <span className="mt-1 block">{tableMinBet} min / {tableMaxBet} max</span>
        </div>
        <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3">
          <span className="block text-xs font-black uppercase tracking-wide text-neutral-500">Session net</span>
          <span className={`mt-1 block ${net >= 0 ? "text-emerald-800" : "text-red-700"}`}>{net >= 0 ? "+" : ""}{net} chips</span>
        </div>
        <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3">
          <span className="block text-xs font-black uppercase tracking-wide text-neutral-500">Hands</span>
          <span className="mt-1 block">{sessionHandsWon} W / {sessionHandsLost} L / {sessionHandsPushed} P</span>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm font-bold text-neutral-700 sm:grid-cols-2">
        <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-emerald-900">
          Won: {sessionChipsWon} chips
        </div>
        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-red-900">
          Lost: {sessionChipsLost} chips
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {chips.map((chip) => (
          <button
            type="button"
            key={chip}
            disabled={disabled || chip > bankroll || chip < tableMinBet || chip > tableMaxBet}
            onClick={() => onBetChange(chip)}
            className={`chip-button ${bet === chip ? "chip-button-active" : ""}`}
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}
