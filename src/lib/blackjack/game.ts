import {
  blackjackValue,
  cardLabel,
  formatCount,
  handValue,
  hiLoValue,
  makeShoe,
  sameBlackjackValue,
  type Card,
} from "./cards";
import { defaultRules, type BlackjackRules } from "./rules";
import { recommendBasicStrategy } from "./strategy";
import { recommendedBetUnits } from "./training";

export type GamePhase = "betting" | "insurance" | "player" | "dealer" | "roundOver";
export type HandStatus = "playing" | "stood" | "bust" | "surrendered" | "doubled";
export type RoundResult = "win" | "lose" | "push" | "blackjack" | "surrender" | "bust";

export type PlayerHand = {
  id: string;
  cards: Card[];
  bet: number;
  status: HandStatus;
  result?: RoundResult;
};

export type BlackjackGameState = {
  rules: BlackjackRules;
  shoe: Card[];
  discard: Card[];
  seenCards: Card[];
  runningCount: number;
  startingChips: number;
  tableMinBet: number;
  tableMaxBet: number;
  bankroll: number;
  baseBet: number;
  insuranceBet: number;
  roundStartingBankroll: number;
  sessionChipsWon: number;
  sessionChipsLost: number;
  sessionHandsWon: number;
  sessionHandsLost: number;
  sessionHandsPushed: number;
  phase: GamePhase;
  activeHandIndex: number;
  playerHands: PlayerHand[];
  dealerCards: Card[];
  dealerHoleRevealed: boolean;
  message: string;
  mistakes: string[];
  handsPlayed: number;
};

export type GameAction =
  | { type: "hydrate"; state: BlackjackGameState }
  | { type: "setBet"; amount: number }
  | { type: "deal" }
  | { type: "insurance"; take: boolean }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" }
  | { type: "split" }
  | { type: "surrender" }
  | { type: "nextRound" }
  | { type: "reset" };

export const TABLE_MIN_BET = 10;
export const TABLE_MAX_BET = 100;
export const STARTING_CHIPS = 2000;
const DEFAULT_BET = TABLE_MIN_BET;

export function createInitialGameState(): BlackjackGameState {
  return {
    rules: defaultRules,
    shoe: makeShoe(defaultRules.deckCount),
    discard: [],
    seenCards: [],
    runningCount: 0,
    startingChips: STARTING_CHIPS,
    tableMinBet: TABLE_MIN_BET,
    tableMaxBet: TABLE_MAX_BET,
    bankroll: STARTING_CHIPS,
    baseBet: DEFAULT_BET,
    insuranceBet: 0,
    roundStartingBankroll: STARTING_CHIPS,
    sessionChipsWon: 0,
    sessionChipsLost: 0,
    sessionHandsWon: 0,
    sessionHandsLost: 0,
    sessionHandsPushed: 0,
    phase: "betting",
    activeHandIndex: 0,
    playerHands: [],
    dealerCards: [],
    dealerHoleRevealed: false,
    message: "Set your bet, then deal a six-deck H17 DAS late-surrender shoe.",
    mistakes: [],
    handsPlayed: 0,
  };
}

export function trueCount(state: BlackjackGameState) {
  return Math.trunc(state.runningCount / Math.max(decksRemaining(state), 0.5));
}

export function decksRemaining(state: BlackjackGameState) {
  return Math.max(state.shoe.length / 52, 0.1);
}

export function discardDecks(state: BlackjackGameState) {
  return state.discard.length / 52;
}

export function activeHand(state: BlackjackGameState) {
  return state.playerHands[state.activeHandIndex];
}

export function dealerVisibleCards(state: BlackjackGameState) {
  return state.dealerHoleRevealed ? state.dealerCards : state.dealerCards.slice(0, 1);
}

export function recommendedCurrentBet(state: BlackjackGameState) {
  return Math.min(state.tableMaxBet, recommendedBetUnits(trueCount(state)) * state.tableMinBet);
}

function clampBet(state: BlackjackGameState, amount: number) {
  return Math.max(state.tableMinBet, Math.min(amount, state.tableMaxBet, state.bankroll));
}

