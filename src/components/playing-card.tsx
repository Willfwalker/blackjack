import type { Card, Rank } from "@/lib/blackjack/cards";

export function PlayingCard({ card, compact = false, hidden = false }: { card?: Card; compact?: boolean; hidden?: boolean }) {
  if (hidden || !card) {
    return (
      <div className={`card-face card-back ${compact ? "h-24 w-16" : "h-32 w-24"}`}>
        <span className="text-xs font-black uppercase tracking-wide text-emerald-50">Hidden</span>
      </div>
    );
  }

  const red = card.suit === "H" || card.suit === "D";

  return (
    <div className={`card-face ${red ? "text-red-700" : "text-neutral-950"} ${compact ? "h-24 w-16" : "h-32 w-24"}`}>
      <span className="text-lg font-black">{card.rank}</span>
      <span className="text-xs font-semibold tracking-[0.24em]">{card.suit}</span>
      <span className="text-3xl font-black">{card.rank}</span>
      <span className="self-end text-xs font-semibold tracking-[0.24em]">{card.suit}</span>
    </div>
  );
}

export function RankPlayingCard({ rank, label }: { rank: Rank; label?: string }) {
  const card: Card = { id: `rank-${rank}`, rank, suit: "S" };
  return (
    <div className="grid gap-2">
      <PlayingCard card={card} compact={false} hidden={false} />
      {label ? <span className="text-center text-xs font-black uppercase tracking-wide text-neutral-500">{label}</span> : null}
    </div>
  );
}
