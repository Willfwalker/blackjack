export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type Suit = "S" | "H" | "D" | "C";

export type Card = {
  id: string;
  rank: Rank;
  suit: Suit;
};

export type HandValue = {
  total: number;
  soft: boolean;
  blackjack: boolean;
  bust: boolean;
};

export const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const suits: Suit[] = ["S", "H", "D", "C"];
export const dealerUpcards: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];

export function cardPoint(rank: Rank) {
  if (rank === "A") return 11;
  if (["10", "J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

export function cardLabel(card: Card) {
  return `${card.rank}${card.suit}`;
}

export function blackjackValue(cardOrRank: Card | Rank) {
  const rank = typeof cardOrRank === "string" ? cardOrRank : cardOrRank.rank;
  return cardPoint(rank);
}

export function sameBlackjackValue(a: Rank, b: Rank) {
  return blackjackValue(a) === blackjackValue(b);
}

export function hiLoValue(rank: Rank) {
  if (["2", "3", "4", "5", "6"].includes(rank)) return 1;
  if (["10", "J", "Q", "K", "A"].includes(rank)) return -1;
  return 0;
}

export function makeShoe(deckCount = 6) {
  const cards: Card[] = [];

  for (let deck = 0; deck < deckCount; deck += 1) {
    for (const suit of suits) {
      for (const rank of ranks) {
        cards.push({ id: `${deck}-${rank}-${suit}`, rank, suit });
      }
    }
  }

  return shuffle(cards);
}

export function shuffle(cards: Card[]) {
  const next = [...cards];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function handValue(cards: Card[]): HandValue {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
    } else {
      total += cardPoint(card.rank);
    }
  }

  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces -= 1;
  }

  return {
    total,
    soft: softAces > 0,
    blackjack: cards.length === 2 && total === 21,
    bust: total > 21,
  };
}

export function formatCount(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}
