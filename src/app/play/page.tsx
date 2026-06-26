import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlackjackTable } from "@/components/blackjack-table";

export const metadata = {
  title: "Play Blackjack | Blackjack Counting Lab",
  description: "Practice a six-deck blackjack table with count HUD, strategy hints, bankroll, and mistake review.",
};

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="hidden border-b border-neutral-200 bg-white md:block">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="icon-text-button w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <BlackjackTable />
      </section>
    </main>
  );
}
