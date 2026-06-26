# Blackjack Counting Lab

A Next.js App Router site for learning beginner blackjack card counting.

The app has two top-level modes:

- Learn: a full curriculum with individual lesson pages, embedded YouTube videos, drills, mistakes, and source links.
- Practice: drills for running count, true count conversion, and count-aware strategy decisions.
- Play: a six-deck blackjack table with chips, H17 dealer play, DAS, late surrender, insurance, split/double support, count HUD, strategy hint, discard tray, and mistake review.
- Tools: focused drills for basic strategy, deck estimation, bet ramps, deviations, true count, and shoe counting.

Lesson routes are available at `/learn` and `/learn/[slug]`. The table is at `/play`; the training suite is at `/tools`.

## Storage

There is no database and no durable server-side profile. Progress is stored in browser `sessionStorage` and mirrored to a session cookie, so it is scoped to the current browser session.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run build
```

## Research Base

The lesson content is based on beginner-friendly Hi-Lo guidance, true count conversion, basic strategy, and common early index plays from:

- Wizard of Odds: Hi-Lo and index numbers
- Wizard of Odds: card counting basics
- Wizard of Odds: basic strategy calculator
- Wizard of Odds: rule variations and risk of ruin
- Blackjack Apprenticeship: how to count cards
- Blackjack Apprenticeship: basic strategy charts, deck estimation, bankroll, and training resources