export function gameReducer(state: BlackjackGameState, action: GameAction): BlackjackGameState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "setBet":
      return state.phase === "betting"
        ? { ...state, baseBet: clampBet(state, action.amount) }
        : state;
    case "deal":
      return dealRound(state);
    case "insurance":
      return resolveInsurance(state, action.take);
    case "hit":
      return playerHit(state);
    case "stand":
      return advanceHand({ ...markActiveHand(state, "stood"), message: "Stand." });
    case "double":
      return playerDouble(state);
    case "split":
      return playerSplit(state);
    case "surrender":
      return playerSurrender(state);
    case "nextRound":
      return prepareNextRound(state);
    case "reset":
      return createInitialGameState();
    default:
      return state;
  }
}

function draw(state: BlackjackGameState, visible: boolean) {
  const [card, ...shoe] = state.shoe;
  if (!card) {
    const fresh = makeShoe(state.rules.deckCount);
    const [freshCard, ...freshShoe] = fresh;
    return {
      card: freshCard,
      state: {
        ...state,
        shoe: freshShoe,
        discard: [],
        seenCards: visible ? [freshCard] : [],
        runningCount: visible ? hiLoValue(freshCard.rank) : 0,
      },
    };
  }

  return {
    card,
    state: {
      ...state,
      shoe,
      seenCards: visible ? [...state.seenCards, card] : state.seenCards,
      runningCount: visible ? state.runningCount + hiLoValue(card.rank) : state.runningCount,
    },
  };
}

function dealRound(state: BlackjackGameState): BlackjackGameState {
  if (state.phase !== "betting") return state;
  if (state.bankroll < state.tableMinBet) {
    return { ...state, message: `You need at least ${state.tableMinBet} chips to sit at this table.` };
  }

  let next = state;
  const cutCardCards = Math.floor(next.rules.deckCount * 52 * (1 - next.rules.cutCardPenetration));
  const reshuffled = next.shoe.length < cutCardCards;

  if (reshuffled) {
    next = {
      ...next,
      shoe: makeShoe(next.rules.deckCount),
      discard: [],
      seenCards: [],
      runningCount: 0,
    };
  }

  const p1 = draw(next, true);
  const d1 = draw(p1.state, true);
  const p2 = draw(d1.state, true);
  const d2 = draw(p2.state, false);
  next = d2.state;

  const playerCards = [p1.card, p2.card];
  const dealerCards = [d1.card, d2.card];
  const bet = Math.min(next.baseBet, next.bankroll);
  next = {
    ...next,
    bankroll: next.bankroll - bet,
    roundStartingBankroll: next.bankroll,
    insuranceBet: 0,
    phase: "player",
    activeHandIndex: 0,
    playerHands: [{ id: "hand-1", cards: playerCards, bet, status: "playing" }],
    dealerCards,
    dealerHoleRevealed: false,
    message: `${reshuffled ? "Cut card reached. New shoe. " : ""}Deal complete.`,
    handsPlayed: next.handsPlayed + 1,
  };

  const dealerUpValue = blackjackValue(dealerCards[0]);
  const dealerHasBlackjack = handValue(dealerCards).blackjack;
  const playerHasBlackjack = handValue(playerCards).blackjack;

  if (dealerCards[0].rank === "A" && !playerHasBlackjack) {
    return { ...next, phase: "insurance", message: "Dealer shows an ace. Take or decline insurance." };
  }

  if (dealerUpValue === 10 && dealerHasBlackjack) {
    return settleRound(revealDealerHole(next), "Dealer has blackjack.");
  }

  if (playerHasBlackjack) {
    return settleRound(next, "Player blackjack.");
  }

  return next;
}

function resolveInsurance(state: BlackjackGameState, take: boolean): BlackjackGameState {
  if (state.phase !== "insurance") return state;

  const insuranceBet = take ? Math.min(state.playerHands[0].bet / 2, state.bankroll) : 0;
  let next = {
    ...state,
    bankroll: state.bankroll - insuranceBet,
    insuranceBet,
  };

  next = revealDealerHole(next);
  if (handValue(next.dealerCards).blackjack) {
    const insuranceMessage = insuranceBet > 0 ? "Insurance paid 2:1. " : "";
    return settleRound(
      { ...next, bankroll: next.bankroll + insuranceBet * 3 },
      `${insuranceMessage}Dealer has blackjack.`,
    );
  }

  return { ...next, phase: "player", message: insuranceBet > 0 ? "Insurance loses. Play the hand." : "No dealer blackjack. Play the hand." };
}

