"use client";

import { Eye, EyeOff } from "lucide-react";
import { decksRemaining, discardDecks, recommendedCurrentBet, trueCount, type BlackjackGameState } from "@/lib/blackjack/game";
import { formatCount } from "@/lib/blackjack/cards";

export function CountHud({
  state,
  visible,
  onToggle,
}: {
  state: BlackjackGameState;
  visible: boolean;
  onToggle: () => void;
}) {
  const tc = trueCount(state);

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-800">Count HUD</p>
          <h2 className="text-lg font-black">Training cheat sheet</h2>
        </div>
        <button type="button" onClick={onToggle} className="secondary-button">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {visible ? "Hide" : "Reveal"}
        </button>
      </div>

      {visible ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HudStat label="Running count" value={formatCount(state.runningCount)} />
          <HudStat label="True count" value={formatCount(tc)} />
          <HudStat label="Decks left" value={decksRemaining(state).toFixed(1)} />
          <HudStat label="Suggested bet" value={`${recommendedCurrentBet(state)} chips`} />
          <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3 sm:col-span-2 xl:col-span-4">
            <p className="text-xs font-black uppercase tracking-wide text-neutral-500">Hi-Lo tags</p>
            <p className="mt-2 text-sm font-semibold text-neutral-700">
              2-6 = +1, 7-9 = 0, 10-A = -1. Discard tray: {discardDecks(state).toFixed(1)} decks.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-[#fbfaf7] p-4 text-sm font-semibold text-neutral-600">
          HUD hidden. Play from memory, then reveal when you want to check the count.
        </div>
      )}
    </section>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3">
      <p className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-neutral-950">{value}</p>
    </div>
  );
}
