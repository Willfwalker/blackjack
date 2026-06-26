export type BlackjackRules = {
  deckCount: number;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  lateSurrender: boolean;
  blackjackPayout: "3:2";
  maxSplitHands: number;
  cutCardPenetration: number;
};

export const defaultRules: BlackjackRules = {
  deckCount: 6,
  dealerHitsSoft17: true,
  doubleAfterSplit: true,
  lateSurrender: true,
  blackjackPayout: "3:2",
  maxSplitHands: 2,
  cutCardPenetration: 0.75,
};

export function rulesLabel(rules = defaultRules) {
  return `${rules.deckCount}D ${rules.dealerHitsSoft17 ? "H17" : "S17"} ${
    rules.doubleAfterSplit ? "DAS" : "No DAS"
  } ${rules.lateSurrender ? "LS" : "No surrender"} ${rules.blackjackPayout}`;
}
