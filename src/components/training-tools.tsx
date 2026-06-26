"use client";

import { useState, type ReactNode } from "react";
import { Calculator, ChartNoAxesCombined, Layers, ListChecks, RotateCcw, Target, type LucideIcon } from "lucide-react";
import { PlayingCard } from "@/components/playing-card";
import { SessionStats } from "@/components/session-stats";
import { formatCount, hiLoValue, makeShoe, type Card, type Rank } from "@/lib/blackjack/cards";
import { recommendCountAwareStrategy } from "@/lib/blackjack/strategy";
import { makeCardFromRank } from "@/lib/blackjack/utils";
import {
  makeStrategyFlashcard,
  randomBetRampScenario,
  randomTrueCountScenario,
  type TrainingEvent,
} from "@/lib/blackjack/training";

type ToolTab = "strategy" | "deck" | "bet" | "deviation" | "shoe";
type StrategyFlashcard = ReturnType<typeof makeStrategyFlashcard>;
type DeviationScenario = {
  cards: Card[];
  dealer: Rank;
  tc: number;
};

const toolTabs: { id: ToolTab; label: string; icon: LucideIcon }[] = [
  { id: "strategy", label: "Strategy", icon: ListChecks },
  { id: "deck", label: "Decks", icon: Layers },
  { id: "bet", label: "Bet ramp", icon: ChartNoAxesCombined },
  { id: "deviation", label: "Deviations", icon: Target },
  { id: "shoe", label: "Shoe count", icon: Calculator },
];

const deviationScenarios: DeviationScenario[] = [
  { cards: [makeCardFromRank("10", "S", "dev-16-10s"), makeCardFromRank("6", "H", "dev-16-6h")], dealer: "10", tc: 0 },
  { cards: [makeCardFromRank("10", "S", "dev-15-10s"), makeCardFromRank("5", "H", "dev-15-5h")], dealer: "10", tc: 4 },
  { cards: [makeCardFromRank("9", "S", "dev-16-9s"), makeCardFromRank("7", "H", "dev-16-7h")], dealer: "10", tc: -1 },
  { cards: [makeCardFromRank("A", "S", "dev-a7-as"), makeCardFromRank("7", "H", "dev-a7-7h")], dealer: "9", tc: 2 },
  { cards: [makeCardFromRank("8", "S", "dev-88-8s"), makeCardFromRank("8", "H", "dev-88-8h")], dealer: "A", tc: 3 },
];

const initialStrategyCards = [
  makeCardFromRank("10", "S", "strategy-10s"),
  makeCardFromRank("6", "H", "strategy-6h"),
];

const initialStrategyCard: StrategyFlashcard = {
  cards: initialStrategyCards,
  dealer: "10",
  recommendation: recommendCountAwareStrategy(initialStrategyCards, "10", -1),
};

const initialShoeCards = [
  makeCardFromRank("2", "S", "shoe-2s"),
  makeCardFromRank("K", "H", "shoe-kh"),
  makeCardFromRank("7", "D", "shoe-7d"),
  makeCardFromRank("5", "C", "shoe-5c"),
  makeCardFromRank("A", "S", "shoe-as"),
  makeCardFromRank("3", "H", "shoe-3h"),
  makeCardFromRank("9", "D", "shoe-9d"),
  makeCardFromRank("Q", "C", "shoe-qc"),
  makeCardFromRank("6", "S", "shoe-6s"),
  makeCardFromRank("4", "H", "shoe-4h"),
  makeCardFromRank("10", "D", "shoe-10d"),
  makeCardFromRank("8", "C", "shoe-8c"),
  makeCardFromRank("2", "H", "shoe-2h"),
  makeCardFromRank("J", "S", "shoe-js"),
  makeCardFromRank("5", "D", "shoe-5d"),
  makeCardFromRank("7", "C", "shoe-7c"),
  makeCardFromRank("A", "D", "shoe-ad"),
  makeCardFromRank("3", "C", "shoe-3c"),
];

