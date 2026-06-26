import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TrainingTools } from "@/components/training-tools";

export const metadata = {
  title: "Training Tools | Blackjack Counting Lab",
  description: "Practice basic strategy, deck estimation, bet ramps, deviations, true counts, and shoe counting.",
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="icon-text-button w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>
          <p className="mt-6 text-sm font-black uppercase tracking-wide text-emerald-800">Training suite</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-normal sm:text-5xl">
            Drill the skills that break at a real table.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
            Basic strategy, deck estimation, bet ramps, true counts, deviations, and shoe-counting practice in one place.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TrainingTools />
      </section>
    </main>
  );
}
