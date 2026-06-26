import { BookOpen } from "lucide-react";
import { currentStrategyText, type BlackjackGameState } from "@/lib/blackjack/game";

export function StrategyPanel({ state, visible }: { state: BlackjackGameState; visible: boolean }) {
  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-emerald-800" />
        <h2 className="text-lg font-black">Book recommendation</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-700">
        {visible ? currentStrategyText(state) : "Hidden with the HUD. Reveal the trainer when you want a hint."}
      </p>
    </section>
  );
}
