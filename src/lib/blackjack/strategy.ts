import { dealerUpcards, handValue, sameBlackjackValue, type Card, type Rank } from "./cards";

export type StrategyAction = "H" | "S" | "D" | "P" | "R" | "I";

export type StrategyRecommendation = {
  action: StrategyAction;
  label: string;
  note: string;
};

export type StrategyChartRow = {
  hand: string;
  values: Record<string, StrategyAction>;
};

export const actionLabels: Record<StrategyAction, string> = {
  H: "Hit",
  S: "Stand",
  D: "Double",
  P: "Split",
  R: "Surrender",
  I: "Insurance",
};

export const actionDescriptions: Record<StrategyAction, string> = {
  H: "Take another card.",
  S: "Keep the hand as-is.",
  D: "Double the bet, take exactly one card, then stand.",
  P: "Split the pair into two hands.",
  R: "Late surrender if available; otherwise use the fallback play.",
  I: "Take insurance only as a count-based deviation.",
};

const upcards = dealerUpcards.map((rank) => rank.toString());

function row(hand: string, values: StrategyAction[]): StrategyChartRow {
  return {
    hand,
    values: Object.fromEntries(upcards.map((upcard, index) => [upcard, values[index]])),
  };
}

export const hardTotalChart: StrategyChartRow[] = [
  row("17+", ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]),
  row("16", ["S", "S", "S", "S", "S", "H", "H", "R", "R", "R"]),
  row("15", ["S", "S", "S", "S", "S", "H", "H", "H", "R", "H"]),
  row("14", ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"]),
  row("13", ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"]),
  row("12", ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"]),
  row("11", ["D", "D", "D", "D", "D", "D", "D", "D", "D", "H"]),
  row("10", ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"]),
  row("9", ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"]),
  row("5-8", ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]),
];

export const softTotalChart: StrategyChartRow[] = [
  row("A,9", ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]),
  row("A,8", ["S", "S", "S", "S", "D", "S", "S", "S", "S", "S"]),
  row("A,7", ["S", "D", "D", "D", "D", "S", "S", "H", "H", "H"]),
  row("A,6", ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"]),
  row("A,5", ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"]),
  row("A,4", ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"]),
  row("A,3", ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"]),
  row("A,2", ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"]),
];

export const pairChart: StrategyChartRow[] = [
  row("A,A", ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"]),
  row("10,10", ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]),
  row("9,9", ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"]),
  row("8,8", ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"]),
  row("7,7", ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"]),
  row("6,6", ["P", "P", "P", "P", "P", "H", "H", "H", "H", "H"]),
  row("5,5", ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"]),
  row("4,4", ["H", "H", "H", "P", "P", "H", "H", "H", "H", "H"]),
  row("3,3", ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"]),
  row("2,2", ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"]),
];

export const surrenderNotes = [
  "Surrender hard 16 vs dealer 9, 10, or A.",
  "Surrender hard 15 vs dealer 10.",
  "If surrender is not available, fall back to hit or stand from the non-surrender chart.",
  "Never take insurance from basic strategy alone; insurance becomes a count deviation at high true counts.",
];

function dealerValue(dealer: Rank) {
  return dealer === "A" ? 11 : ["10", "J", "Q", "K"].includes(dealer) ? 10 : Number(dealer);
}

function dealerKey(dealer: Rank) {
  return dealerValue(dealer) === 10 ? "10" : dealer;
}

function pairHandKey(rank: Rank) {
  if (["10", "J", "Q", "K"].includes(rank)) return "10,10";
  return `${rank},${rank}`;
}

function hardHandKey(total: number) {
  if (total >= 17) return "17+";
  if (total <= 8) return "5-8";
  return `${total}`;
}

function softHandKey(cards: Card[], total: number) {
  const nonAce = cards.find((card) => card.rank !== "A");
  if (!nonAce || total >= 20) return "A,9";
  const other = total - 11;
  if (other <= 2) return "A,2";
  if (other >= 9) return "A,9";
  return `A,${other}`;
}

function lookup(chart: StrategyChartRow[], hand: string, dealer: Rank) {
  const found = chart.find((item) => item.hand === hand);
  return found?.values[dealerKey(dealer)] ?? "H";
}

export function recommendBasicStrategy(cards: Card[], dealer: Rank, options: { canSplit?: boolean; canDouble?: boolean } = {}) {
  const value = handValue(cards);
  const canSplit = options.canSplit ?? cards.length === 2;
  const canDouble = options.canDouble ?? cards.length === 2;
  let action: StrategyAction;
  let note = "";

  if (value.blackjack) {
    action = "S";
    note = "Blackjack is already complete.";
  } else if (canSplit && cards.length === 2 && sameBlackjackValue(cards[0].rank, cards[1].rank)) {
    action = lookup(pairChart, pairHandKey(cards[0].rank), dealer);
    note = "Pair chart: check splits before hard totals.";
  } else if (value.soft && value.total <= 20) {
    action = lookup(softTotalChart, softHandKey(cards, value.total), dealer);
    note = "Soft-total chart: ace can still count as 11.";
  } else {
    action = lookup(hardTotalChart, hardHandKey(value.total), dealer);
    note = "Hard-total chart.";
  }

  if (action === "D" && !canDouble) {
    action = value.total >= 17 ? "S" : "H";
    note = "Double is unavailable after the first two cards, so use the fallback play.";
  }

  return {
    action,
    label: actionLabels[action],
    note: `${note} ${actionDescriptions[action]}`,
  };
}

export function recommendCountAwareStrategy(cards: Card[], dealer: Rank, trueCount: number, options?: { canSplit?: boolean; canDouble?: boolean }) {
  const value = handValue(cards);
  const dealerTen = dealerValue(dealer) === 10;

  if (dealer === "A" && trueCount >= 3) {
    return { action: "I" as StrategyAction, label: "Insurance", note: "Index play: take insurance at true count +3 or higher." };
  }

  if (!value.soft && value.total === 16 && dealerTen && trueCount >= 0) {
    return { action: "S" as StrategyAction, label: "Stand", note: "Index play: stand on hard 16 vs 10 at TC 0 or higher." };
  }

  if (!value.soft && value.total === 15 && dealerTen && trueCount >= 4) {
    return { action: "S" as StrategyAction, label: "Stand", note: "Index play: stand on hard 15 vs 10 at TC +4 or higher." };
  }

  return recommendBasicStrategy(cards, dealer, options);
}
