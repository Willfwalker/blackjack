import { Layers } from "lucide-react";
import { discardDecks, type BlackjackGameState } from "@/lib/blackjack/game";

export function DiscardTray({ state }: { state: BlackjackGameState }) {
  const decks = discardDecks(state);
  const fill = Math.min(100, (decks / state.rules.deckCount) * 100);

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-emerald-800" />
        <h2 className="text-lg font-black">Discard tray</h2>
      </div>
      <div className="mt-4 h-24 overflow-hidden rounded-md border border-neutral-300 bg-neutral-100">
        <div className="h-full bg-emerald-800 transition-all" style={{ width: `${fill}%` }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-700">
        {state.discard.length} cards discarded, about {decks.toFixed(1)} decks.
      </p>
    </section>
  );
}