function revealDealerHole(state: BlackjackGameState): BlackjackGameState {
  if (state.dealerHoleRevealed || state.dealerCards.length < 2) return state;
  const hole = state.dealerCards[1];
  return {
    ...state,
    dealerHoleRevealed: true,
    seenCards: [...state.seenCards, hole],
    runningCount: state.runningCount + hiLoValue(hole.rank),
  };
}

function markActiveHand(state: BlackjackGameState, status: HandStatus): BlackjackGameState {
  return {
    ...state,
    playerHands: state.playerHands.map((hand, index) =>
      index === state.activeHandIndex ? { ...hand, status } : hand,
    ),
  };
}

function replaceActiveHand(state: BlackjackGameState, hand: PlayerHand): BlackjackGameState {
  return {
    ...state,
    playerHands: state.playerHands.map((item, index) => (index === state.activeHandIndex ? hand : item)),
  };
}

function playerHit(state: BlackjackGameState): BlackjackGameState {
  if (state.phase !== "player") return state;
  const hand = activeHand(state);
  if (!hand || hand.status !== "playing") return state;

  const dealt = draw(state, true);
  const nextHand = { ...hand, cards: [...hand.cards, dealt.card] };
  const value = handValue(nextHand.cards);
  const next = replaceActiveHand(dealt.state, {
    ...nextHand,
    status: value.bust ? "bust" : "playing",
    result: value.bust ? "bust" : undefined,
  });

  return value.bust ? advanceHand({ ...next, message: `Bust with ${value.total}.` }) : { ...next, message: `Hit: ${cardLabel(dealt.card)}.` };
}

function playerDouble(state: BlackjackGameState): BlackjackGameState {
  if (state.phase !== "player") return state;
  const hand = activeHand(state);
  if (!hand || hand.cards.length !== 2 || state.bankroll < hand.bet) return state;

  const dealt = draw({ ...state, bankroll: state.bankroll - hand.bet }, true);
  const nextHand = { ...hand, cards: [...hand.cards, dealt.card], bet: hand.bet * 2 };
  const value = handValue(nextHand.cards);
  const next = replaceActiveHand(dealt.state, {
    ...nextHand,
    status: value.bust ? "bust" : "doubled",
    result: value.bust ? "bust" : undefined,
  });

  return advanceHand({ ...next, message: value.bust ? `Double card busts: ${value.total}.` : "Double complete." });
}

function playerSplit(state: BlackjackGameState): BlackjackGameState {
  if (state.phase !== "player") return state;
  const hand = activeHand(state);
  if (
    !hand ||
    hand.cards.length !== 2 ||
    state.playerHands.length >= state.rules.maxSplitHands ||
    !sameBlackjackValue(hand.cards[0].rank, hand.cards[1].rank) ||
    state.bankroll < hand.bet
  ) {
    return state;
  }

  const first = draw({ ...state, bankroll: state.bankroll - hand.bet }, true);
  const second = draw(first.state, true);
  const handA: PlayerHand = { id: `${hand.id}-a`, cards: [hand.cards[0], first.card], bet: hand.bet, status: "playing" };
  const handB: PlayerHand = { id: `${hand.id}-b`, cards: [hand.cards[1], second.card], bet: hand.bet, status: "playing" };

  return {
    ...second.state,
    playerHands: [handA, handB],
    activeHandIndex: 0,
    message: "Split into two hands.",
  };
}

function playerSurrender(state: BlackjackGameState): BlackjackGameState {
  if (state.phase !== "player" || !state.rules.lateSurrender) return state;
  const hand = activeHand(state);
  if (!hand || hand.cards.length !== 2) return state;

  return advanceHand({
    ...replaceActiveHand(state, { ...hand, status: "surrendered", result: "surrender" }),
    bankroll: state.bankroll + hand.bet / 2,
    message: "Late surrender: half the bet returned.",
  });
}

