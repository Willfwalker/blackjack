import { dealerUpcards, ranks, type Rank } from "./cards";
import { recommendBasicStrategy } from "./strategy";
import { makeCardFromRank } from "./utils";

export type MistakeCategory =
  | "basic-strategy"
  | "count"
  | "true-count"
  | "bet-ramp"
  | "deviation"
  | "deck-estimation";

export type TrainingEvent = {
  category: MistakeCategory;
  correct: boolean;
  prompt: string;
  expected: string;
  actual?: string;
};

export function recommendedBetUnits(trueCount: number) {
  if (trueCount <= 1) return 1;
  if (trueCount === 2) return 2;
  if (trueCount === 3) return 4;
  if (trueCount === 4) return 6;
  if (trueCount === 5) return 8;
  return 10;
}

export function randomDealerUpcard(): Rank {
  return dealerUpcards[Math.floor(Math.random() * dealerUpcards.length)];
}

export function randomRank() {
  return ranks[Math.floor(Math.random() * ranks.length)];
}

export function makeStrategyFlashcard() {
  const dealer = randomDealerUpcard();
  const kind = Math.random();
  let cards;

  if (kind < 0.28) {
    const rank = randomRank();
    cards = [makeCardFromRank(rank, "S"), makeCardFromRank(rank, "H")];
  } else if (kind < 0.55) {
    cards = [makeCardFromRank("A", "S"), makeCardFromRank(randomRank(), "H")];
  } else {
    cards = [makeCardFromRank(randomRank(), "S"), makeCardFromRank(randomRank(), "H")];
  }

  const recommendation = recommendBasicStrategy(cards, dealer);
  return { cards, dealer, recommendation };
}

export function randomTrueCountScenario() {
  const running = Math.floor(Math.random() * 31) - 12;
  const deckOptions = [1, 1.5, 2, 3, 4, 5, 6];
  const decks = deckOptions[Math.floor(Math.random() * deckOptions.length)];
  return { running, decks, trueCount: Math.trunc(running / decks) };
}

export function randomBetRampScenario() {
  const trueCount = Math.floor(Math.random() * 10) - 3;
  return { trueCount, units: recommendedBetUnits(trueCount) };
}
