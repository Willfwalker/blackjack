"use client";

import { useEffect, useReducer, useState } from "react";
import { CircleHelp, RotateCcw, ShieldCheck, Shuffle } from "lucide-react";
import { PlayingCard } from "@/components/playing-card";
import { BettingRail } from "@/components/betting-rail";
import { CountHud } from "@/components/count-hud";
import { DiscardTray } from "@/components/discard-tray";
import { SessionStats } from "@/components/session-stats";
import { StrategyPanel } from "@/components/strategy-panel";
import { formatCount, handValue, type Card } from "@/lib/blackjack/cards";
import {
  activeHand,
  createInitialGameState,
  dealerVisibleCards,
  gameReducer,
  trueCount,
  type BlackjackGameState,
  type GameAction,
} from "@/lib/blackjack/game";
import { recommendBasicStrategy, recommendCountAwareStrategy, type StrategyAction } from "@/lib/blackjack/strategy";
import type { TrainingEvent } from "@/lib/blackjack/training";

const PLAY_STATS_KEY = "blackjack-play-session-stats";
const PLAY_STATE_KEY = "blackjack-play-table-state";

export function BlackjackTable() {
  const [state, dispatchBase] = useReducer(gameReducer, undefined, createInitialGameState);
  const [hudVisible, setHudVisible] = useState(true);
  const [actionHelpOpen, setActionHelpOpen] = useState(false);
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [stateRestored, setStateRestored] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const rawStats = window.sessionStorage.getItem(PLAY_STATS_KEY);
      if (rawStats) {
        try {
          const parsed = JSON.parse(rawStats) as TrainingEvent[];
          if (Array.isArray(parsed)) setEvents(parsed);
        } catch {
          setEvents([]);
        }
      }

      const rawState = window.sessionStorage.getItem(PLAY_STATE_KEY);
      if (rawState) {
        try {
          const parsed = JSON.parse(rawState) as BlackjackGameState;
          if (isStoredGameState(parsed)) dispatchBase({ type: "hydrate", state: parsed });
        } catch {
          window.sessionStorage.removeItem(PLAY_STATE_KEY);
        }
      }
      setStateRestored(true);
    });
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(PLAY_STATS_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (!stateRestored) return;
    window.sessionStorage.setItem(PLAY_STATE_KEY, JSON.stringify(state));
  }, [state, stateRestored]);

  function dispatch(action: GameAction) {
    dispatchBase(action);
  }

  function recordAction(action: StrategyAction, label: string) {
    const hand = activeHand(state);
    const dealer = dealerVisibleCards(state)[0];
    if (!hand || !dealer || state.phase !== "player") return;

    const recommendation = recommendBasicStrategy(hand.cards, dealer.rank, {
      canDouble: hand.cards.length === 2,
      canSplit: hand.cards.length === 2,
    });

    setEvents((previous) => [
      ...previous,
      {
        category: "basic-strategy",
        correct: recommendation.action === action,
        prompt: `${hand.cards.map((card) => card.rank).join(",")} vs ${dealer.rank}`,
        expected: recommendation.label,
        actual: label,
      },
    ]);
  }

  function handlePlayerAction(action: GameAction, strategyAction: StrategyAction, label: string) {
    recordAction(strategyAction, label);
    dispatch(action);
  }

  function handleInsurance(take: boolean) {
    setEvents((previous) => [
      ...previous,
      {
        category: "deviation",
        correct: !take,
        prompt: "Insurance without count signal",
        expected: "Decline",
        actual: take ? "Take" : "Decline",
      },
    ]);
    dispatch({ type: "insurance", take });
  }

  function resetAll() {
    window.sessionStorage.removeItem(PLAY_STATS_KEY);
    window.sessionStorage.removeItem(PLAY_STATE_KEY);
    setEvents([]);
    setActionHelpOpen(false);
    dispatch({ type: "reset" });
  }

  function randomizeShoe() {
    setActionHelpOpen(false);
    dispatch({ type: "randomizeShoe" });
  }

  const dealerCards = state.dealerHoleRevealed ? state.dealerCards : state.dealerCards.length > 0 ? [state.dealerCards[0], undefined] : [];
  const current = activeHand(state);
  const actionHelp = getActionHelp(state);

  return (
    <div className="grid gap-6">
      <section className="blackjack-felt rounded-md border border-emerald-950 p-4 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-100">Live table practice</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">Six-deck blackjack table</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">
              3:2 blackjack, H17, DAS, late surrender. Practice real game flow with the count HUD on or hidden.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={randomizeShoe}
              disabled={state.phase !== "betting" && state.phase !== "roundOver"}
              className="table-light-button"
            >
              <Shuffle className="h-4 w-4" />
              Random spot
            </button>
            <button type="button" onClick={resetAll} className="table-light-button">
              <RotateCcw className="h-4 w-4" />
              Reset table
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <TableHand title="Dealer" cards={dealerCards} value={state.dealerHoleRevealed ? handValue(state.dealerCards).total : undefined} />

          <div className="grid gap-4 lg:grid-cols-2">
            {state.playerHands.length > 0 ? (
              state.playerHands.map((hand, index) => (
                <div
                  key={hand.id}
                  className={`table-hand ${index === state.activeHandIndex && state.phase === "player" ? "table-hand-active" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black uppercase tracking-wide text-emerald-100">
                      Player hand {index + 1}
                    </h3>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-black">
                      {hand.result ?? hand.status} - {hand.bet} chips
                    </span>
                  </div>
                  <div className="mt-3 flex min-h-28 flex-wrap gap-3">
                    {hand.cards.map((card) => (
                      <PlayingCard key={card.id} card={card} compact />
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-bold text-emerald-50">Total: {handValue(hand.cards).total}</p>
                </div>
              ))
            ) : (
              <div className="table-hand">
                <h3 className="text-sm font-black uppercase tracking-wide text-emerald-100">Player</h3>
                <div className="mt-3 flex min-h-28 items-center justify-center rounded-md border border-dashed border-white/30 text-sm font-black uppercase tracking-wide text-emerald-100">
                  Place a bet and deal
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="table-action-panel mt-6 rounded-md bg-black/25 p-4">
          <div className="table-action-status-row">
            <p className="flex min-w-0 items-center gap-2 text-sm font-black text-emerald-50">
              <ShieldCheck className="h-4 w-4 flex-none" />
              <span className="min-w-0">{state.message}</span>
            </p>
            <button
              type="button"
              aria-label="Show count decision help"
              aria-expanded={actionHelpOpen}
              onClick={() => setActionHelpOpen((open) => !open)}
              className="table-help-button"
            >
              <CircleHelp className="h-4 w-4" />
            </button>
          </div>

          {actionHelpOpen ? (
            <div className="action-help-popover">
              <HelpStat label="RC" value={actionHelp.runningCount} />
              <HelpStat label="TC" value={actionHelp.trueCount} />
              <HelpStat label="Book says" value={actionHelp.book} />
              <HelpStat label="Counting logic" value={actionHelp.countLogic} />
            </div>
          ) : null}

          <div className="table-action-buttons mt-4 flex flex-wrap gap-2">
            {state.phase === "betting" ? (
              <button
                type="button"
                disabled={state.bankroll < state.tableMinBet}
                onClick={() => dispatch({ type: "deal" })}
                className="table-action-button"
              >
                Deal
              </button>
            ) : null}
            {state.phase === "insurance" ? (
              <>
                <button type="button" onClick={() => handleInsurance(true)} className="table-action-button">
                  Take insurance
                </button>
                <button type="button" onClick={() => handleInsurance(false)} className="table-action-button">
                  Decline
                </button>
              </>
            ) : null}
            {state.phase === "player" && current ? (
              <>
                <button type="button" onClick={() => handlePlayerAction({ type: "hit" }, "H", "Hit")} className="table-action-button">
                  Hit
                </button>
                <button type="button" onClick={() => handlePlayerAction({ type: "stand" }, "S", "Stand")} className="table-action-button">
                  Stand
                </button>
                <button
                  type="button"
                  disabled={current.cards.length !== 2 || state.bankroll < current.bet}
                  onClick={() => handlePlayerAction({ type: "double" }, "D", "Double")}
                  className="table-action-button"
                >
                  Double
                </button>
                <button
                  type="button"
                  disabled={current.cards.length !== 2 || state.playerHands.length >= state.rules.maxSplitHands}
                  onClick={() => handlePlayerAction({ type: "split" }, "P", "Split")}
                  className="table-action-button"
                >
                  Split
                </button>
                <button
                  type="button"
                  disabled={current.cards.length !== 2}
                  onClick={() => handlePlayerAction({ type: "surrender" }, "R", "Surrender")}
                  className="table-action-button"
                >
                  Surrender
                </button>
              </>
            ) : null}
            {state.phase === "roundOver" ? (
              <button type="button" onClick={() => dispatch({ type: "nextRound" })} className="table-action-button">
                Next round
              </button>
            ) : null}
          </div>
        </div>
        <div className="mobile-play-spacer" aria-hidden="true" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6">
          <BettingRail
            bankroll={state.bankroll}
            bet={state.baseBet}
            startingChips={state.startingChips}
            tableMinBet={state.tableMinBet}
            tableMaxBet={state.tableMaxBet}
            sessionChipsWon={state.sessionChipsWon}
            sessionChipsLost={state.sessionChipsLost}
            sessionHandsWon={state.sessionHandsWon}
            sessionHandsLost={state.sessionHandsLost}
            sessionHandsPushed={state.sessionHandsPushed}
            disabled={state.phase !== "betting"}
            onBetChange={(amount) => dispatch({ type: "setBet", amount })}
          />
          <CountHud state={state} visible={hudVisible} onToggle={() => setHudVisible((currentValue) => !currentValue)} />
          <StrategyPanel state={state} visible={hudVisible} />
        </div>
        <div className="grid h-fit gap-6">
          <DiscardTray state={state} />
          <SessionStats events={events} handsPlayed={state.handsPlayed} />
        </div>
      </div>
    </div>
  );
}

function getActionHelp(state: BlackjackGameState) {
  const tc = trueCount(state);
  const dealer = dealerVisibleCards(state)[0];
  const hand = activeHand(state);

  if (state.phase === "insurance" && dealer?.rank === "A") {
    return {
      runningCount: formatCount(state.runningCount),
      trueCount: formatCount(tc),
      book: "Decline insurance",
      countLogic: tc >= 3 ? "Take insurance at TC +3 or higher" : "Decline insurance below TC +3",
    };
  }

  if (state.phase === "player" && hand && dealer) {
    const canDouble = hand.cards.length === 2;
    const canSplit = hand.cards.length === 2 && state.playerHands.length < state.rules.maxSplitHands;
    const book = recommendBasicStrategy(hand.cards, dealer.rank, { canDouble, canSplit });
    const counting = recommendCountAwareStrategy(hand.cards, dealer.rank, tc, {
      canDouble,
      canSplit,
      allowInsurance: false,
    });

    return {
      runningCount: formatCount(state.runningCount),
      trueCount: formatCount(tc),
      book: book.label,
      countLogic: counting.action === book.action ? `${counting.label} - no count deviation` : counting.label,
    };
  }

  return {
    runningCount: formatCount(state.runningCount),
    trueCount: formatCount(tc),
    book: state.phase === "roundOver" ? "Next round" : "Deal the hand",
    countLogic: state.phase === "betting" ? `Bet ${state.baseBet} or use the suggested ramp` : "No active decision",
  };
}

function HelpStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] font-black uppercase tracking-wide text-emerald-100">{label}</p>
      <p className="mt-0.5 text-xs font-black leading-4 text-white">{value}</p>
    </div>
  );
}

function isStoredGameState(value: BlackjackGameState) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray(value.shoe) &&
      Array.isArray(value.discard) &&
      Array.isArray(value.playerHands) &&
      Array.isArray(value.dealerCards) &&
      typeof value.bankroll === "number" &&
      typeof value.startingChips === "number" &&
      typeof value.tableMinBet === "number" &&
      typeof value.tableMaxBet === "number" &&
      typeof value.sessionChipsWon === "number" &&
      typeof value.sessionChipsLost === "number" &&
      typeof value.phase === "string",
  );
}

function TableHand({ title, cards, value }: { title: string; cards: Array<Card | undefined>; value?: number }) {
  return (
    <div className="table-hand">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-emerald-100">{title}</h2>
        {value ? <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-black">Total {value}</span> : null}
      </div>
      <div className="mt-3 flex min-h-28 flex-wrap gap-3">
        {cards.length > 0 ? (
          cards.map((card, index) => <PlayingCard key={card?.id ?? `hidden-${index}`} card={card} compact hidden={!card} />)
        ) : (
          <div className="flex min-h-28 flex-1 items-center justify-center rounded-md border border-dashed border-white/30 text-sm font-black uppercase tracking-wide text-emerald-100">
            Waiting for deal
          </div>
        )}
      </div>
    </div>
  );
}