function advanceHand(state: BlackjackGameState): BlackjackGameState {
  const nextIndex = state.playerHands.findIndex((hand, index) => index > state.activeHandIndex && hand.status === "playing");

  if (nextIndex >= 0) {
    return { ...state, activeHandIndex: nextIndex };
  }

  if (state.playerHands.every((hand) => hand.status === "bust" || hand.status === "surrendered")) {
    return settleRound(state, "All player hands are complete.");
  }

  return playDealer(state);
}

function playDealer(state: BlackjackGameState): BlackjackGameState {
  let next = revealDealerHole({ ...state, phase: "dealer" });
  let dealerValue = handValue(next.dealerCards);

  while (dealerValue.total < 17 || (dealerValue.total === 17 && dealerValue.soft && next.rules.dealerHitsSoft17)) {
    const dealt = draw(next, true);
    next = { ...dealt.state, dealerCards: [...dealt.state.dealerCards, dealt.card] };
    dealerValue = handValue(next.dealerCards);
  }

  return settleRound(next, dealerValue.bust ? "Dealer busts." : `Dealer stands on ${dealerValue.total}.`);
}

function settleRound(state: BlackjackGameState, message: string): BlackjackGameState {
  const next = revealDealerHole(state);
  const dealer = handValue(next.dealerCards);
  let bankroll = next.bankroll;
  let handsWon = 0;
  let handsLost = 0;
  let handsPushed = 0;

  const settledHands = next.playerHands.map((hand) => {
    const player = handValue(hand.cards);
    let result: RoundResult = "lose";

    if (hand.status === "surrendered") {
      result = "surrender";
    } else if (player.bust) {
      result = "bust";
    } else if (player.blackjack && !dealer.blackjack) {
      result = "blackjack";
      bankroll += hand.bet * 2.5;
    } else if (dealer.blackjack && !player.blackjack) {
      result = "lose";
    } else if (dealer.bust || player.total > dealer.total) {
      result = "win";
      bankroll += hand.bet * 2;
    } else if (player.total === dealer.total) {
      result = "push";
      bankroll += hand.bet;
    }

    if (result === "win" || result === "blackjack") {
      handsWon += 1;
    } else if (result === "push") {
      handsPushed += 1;
    } else {
      handsLost += 1;
    }

    return { ...hand, status: hand.status === "playing" ? "stood" : hand.status, result };
  });
  const roundNet = bankroll - next.roundStartingBankroll;

  return {
    ...next,
    bankroll,
    sessionChipsWon: next.sessionChipsWon + Math.max(roundNet, 0),
    sessionChipsLost: next.sessionChipsLost + Math.max(-roundNet, 0),
    sessionHandsWon: next.sessionHandsWon + handsWon,
    sessionHandsLost: next.sessionHandsLost + handsLost,
    sessionHandsPushed: next.sessionHandsPushed + handsPushed,
    phase: "roundOver",
    playerHands: settledHands,
    message,
  };
}

function prepareNextRound(state: BlackjackGameState): BlackjackGameState {
  if (state.phase !== "roundOver") return state;

  return {
    ...state,
    discard: [...state.discard, ...state.playerHands.flatMap((hand) => hand.cards), ...state.dealerCards],
    insuranceBet: 0,
    baseBet: clampBet(state, state.baseBet),
    phase: "betting",
    activeHandIndex: 0,
    playerHands: [],
    dealerCards: [],
    dealerHoleRevealed: false,
    message: `Next hand. Suggested bet: ${recommendedCurrentBet(state)} chips at TC ${formatCount(trueCount(state))}.`,
  };
}

export function currentStrategyText(state: BlackjackGameState) {
  const hand = activeHand(state);
  const dealer = dealerVisibleCards(state)[0];

  if (!hand || !dealer || state.phase !== "player") return "Deal a hand to see the book play.";

  const recommendation = recommendBasicStrategy(hand.cards, dealer.rank, {
    canDouble: hand.cards.length === 2,
    canSplit: hand.cards.length === 2 && state.playerHands.length < state.rules.maxSplitHands,
  });

  return `${recommendation.label}: ${recommendation.note}`;
}
