"use client";

import { useEffect, useReducer, useState } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { PlayingCard } from "@/components/playing-card";
import { BettingRail } from "@/components/betting-rail";
import { CountHud } from "@/components/count-hud";
import { DiscardTray } from "@/components/discard-tray";
import { SessionStats } from "@/components/session-stats";
import { StrategyPanel } from "@/components/strategy-panel";
import { handValue, type Card } from "@/lib/blackjack/cards";
import {
  activeHand,
  createInitialGameState,
  dealerVisibleCards,
  gameReducer,
  type GameAction,
} from "@/lib/blackjack/game";
import { recommendBasicStrategy, type StrategyAction } from "@/lib/blackjack/strategy";
import type { TrainingEvent } from "@/lib/blackjack/training";

const PLAY_STATS_KEY = "blackjack-play-session-stats";

export function BlackjackTable() {
  const [state, dispatchBase] = useReducer(gameReducer, undefined, createInitialGameState);
  const [hudVisible, setHudVisible] = useState(true);
  const [events, setEvents] = useState<TrainingEvent[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = window.sessionStorage.getItem(PLAY_STATS_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as TrainingEvent[];
        if (Array.isArray(parsed)) setEvents(parsed);
      } catch {
        setEvents([]);
      }
    });
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(PLAY_STATS_KEY, JSON.stringify(events));
  }, [events]);

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
    setEvents([]);
    dispatch({ type: "reset" });
  }

  const dealerCards = state.dealerHoleRevealed ? state.dealerCards : state.dealerCards.length > 0 ? [state.dealerCards[0], undefined] : [];
  const current = activeHand(state);

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
          <button type="button" onClick={resetAll} className="table-light-button">
            <RotateCcw className="h-4 w-4" />
            Reset table
          </button>
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

        <div className="mt-6 rounded-md bg-black/25 p-4">
          <p className="flex items-center gap-2 text-sm font-black text-emerald-50">
            <ShieldCheck className="h-4 w-4" />
            {state.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
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
