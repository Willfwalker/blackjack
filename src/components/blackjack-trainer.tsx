import { BookOpen, Brain, ChevronRight, History, Play, ShieldAlert, Sparkles, Target, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { lessons, researchSources } from "@/lib/lessons";

const hubCards: { href: string; title: string; copy: string; icon: LucideIcon }[] = [
  {
    href: "/play",
    title: "Play the table",
    copy: "Full six-deck blackjack with count HUD, chips, surrender, splits, doubles, and mistake review.",
    icon: Play,
  },
  {
    href: "/tools",
    title: "Training tools",
    copy: "Animated Hi-Lo dealing, strategy flashcards, deck estimation, bet ramps, deviations, and shoe counting.",
    icon: Brain,
  },
  {
    href: "/learn",
    title: "Learn the system",
    copy: `${lessons.length} researched lessons covering basic strategy, counting theory, bankroll, deviations, and casino realities.`,
    icon: BookOpen,
  },
  {
    href: "/learn/perfect-blackjack-without-counting",
    title: "Perfect blackjack first",
    copy: "Start with the book: hit, stand, double, split, surrender, and insurance for the default rules.",
    icon: Target,
  },
];

export function BlackjackTrainer() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Blackjack Counting Lab
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-normal text-neutral-950 sm:text-5xl">
              Learn Hi-Lo card counting with live blackjack practice.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
              A browser-only trainer for basic strategy, running count, true count conversion, bet ramp thinking, and the first high-value deviations.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {hubCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="curriculum-card">
                <Icon className="h-6 w-6 flex-none text-emerald-800" />
                <span className="min-w-0">
                  <span className="block text-lg font-black">{card.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-neutral-700">{card.copy}</span>
                </span>
                <ChevronRight className="ml-auto h-5 w-5 flex-none text-neutral-500" />
              </Link>
            );
          })}
        </div>

        <aside className="grid h-fit gap-4">
          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-800" />
              <h2 className="text-lg font-black">Session-only</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Practice state stays in session storage and cookies. There is no account, database, or persistent profile.
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
              <h2 className="text-lg font-black">Practice notes</h2>
            </div>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-neutral-700">
              <li>Best used for live-dealt shoe games, not continuously shuffled online games.</li>
              <li>Card counting can be legal, but casinos can still refuse service.</li>
              <li>This trainer is educational and does not promise profit.</li>
            </ul>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Research base</h2>
            <div className="mt-3 grid gap-2">
              {researchSources.slice(0, 5).map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-emerald-700 hover:text-emerald-800"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