export function TrainingTools() {
  const [tab, setTab] = useState<ToolTab>("strategy");
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [strategyCard, setStrategyCard] = useState<StrategyFlashcard>(initialStrategyCard);
  const [deckGuess, setDeckGuess] = useState("");
  const [deckActual, setDeckActual] = useState(2.5);
  const [betScenario, setBetScenario] = useState({ trueCount: 2, units: 2 });
  const [trueScenario, setTrueScenario] = useState({ running: 6, decks: 2, trueCount: 3 });
  const [deviationIndex, setDeviationIndex] = useState(0);
  const [shoeCards, setShoeCards] = useState(initialShoeCards);
  const [shoeGuess, setShoeGuess] = useState("");

  function addEvent(event: TrainingEvent) {
    setEvents((previous) => [...previous, event]);
  }

  function checkStrategy(answer: string) {
    const expected = strategyCard.recommendation.label;
    addEvent({
      category: "basic-strategy",
      correct: answer === expected,
      prompt: `${strategyCard.cards.map((card) => card.rank).join(",")} vs ${strategyCard.dealer}`,
      expected,
      actual: answer,
    });
    setStrategyCard(makeStrategyFlashcard());
  }

  function checkDeckEstimate() {
    const numeric = Number(deckGuess);
    const correct = Math.abs(numeric - deckActual) <= 0.5;
    addEvent({
      category: "deck-estimation",
      correct,
      prompt: "Discard tray estimate",
      expected: `${deckActual.toFixed(1)} decks`,
      actual: `${deckGuess || "blank"} decks`,
    });
    setDeckActual(Math.round((Math.random() * 4.5 + 0.5) * 2) / 2);
    setDeckGuess("");
  }

  function checkBet(units: number) {
    addEvent({
      category: "bet-ramp",
      correct: units === betScenario.units,
      prompt: `TC ${formatCount(betScenario.trueCount)}`,
      expected: `${betScenario.units} units`,
      actual: `${units} units`,
    });
    setBetScenario(randomBetRampScenario());
  }

  function checkTrueCount(answer: number) {
    addEvent({
      category: "true-count",
      correct: answer === trueScenario.trueCount,
      prompt: `RC ${formatCount(trueScenario.running)} / ${trueScenario.decks} decks`,
      expected: formatCount(trueScenario.trueCount),
      actual: formatCount(answer),
    });
    setTrueScenario(randomTrueCountScenario());
  }

  function checkDeviation(answer: string) {
    const scenario = deviationScenarios[deviationIndex];
    const expected = recommendCountAwareStrategy(scenario.cards, scenario.dealer, scenario.tc).label;
    addEvent({
      category: "deviation",
      correct: answer === expected,
      prompt: `${scenario.cards.map((card) => card.rank).join(",")} vs ${scenario.dealer} at TC ${formatCount(scenario.tc)}`,
      expected,
      actual: answer,
    });
    setDeviationIndex((current) => (current + 1) % deviationScenarios.length);
  }

  function checkShoe() {
    const answer = shoeCards.reduce((sum, card) => sum + hiLoValue(card.rank), 0);
    const numeric = Number(shoeGuess);
    addEvent({
      category: "count",
      correct: numeric === answer,
      prompt: "18-card shoe-count drill",
      expected: formatCount(answer),
      actual: shoeGuess || "blank",
    });
    setShoeGuess("");
  }

  const currentDeviation = deviationScenarios[deviationIndex];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-5">
          {toolTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`drill-button ${tab === item.id ? "drill-button-active" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "strategy" ? (
            <ToolPanel title="Basic strategy flashcards">
              <div className="flex flex-wrap items-center gap-4">
                {strategyCard.cards.map((card) => (
                  <PlayingCard key={card.id} card={card} compact />
                ))}
                <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-neutral-500">Dealer upcard</p>
                  <p className="mt-2 text-4xl font-black">{strategyCard.dealer}</p>
                </div>
              </div>
              <ChoiceGrid choices={["Hit", "Stand", "Double", "Split", "Surrender"]} onChoose={checkStrategy} />
            </ToolPanel>
          ) : null}

          {tab === "deck" ? (
            <ToolPanel title="Deck estimation">
              <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
                <div className="h-32 overflow-hidden rounded-md border border-neutral-300 bg-neutral-100">
                  <div className="h-full bg-emerald-800" style={{ width: `${(deckActual / 6) * 100}%` }} />
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-700">Estimate the discard tray within half a deck.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="answer-input" value={deckGuess} onChange={(event) => setDeckGuess(event.target.value)} placeholder="Decks discarded" />
                <button type="button" onClick={checkDeckEstimate} className="primary-button">Check</button>
              </div>
            </ToolPanel>
          ) : null}

          {tab === "bet" ? (
            <ToolPanel title="Bet ramp and true count">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-neutral-950 p-5 text-white">
                  <p className="text-sm font-black uppercase tracking-wide text-emerald-100">True count</p>
                  <p className="mt-3 text-5xl font-black">{formatCount(betScenario.trueCount)}</p>
                </div>
                <div className="rounded-md bg-emerald-900 p-5 text-white">
                  <p className="text-sm font-black uppercase tracking-wide text-emerald-100">Convert this too</p>
                  <p className="mt-3 text-lg font-bold">RC {formatCount(trueScenario.running)} / {trueScenario.decks} decks</p>
                  <ChoiceGrid choices={[-3, -2, -1, 0, 1, 2, 3, 4, 5].map(String)} onChoose={(choice) => checkTrueCount(Number(choice))} />
                </div>
              </div>
              <ChoiceGrid choices={[1, 2, 4, 6, 8, 10].map((units) => `${units} units`)} onChoose={(choice) => checkBet(Number(choice.split(" ")[0]))} />
            </ToolPanel>
          ) : null}

          {tab === "deviation" ? (
            <ToolPanel title="Deviation drill">
              <div className="flex flex-wrap items-center gap-4">
                {currentDeviation.cards.map((card) => (
                  <PlayingCard key={card.id} card={card} compact />
                ))}
                <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-neutral-500">Dealer / TC</p>
                  <p className="mt-2 text-3xl font-black">{currentDeviation.dealer} / {formatCount(currentDeviation.tc)}</p>
                </div>
              </div>
              <ChoiceGrid choices={["Hit", "Stand", "Double", "Split", "Surrender", "Insurance"]} onChoose={checkDeviation} />
            </ToolPanel>
          ) : null}

          {tab === "shoe" ? (
            <ToolPanel title="Shoe-counting simulator">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {shoeCards.map((card) => (
                  <PlayingCard key={card.id} card={card} compact />
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="answer-input" value={shoeGuess} onChange={(event) => setShoeGuess(event.target.value)} placeholder="Running count" />
                <button type="button" onClick={checkShoe} className="primary-button">Check count</button>
                <button
                  type="button"
                  onClick={() => {
                    setShoeCards(makeShoe(1).slice(0, 18));
                    setShoeGuess("");
                  }}
                  className="secondary-button"
                >
                  <RotateCcw className="h-4 w-4" />
                  New cards
                </button>
              </div>
            </ToolPanel>
          ) : null}
        </div>
      </section>

      <SessionStats events={events} handsPlayed={0} />
    </div>
  );
}

function ToolPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function ChoiceGrid({ choices, onChoose }: { choices: string[]; onChoose: (choice: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {choices.map((choice) => (
        <button type="button" key={choice} onClick={() => onChoose(choice)} className="choice-button">
          {choice}
        </button>
      ))}
    </div>
  );
}
