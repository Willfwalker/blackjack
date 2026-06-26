"use client";

import { Coins } from "lucide-react";

export function BettingRail({
  bankroll,
  bet,
  disabled,
  onBetChange,
}: {
  bankroll: number;
  bet: number;
  disabled: boolean;
  onBetChange: (bet: number) => void;
}) {
  const chips = [5, 10, 25, 50, 100];

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-emerald-800" />
          <h2 className="text-lg font-black">Betting rail</h2>
        </div>
        <p className="text-sm font-black text-neutral-700">Bankroll: {bankroll} chips</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {chips.map((chip) => (
          <button
            type="button"
            key={chip}
            disabled={disabled || chip > bankroll}
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
