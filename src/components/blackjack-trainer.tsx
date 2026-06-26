"use client";

import {
  BookOpen,
  Brain,
  Calculator,
  Check,
  ChevronRight,
  History,
  Play,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lessons, researchSources } from "@/lib/lessons";

type Mode = "learn" | "practice";
type Drill = "running" | "true" | "decision";
type RunningDrillPhase = "ready" | "dealing" | "answering";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Suit = "S" | "H" | "D" | "C";
type Card = { rank: Rank; suit: Suit };
type Decision = "Hit" | "Stand" | "Double" | "Split" | "Surrender" | "Insurance";

type SessionState = {
  mode: Mode;
  drill: Drill;
  lessonIndex: number;
  completedLessons: number[];
  streak: number;
  attempts: number;
  correct: number;
};

const STORAGE_KEY = "blackjack-counting-session";
const COOKIE_KEY = "bj_counting_session";
const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits: Suit[] = ["S", "H", "D", "C"];

const defaultSession: SessionState = {
  mode: "learn",
  drill: "running",
  lessonIndex: 0,
  completedLessons: [],
  streak: 0,
  attempts: 0,
  correct: 0,
};

function getCountValue(rank: Rank) {
  if (["2", "3", "4", "5", "6"].includes(rank)) {
    return 1;
  }
  if (["10", "J", "Q", "K", "A"].includes(rank)) {
    return -1;
  }
  return 0;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCard(): Card {
  return {
    rank: ranks[randomInt(0, ranks.length - 1)],
    suit: suits[randomInt(0, suits.length - 1)],
  };
}

function makeCards(count: number) {
  return Array.from({ length: count }, randomCard);
}

function trueCount(running: number, decks: number) {
  return Math.trunc(running / decks);
}

function formatCount(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function writeSessionCookie(value: SessionState) {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(
    JSON.stringify({
      mode: value.mode,
      drill: value.drill,
      lessonIndex: value.lessonIndex,
    }),
  )}; path=/; SameSite=Lax`;
}

function readSession(): SessionState {
  if (typeof window === "undefined") {
    return defaultSession;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultSession;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      ...defaultSession,
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons
        : [],
    };
  } catch {
    return defaultSession;
  }
}

function cardTotal(cards: Rank[]) {
  let total = 0;
  let aces = 0;

  cards.forEach((rank) => {
    if (rank === "A") {
      aces += 1;
      total += 11;
    } else if (["J", "Q", "K"].includes(rank)) {
      total += 10;
    } else {
      total += Number(rank);
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return { total, soft: aces > 0 };
}

function hardStrategy(total: number, dealer: Rank): Decision {
  const dealerValue = dealer === "A" ? 11 : ["10", "J", "Q", "K"].includes(dealer) ? 10 : Number(dealer);

  if (total <= 8) return "Hit";
  if (total === 9) return dealerValue >= 3 && dealerValue <= 6 ? "Double" : "Hit";
  if (total === 10) return dealerValue <= 9 ? "Double" : "Hit";
  if (total === 11) return dealerValue <= 10 ? "Double" : "Hit";
  if (total === 12) return dealerValue >= 4 && dealerValue <= 6 ? "Stand" : "Hit";
  if (total >= 13 && total <= 14) return dealerValue >= 2 && dealerValue <= 6 ? "Stand" : "Hit";
  if (total === 15) return dealerValue === 10 ? "Surrender" : dealerValue >= 2 && dealerValue <= 6 ? "Stand" : "Hit";
  if (total === 16) return dealerValue >= 9 || dealer === "A" ? "Surrender" : dealerValue >= 2 && dealerValue <= 6 ? "Stand" : "Hit";
  return "Stand";
}

function softStrategy(total: number, dealer: Rank): Decision {
  const dealerValue = dealer === "A" ? 11 : ["10", "J", "Q", "K"].includes(dealer) ? 10 : Number(dealer);

  if (total <= 17) {
    if (total === 13 || total === 14) return dealerValue >= 5 && dealerValue <= 6 ? "Double" : "Hit";
    if (total === 15 || total === 16) return dealerValue >= 4 && dealerValue <= 6 ? "Double" : "Hit";
    return dealerValue >= 3 && dealerValue <= 6 ? "Double" : "Hit";
  }
  if (total === 18) {
    if (dealerValue >= 3 && dealerValue <= 6) return "Double";
    if (dealerValue >= 9 || dealer === "A") return "Hit";
    return "Stand";
  }
  return "Stand";
}

function pairStrategy(rank: Rank, dealer: Rank): Decision {
  const dealerValue = dealer === "A" ? 11 : ["10", "J", "Q", "K"].includes(dealer) ? 10 : Number(dealer);

  if (rank === "A" || rank === "8") return "Split";
  if (rank === "10" || rank === "J" || rank === "Q" || rank === "K") return "Stand";
  if (rank === "9") return [2, 3, 4, 5, 6, 8, 9].includes(dealerValue) ? "Split" : "Stand";
  if (rank === "7") return dealerValue >= 2 && dealerValue <= 7 ? "Split" : "Hit";
  if (rank === "6") return dealerValue >= 2 && dealerValue <= 6 ? "Split" : "Hit";
  if (rank === "5") return dealerValue <= 9 ? "Double" : "Hit";
  if (rank === "4") return dealerValue === 5 || dealerValue === 6 ? "Split" : "Hit";
  if (rank === "2" || rank === "3") return dealerValue >= 2 && dealerValue <= 7 ? "Split" : "Hit";
  return "Hit";
}

function bestDecision(player: Rank[], dealer: Rank, count: number): { decision: Decision; note: string } {
  const [first, second] = player;
  const dealerTen = ["10", "J", "Q", "K"].includes(dealer);
  const total = cardTotal(player);

  if (dealer === "A" && count >= 3) {
    return { decision: "Insurance", note: "Index play: take insurance at TC +3 or higher." };
  }

  if (!total.soft && total.total === 16 && dealerTen && count >= 0) {
    return { decision: "Stand", note: "Index play: stand on hard 16 vs 10 at TC 0 or higher." };
  }

  if (!total.soft && total.total === 15 && dealerTen && count >= 4) {
    return { decision: "Stand", note: "Index play: stand on hard 15 vs 10 at TC +4 or higher." };
  }

  if (first === second) {
    return { decision: pairStrategy(first, dealer), note: "Basic strategy pair decision." };
  }

  if (total.soft) {
    return { decision: softStrategy(total.total, dealer), note: "Basic strategy soft-total decision." };
  }

  return { decision: hardStrategy(total.total, dealer), note: "Basic strategy hard-total decision." };
}

function generateDecisionHand() {
  const scenarioRanks: Rank[][] = [
    ["10", "6"],
    ["10", "5"],
    ["A", "7"],
    ["8", "8"],
    ["9", "9"],
    ["5", "5"],
    ["10", "2"],
    ["7", "4"],
    ["A", "6"],
    ["6", "6"],
  ];
  const dealerRanks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
  const player = scenarioRanks[randomInt(0, scenarioRanks.length - 1)];
  const dealer = dealerRanks[randomInt(0, dealerRanks.length - 1)];
  const count = randomInt(-2, 5);
  return { player, dealer, count, answer: bestDecision(player, dealer, count) };
}

function CardFace({ card, compact = false }: { card: Card; compact?: boolean }) {
  const red = card.suit === "H" || card.suit === "D";

  return (
    <div
      className={`card-face ${red ? "text-red-700" : "text-neutral-950"} ${
        compact ? "h-24 w-16" : "h-32 w-24"
      }`}
    >
      <span className="text-lg font-black">{card.rank}</span>
      <span className="text-xs font-semibold tracking-[0.24em]">{card.suit}</span>
      <span className="text-3xl font-black">{card.rank}</span>
      <span className="self-end text-xs font-semibold tracking-[0.24em]">{card.suit}</span>
    </div>
  );
}

function RankCard({ rank, label }: { rank: Rank; label?: string }) {
  return (
    <div className="card-face h-28 w-20 text-neutral-950">
      <span className="text-lg font-black">{rank}</span>
      <span className="text-xs font-semibold tracking-[0.24em]">{label ?? "UP"}</span>
      <span className="text-3xl font-black">{rank}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 text-2xl font-black text-neutral-950">{value}</dd>
    </div>
  );
}

export function BlackjackTrainer() {
  const [session, setSession] = useState<SessionState>(defaultSession);
  const [mounted, setMounted] = useState(false);
  const [runningCards, setRunningCards] = useState<Card[]>(() => makeCards(8));
  const [runningPhase, setRunningPhase] = useState<RunningDrillPhase>("ready");
  const [dealSpeed, setDealSpeed] = useState(700);
  const [dealIndex, setDealIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [runningGuess, setRunningGuess] = useState("");
  const [trueScenario, setTrueScenario] = useState(() => ({
    running: randomInt(-12, 18),
    decks: [1, 1.5, 2, 3, 4, 6][randomInt(0, 5)],
  }));
  const [trueGuess, setTrueGuess] = useState("");
  const [decisionScenario, setDecisionScenario] = useState(generateDecisionHand);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSession(readSession());
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    writeSessionCookie(session);
  }, [mounted, session]);

  useEffect(() => {
    if (runningPhase !== "dealing") return;

    const showMs = Math.max(180, Math.round(dealSpeed * 0.68));
    const hideMs = Math.max(120, dealSpeed - showMs);
    const timeout = window.setTimeout(
      () => {
        if (cardVisible) {
          setCardVisible(false);
          return;
        }

        const nextIndex = dealIndex + 1;
        if (nextIndex >= runningCards.length) {
          setRunningPhase("answering");
          return;
        }

        setDealIndex(nextIndex);
        setCardVisible(true);
      },
      cardVisible ? showMs : hideMs,
    );

    return () => window.clearTimeout(timeout);
  }, [cardVisible, dealIndex, dealSpeed, runningCards.length, runningPhase]);

  const runningAnswer = useMemo(
    () => runningCards.reduce((sum, card) => sum + getCountValue(card.rank), 0),
    [runningCards],
  );

  const trueAnswer = trueCount(trueScenario.running, trueScenario.decks);
  const accuracy = session.attempts === 0 ? 0 : Math.round((session.correct / session.attempts) * 100);
  const currentLesson = lessons[session.lessonIndex];
  const completedCount = session.completedLessons.length;
  const currentRunningCard = runningPhase === "dealing" && cardVisible ? runningCards[dealIndex] : null;

  function updateSession(next: Partial<SessionState>) {
    setSession((previous) => ({ ...previous, ...next }));
  }

  function recordResult(ok: boolean) {
    setSession((previous) => ({
      ...previous,
      attempts: previous.attempts + 1,
      correct: previous.correct + (ok ? 1 : 0),
      streak: ok ? previous.streak + 1 : 0,
    }));
  }

  function resetProgress() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    document.cookie = `${COOKIE_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
    setSession(defaultSession);
    setFeedback(null);
  }

  function completeLesson() {
    setSession((previous) => {
      const completedLessons = previous.completedLessons.includes(previous.lessonIndex)
        ? previous.completedLessons
        : [...previous.completedLessons, previous.lessonIndex];
      return {
        ...previous,
        completedLessons,
        lessonIndex: Math.min(previous.lessonIndex + 1, lessons.length - 1),
      };
    });
  }

  function checkRunning() {
    if (runningPhase !== "answering") {
      setFeedback({ ok: false, text: "Start the deal and wait for every card to disappear before answering." });
      return;
    }

    if (runningGuess.trim() === "") {
      setFeedback({ ok: false, text: "Enter the final running count before checking." });
      return;
    }

    const numeric = Number(runningGuess);
    const ok = numeric === runningAnswer;
    recordResult(ok);
    setFeedback({
      ok,
      text: ok
        ? `Correct. The running count is ${formatCount(runningAnswer)}.`
        : `The running count is ${formatCount(runningAnswer)}.`,
    });
  }

  function startRunningDeal() {
    setRunningGuess("");
    setFeedback(null);
    setDealIndex(0);
    setCardVisible(true);
    setRunningPhase("dealing");
  }

  function nextRunning() {
    setRunningCards(makeCards(randomInt(6, 12)));
    setRunningGuess("");
    setDealIndex(0);
    setCardVisible(false);
    setRunningPhase("ready");
    setFeedback(null);
  }

  function checkTrue() {
    const numeric = Number(trueGuess);
    const ok = numeric === trueAnswer;
    recordResult(ok);
    setFeedback({
      ok,
      text: ok
        ? `Correct. ${formatCount(trueScenario.running)} divided by ${trueScenario.decks} decks is ${formatCount(trueAnswer)}.`
        : `True count is ${formatCount(trueAnswer)} after truncating toward zero.`,
    });
  }

  function nextTrue() {
    setTrueScenario({
      running: randomInt(-12, 18),
      decks: [1, 1.5, 2, 3, 4, 6][randomInt(0, 5)],
    });
    setTrueGuess("");
    setFeedback(null);
  }

  function checkDecision(choice: Decision) {
    const ok = choice === decisionScenario.answer.decision;
    recordResult(ok);
    setFeedback({
      ok,
      text: ok
        ? `${choice} is right. ${decisionScenario.answer.note}`
        : `Best play: ${decisionScenario.answer.decision}. ${decisionScenario.answer.note}`,
    });
  }

  function nextDecision() {
    setDecisionScenario(generateDecisionHand());
    setFeedback(null);
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Blackjack Counting Lab
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-normal text-neutral-950 sm:text-5xl">
                Learn Hi-Lo card counting with live drills.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
                A browser-only trainer for basic strategy, running count, true count conversion, bet ramp thinking, and the first high-value deviations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[28rem]">
              <Stat label="Streak" value={`${session.streak}`} />
              <Stat label="Accuracy" value={`${accuracy}%`} />
              <Stat label="Lessons" value={`${completedCount}/${lessons.length}`} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-grid grid-cols-2 rounded-md border border-neutral-200 bg-neutral-100 p-1 sm:w-fit">
              <button
                type="button"
                onClick={() => updateSession({ mode: "learn" })}
                className={`mode-button ${session.mode === "learn" ? "mode-button-active" : ""}`}
              >
                <BookOpen className="h-4 w-4" />
                Learn
              </button>
              <button
                type="button"
                onClick={() => updateSession({ mode: "practice" })}
                className={`mode-button ${session.mode === "practice" ? "mode-button-active" : ""}`}
              >
                <Target className="h-4 w-4" />
                Practice
              </button>
            </div>

            <button type="button" onClick={resetProgress} className="icon-text-button">
              <RotateCcw className="h-4 w-4" />
              Reset session
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/play" className="curriculum-card">
              <Target className="h-6 w-6 flex-none text-emerald-800" />
              <span>
                <span className="block text-lg font-black">Play the table</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-700">
                  Full six-deck blackjack with count HUD, chips, surrender, splits, doubles, and mistake review.
                </span>
              </span>
              <ChevronRight className="ml-auto h-5 w-5 flex-none text-neutral-500" />
            </Link>
            <Link href="/tools" className="curriculum-card">
              <Brain className="h-6 w-6 flex-none text-emerald-800" />
              <span>
                <span className="block text-lg font-black">Training tools</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-700">
                  Drill strategy, deck estimation, bet ramps, deviations, true count, and shoe-counting.
                </span>
              </span>
              <ChevronRight className="ml-auto h-5 w-5 flex-none text-neutral-500" />
            </Link>
            <Link href="/learn/perfect-blackjack-without-counting" className="curriculum-card">
              <BookOpen className="h-6 w-6 flex-none text-emerald-800" />
              <span>
                <span className="block text-lg font-black">Perfect blackjack</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-700">
                  Learn the book before counting with the full hit/stand/double/split/surrender sheet.
                </span>
              </span>
              <ChevronRight className="ml-auto h-5 w-5 flex-none text-neutral-500" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <div className="min-w-0">
          {session.mode === "learn" ? (
            <div className="grid gap-6">
              <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                      Lesson {session.lessonIndex + 1} / {lessons.length} - {currentLesson.badge}
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-normal text-neutral-950">
                      {currentLesson.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-700">
                      {currentLesson.summary}
                    </p>
                  </div>
                  <Link href={`/learn/${currentLesson.slug}`} className="primary-button">
                    <BookOpen className="h-4 w-4" />
                    Open lesson
                  </Link>
                  <button type="button" onClick={completeLesson} className="secondary-button">
                    <Check className="h-4 w-4" />
                    Mark learned
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {currentLesson.objectives.slice(0, 3).map((point) => (
                    <div key={point} className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
                      <p className="text-sm leading-6 text-neutral-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {lessons.map((lesson, index) => {
                  const done = session.completedLessons.includes(index);
                  return (
                    <Link
                      href={`/learn/${lesson.slug}`}
                      key={lesson.title}
                      onClick={() => updateSession({ lessonIndex: index })}
                      className={`lesson-row ${session.lessonIndex === index ? "lesson-row-active" : ""}`}
                    >
                      <span className={`lesson-check ${done ? "lesson-check-done" : ""}`}>
                        {done ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block text-sm font-black text-neutral-950">{lesson.title}</span>
                        <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          {lesson.badge}
                        </span>
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 text-neutral-500" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "running" as Drill, label: "Running count", icon: Brain },
                    { id: "true" as Drill, label: "True count", icon: Calculator },
                    { id: "decision" as Drill, label: "Decision", icon: Trophy },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          updateSession({ drill: item.id });
                          setFeedback(null);
                        }}
                        className={`drill-button ${session.drill === item.id ? "drill-button-active" : ""}`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
                {session.drill === "running" && (
                  <div className="grid gap-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Hi-Lo drill</p>
                      <h2 className="mt-2 text-3xl font-black tracking-normal">Watch the deal, then enter the count.</h2>
                    </div>

                    <div className="deal-table" aria-live="polite">
                      <div className="deal-shoe">
                        <span className="text-xs font-black uppercase tracking-wide text-emerald-100">Shoe</span>
                        <span className="text-2xl font-black text-white">{runningCards.length}</span>
                      </div>

                      <div className="deal-card-slot">
                        {currentRunningCard ? (
                          <div key={`${currentRunningCard.rank}-${currentRunningCard.suit}-${dealIndex}`} className="deal-card-motion">
                            <CardFace card={currentRunningCard} />
                          </div>
                        ) : (
                          <div className="deal-empty">
                            {runningPhase === "answering" ? "Now answer" : runningPhase === "dealing" ? "Card cleared" : "Press start"}
                          </div>
                        )}
                      </div>

                      <div className="deal-counter">
                        <span className="text-xs font-black uppercase tracking-wide text-emerald-100">
                          {runningPhase === "dealing" ? "Dealing" : runningPhase === "answering" ? "Finished" : "Ready"}
                        </span>
                        <span className="text-2xl font-black text-white">
                          {runningPhase === "ready" ? "0" : Math.min(dealIndex + 1, runningCards.length)}/{runningCards.length}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 rounded-md border border-neutral-200 bg-[#fbfaf7] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <label className="grid gap-2">
                        <span className="flex flex-wrap items-center justify-between gap-2 text-sm font-black text-neutral-800">
                          Deal speed
                          <span className="rounded-md bg-white px-2 py-1 text-xs text-neutral-600 shadow-sm">
                            {dealSpeed} ms/card
                          </span>
                        </span>
                        <input
                          aria-label="Deal speed"
                          type="range"
                          min="250"
                          max="1400"
                          step="50"
                          value={dealSpeed}
                          disabled={runningPhase === "dealing"}
                          onChange={(event) => setDealSpeed(Number(event.target.value))}
                          className="speed-slider"
                        />
                        <span className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Fast", value: 350 },
                            { label: "Table", value: 700 },
                            { label: "Slow", value: 1100 },
                          ].map((preset) => (
                            <button
                              type="button"
                              key={preset.label}
                              disabled={runningPhase === "dealing"}
                              onClick={() => setDealSpeed(preset.value)}
                              className={`speed-preset ${dealSpeed === preset.value ? "speed-preset-active" : ""}`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={startRunningDeal}
                        disabled={runningPhase === "dealing"}
                        className="primary-button"
                      >
                        <Play className="h-4 w-4" />
                        {runningPhase === "answering" ? "Replay deal" : "Start deal"}
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        aria-label="Running count answer"
                        type="number"
                        inputMode="numeric"
                        value={runningGuess}
                        onChange={(event) => setRunningGuess(event.target.value)}
                        disabled={runningPhase !== "answering"}
                        className="answer-input"
                        placeholder="Running count"
                      />
                      <button
                        type="button"
                        onClick={checkRunning}
                        disabled={runningPhase !== "answering"}
                        className="primary-button"
                      >
                        <Check className="h-4 w-4" />
                        Check
                      </button>
                      <button type="button" onClick={nextRunning} className="secondary-button">
                        <RefreshCcw className="h-4 w-4" />
                        New deal
                      </button>
                    </div>
                  </div>
                )}

                {session.drill === "true" && (
                  <div className="grid gap-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Conversion drill</p>
                      <h2 className="mt-2 text-3xl font-black tracking-normal">Convert running count to true count.</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md bg-neutral-950 p-5 text-white">
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Running count</p>
                        <p className="mt-3 text-5xl font-black">{formatCount(trueScenario.running)}</p>
                      </div>
                      <div className="rounded-md bg-emerald-900 p-5 text-white">
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">Decks remaining</p>
                        <p className="mt-3 text-5xl font-black">{trueScenario.decks}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        aria-label="True count answer"
                        type="number"
                        inputMode="numeric"
                        value={trueGuess}
                        onChange={(event) => setTrueGuess(event.target.value)}
                        className="answer-input"
                        placeholder="True count"
                      />
                      <button type="button" onClick={checkTrue} className="primary-button">
                        <Check className="h-4 w-4" />
                        Check
                      </button>
                      <button type="button" onClick={nextTrue} className="secondary-button">
                        <RefreshCcw className="h-4 w-4" />
                        New count
                      </button>
                    </div>
                  </div>
                )}

                {session.drill === "decision" && (
                  <div className="grid gap-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Strategy drill</p>
                      <h2 className="mt-2 text-3xl font-black tracking-normal">Choose the count-aware play.</h2>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                      <div>
                        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">Player</p>
                        <div className="flex gap-3">
                          {decisionScenario.player.map((rank, index) => (
                            <RankCard key={`${rank}-${index}`} rank={rank} label="HAND" />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">True count</p>
                        <p className="mt-2 text-4xl font-black">{formatCount(decisionScenario.count)}</p>
                      </div>
                      <div>
                        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">Dealer</p>
                        <RankCard rank={decisionScenario.dealer} />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                      {(["Hit", "Stand", "Double", "Split", "Surrender", "Insurance"] as Decision[]).map((choice) => (
                        <button
                          type="button"
                          key={choice}
                          onClick={() => checkDecision(choice)}
                          className="choice-button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={nextDecision} className="secondary-button w-fit">
                      <RefreshCcw className="h-4 w-4" />
                      New hand
                    </button>
                  </div>
                )}

                {feedback && (
                  <div className={`feedback ${feedback.ok ? "feedback-ok" : "feedback-bad"}`}>
                    {feedback.ok ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    <p>{feedback.text}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="grid h-fit gap-4">
          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-800" />
              <h2 className="text-lg font-black">Session storage</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Progress is kept in session storage and a session cookie. Closing the browser session clears the working profile.
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
              <h2 className="text-lg font-black">Practice notes</h2>
            </div>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-neutral-700">
              <li>Best used for live-dealt shoe games, not continuously shuffled online games.</li>
              <li>Card counting can be legal, but casinos can still refuse service.</li>
              <li>This trainer is educational and does not promise profit.</li>
            </ul>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Research base</h2>
            <div className="mt-3 grid gap-2">
              {researchSources.slice(0, 5).map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-emerald-700 hover:text-emerald-800"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
