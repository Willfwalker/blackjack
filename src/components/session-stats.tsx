import { BarChart3, XCircle } from "lucide-react";
import type { TrainingEvent } from "@/lib/blackjack/training";

export function SessionStats({ events, handsPlayed }: { events: TrainingEvent[]; handsPlayed: number }) {
  const attempts = events.length;
  const correct = events.filter((event) => event.correct).length;
  const accuracy = attempts === 0 ? 100 : Math.round((correct / attempts) * 100);
  const misses = events.filter((event) => !event.correct).slice(-5).reverse();

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-emerald-800" />
        <h2 className="text-lg font-black">Session stats</h2>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Hands" value={`${handsPlayed}`} />
        <Stat label="Checks" value={`${attempts}`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
      </div>

      <div className="mt-4">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-neutral-500">
          <XCircle className="h-4 w-4" />
          Recent misses
        </h3>
        {misses.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {misses.map((miss, index) => (
              <div key={`${miss.prompt}-${index}`} className="rounded-md border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-950">
                <p className="font-black">{miss.prompt}</p>
                <p>Expected {miss.expected}, chose {miss.actual ?? "nothing"}.</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-neutral-600">No mistakes logged yet.</p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3">
      <p className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
