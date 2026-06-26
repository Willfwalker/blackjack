"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  activeHand,
  dealerVisibleCards,
  decksRemaining,
  discardDecks,
  recommendedCurrentBet,
  trueCount,
  type BlackjackGameState,
} from "@/lib/blackjack/game";
import { formatCount } from "@/lib/blackjack/cards";
import { recommendBasicStrategy, recommendCountAwareStrategy } from "@/lib/blackjack/strategy";

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
  const advice = countAdvice(state, tc);

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
          <HudStat label="Decks left" value={decksRemaining(state).toFixed(1)} className="hidden sm:block" />
          <HudStat label="Suggested bet" value={`${recommendedCurrentBet(state)} chips`} />
          <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 sm:col-span-2 xl:col-span-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-800">What to do from the count</p>
            <p className="mt-1 text-xl font-black text-emerald-950">{advice.title}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900">{advice.note}</p>
          </div>
          <details className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3 sm:col-span-2 xl:col-span-4">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-neutral-600">
              Hi-Lo tags and deck details
            </summary>
            <p className="mt-2 text-sm font-semibold text-neutral-700">
              2-6 = +1, 7-9 = 0, 10-A = -1. Decks left: {decksRemaining(state).toFixed(1)}. Discard tray: {discardDecks(state).toFixed(1)} decks.
            </p>
          </details>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-[#fbfaf7] p-4 text-sm font-semibold text-neutral-600">
          HUD hidden. Play from memory, then reveal when you want to check the count.
        </div>
      )}
    </section>
  );
}

function countAdvice(state: BlackjackGameState, tc: number) {
  const hand = activeHand(state);
  const dealer = dealerVisibleCards(state)[0];

  if (state.phase === "insurance" && dealer?.rank === "A") {
    if (tc >= 3) {
      return {
        title: "Take insurance",
        note: `True count is ${formatCount(tc)}. Insurance becomes profitable at TC +3 or higher in the Hi-Lo system.`,
      };
    }

    return {
      title: "Decline insurance",
      note: `True count is ${formatCount(tc)}. Below TC +3, insurance is still a bad side bet.`,
    };
  }

  if (!hand || !dealer || state.phase !== "player") {
    return {
      title: "Deal a hand",
      note: "The HUD will show the count-aware play once you have an active hand and dealer upcard.",
    };
  }

  const canDouble = hand.cards.length === 2;
  const canSplit = hand.cards.length === 2 && state.playerHands.length < state.rules.maxSplitHands;
  const basic = recommendBasicStrategy(hand.cards, dealer.rank, { canDouble, canSplit });
  const countAware = recommendCountAwareStrategy(hand.cards, dealer.rank, tc, {
    canDouble,
    canSplit,
    allowInsurance: false,
  });
  const isDeviation = basic.action !== countAware.action;

  return {
    title: countAware.label,
    note: isDeviation
      ? `Count deviation: ${countAware.note} Basic strategy would say ${basic.label}.`
      : `No count deviation here at TC ${formatCount(tc)}. ${countAware.note}`,
  };
}

function HudStat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-md border border-neutral-200 bg-[#fbfaf7] p-3 ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-neutral-950">{value}</p>
    </div>
  );
}
