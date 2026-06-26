import type { Card, Rank, Suit } from "./cards";

export function makeCardFromRank(rank: Rank, suit: Suit, id?: string): Card {
  return {
    id: id ?? `training-${rank}-${suit}-${Math.random().toString(36).slice(2)}`,
    rank,
    suit,
  };
}
