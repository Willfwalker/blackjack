export type LessonSection = {
  title: string;
  body: string[];
};

export type LessonSource = {
  label: string;
  href: string;
};

export type Lesson = {
  slug: string;
  title: string;
  badge: string;
  duration: string;
  summary: string;
  videoId: string;
  videoTitle: string;
  objectives: string[];
  quickRules: string[];
  sections: LessonSection[];
  drills: string[];
  mistakes: string[];
  sources: LessonSource[];
};

export const researchSources: LessonSource[] = [
  {
    label: "Wizard of Odds: High-Low card counting",
    href: "https://wizardofodds.com/games/blackjack/card-counting/high-low/",
  },
  {
    label: "Wizard of Odds: card counting introduction",
    href: "https://wizardofodds.com/games/blackjack/card-counting/introduction/",
  },
  {
    label: "Wizard of Odds: basic strategy calculator",
    href: "https://wizardofodds.com/games/blackjack/strategy/calculator/",
  },
  {
    label: "Wizard of Odds: rule variations",
    href: "https://wizardofodds.com/games/blackjack/rule-variations/",
  },
  {
    label: "Wizard of Odds: risk of ruin",
    href: "https://wizardofodds.com/games/blackjack/risk-of-ruin/",
  },
  {
    label: "Blackjack Apprenticeship: how to count cards",
    href: "https://www.blackjackapprenticeship.com/how-to-count-cards/",
  },
  {
    label: "Blackjack Apprenticeship: basic strategy charts",
    href: "https://www.blackjackapprenticeship.com/blackjack-strategy-charts/",
  },
  {
    label: "Blackjack Apprenticeship: deck estimation",
    href: "https://www.blackjackapprenticeship.com/bja-guide-to-deck-estimation/",
  },
  {
    label: "Blackjack Apprenticeship: bankroll guidance",
    href: "https://www.blackjackapprenticeship.com/recommended-blackjack-bankroll/",
  },
];

export const lessons: Lesson[] = [
  {
    slug: "blackjack-fundamentals-basic-strategy",
    title: "Blackjack fundamentals and basic strategy",
    badge: "Foundation",
    duration: "18 min",
    summary:
      "Learn the baseline game decisions before touching a count. Card counting adds value only when hit, stand, double, split, surrender, and insurance decisions are already automatic.",
    videoId: "-5c_5jNcsEY",
    videoTitle: "Blackjack by the Wizard of Odds",
    objectives: [
      "Understand why basic strategy is the first skill, not an optional warmup.",
      "Learn the order of operations: surrender, split, double, then hit or stand.",
      "Know which table rules change your strategy chart.",
      "Separate mathematically correct play from hunches and streak chasing.",
    ],
    quickRules: [
      "Use a strategy chart matched to rules: deck count, H17/S17, DAS, surrender, and dealer peek/no-peek.",
      "Do not take insurance in a neutral shoe.",
      "Avoid 6:5 blackjack payouts.",
      "If a play is not allowed, fall back to the next legal basic-strategy action.",
    ],
    sections: [
      {
        title: "Why basic strategy comes first",
        body: [
          "Basic strategy is the mathematically best default decision for a neutral shoe. It assumes you know only your cards, the dealer upcard, and the rules. Counting does not replace this chart; it tells you when the deck is unusual enough to depart from it.",
          "A learner who counts accurately but makes sloppy basic-strategy decisions gives back the edge immediately. Treat basic strategy as the language of blackjack. Counting is the accent you add later.",
        ],
      },
      {
        title: "Rule variables that matter",
        body: [
          "The same hand can be played differently when rules change. The big variables are number of decks, dealer hits or stands on soft 17, double after split, surrender, resplitting aces, and whether the dealer peeks for blackjack.",
          "Fewer decks usually help the player. Surrender and double-after-split help the player. Dealer hitting soft 17 and 6:5 blackjack hurt the player. These rule changes affect both the house edge and the exact strategy chart you should study.",
        ],
      },
      {
        title: "Order of operations",
        body: [
          "Think through a hand in the same order every time: can or should I surrender, should I split, should I double, then should I hit or stand. This prevents common errors like treating 8,8 as hard 16 before checking the pair rule.",
          "Insurance is a separate side bet. Basic strategy says to decline it because the neutral deck usually does not contain enough tens to justify the price.",
        ],
      },
    ],
    drills: [
      "Pick one ruleset, such as multi-deck H17 with DAS and surrender, and practice one chart until you can answer 50 random hands without looking.",
      "Say the order of operations aloud for awkward hands: 8,8 vs A, A,7 vs 9, 15 vs 10, and 9,9 vs 7.",
      "Compare two strategy charts with different rules and mark the cells that change.",
    ],
    mistakes: [
      "Using a generic chart without checking the table rules.",
      "Taking insurance because a dealer ace feels scary.",
      "Memorizing only hard totals and ignoring soft hands, pairs, and surrender.",
    ],
    sources: [
      researchSources[2],
      researchSources[3],
      researchSources[6],
    ],
  },
  {
    slug: "perfect-blackjack-without-counting",
    title: "Perfect blackjack without counting",
    badge: "The Book",
    duration: "28 min",
    summary:
      "Learn how to play blackjack by the book before adding a count. This lesson gives you the full basic strategy sheet for 6D H17 DAS late-surrender blackjack and teaches how to read it.",
    videoId: "-5c_5jNcsEY",
    videoTitle: "Blackjack by the Wizard of Odds",
    objectives: [
      "Use the basic strategy sheet for every hard total, soft total, and pair.",
      "Understand when the book says to hit, stand, double, split, or surrender.",
      "Learn why insurance is not a basic-strategy play without counting.",
      "Practice reading your hand against the dealer upcard quickly and consistently.",
    ],
    quickRules: [
      "Always identify the hand type first: pair, soft total, or hard total.",
      "Check surrender before treating 15 or 16 as normal hard totals.",
      "Double only when the table allows it; otherwise use the fallback hit or stand play.",
      "Decline insurance unless you are using a count-based deviation later.",
    ],
    sections: [
      {
        title: "What 'the book' means",
        body: [
          "The book is not a superstition or a casino phrase. It is the mathematically best basic-strategy decision for your hand, the dealer upcard, and the table rules, assuming no card-counting information.",
          "This site uses a common shoe-game ruleset for the sheet: six decks, dealer hits soft 17, double after split, late surrender, and 3:2 blackjack. If table rules change, some cells can change too.",
        ],
      },
      {
        title: "How to read the sheet",
        body: [
          "Start by classifying your hand. If your first two cards are a pair, use the pair table before anything else. If your hand contains an ace counted as 11, use the soft-total table. Otherwise use the hard-total table.",
          "Find your hand on the left and the dealer upcard across the top. The cell tells you the book play: H for hit, S for stand, D for double, P for split, and R for surrender.",
        ],
      },
      {
        title: "Examples",
        body: [
          "Hard 16 vs dealer 10 is surrender with late surrender. If surrender is unavailable, the fallback is usually hit unless a later count deviation tells you to stand.",
          "A,7 vs dealer 9 is hit because soft 18 is not strong enough against a dealer 9. A,7 vs dealer 3 through 6 is a double in this ruleset because the dealer is vulnerable.",
          "8,8 is split against every dealer upcard. It can feel uncomfortable against a 10 or ace, but the pair table comes before treating it as hard 16.",
        ],
      },
    ],
    drills: [
      "Read 25 hard-total hands from the sheet until you can answer without hesitation.",
      "Practice only soft totals for five minutes; most beginners under-study these.",
      "Practice pair decisions separately so you stop treating pairs as hard totals.",
      "Play the basic strategy flashcard tool and record which table section causes misses.",
    ],
    mistakes: [
      "Looking at hard 16 before checking whether the hand is 8,8.",
      "Standing on soft 18 too often against strong dealer cards.",
      "Taking insurance because the dealer ace feels dangerous.",
      "Using the wrong sheet for the table rules.",
    ],
    sources: [
      researchSources[2],
      researchSources[3],
      researchSources[6],
    ],
  },
  {
    slug: "why-card-counting-works",
    title: "Why card counting works",
    badge: "Theory",
    duration: "16 min",
    summary:
      "Understand the math idea behind counting: high cards help the player more than the dealer, low cards help the dealer survive, and deck composition changes the value of bets and close plays.",
    videoId: "QGr5EX_T-SI",
    videoTitle: "How Card Counting Works in 5 Minutes",
    objectives: [
      "Explain why tens and aces are favorable to the player.",
      "Understand why counting is about ratios, not memorizing every card.",
      "Know why the player edge is small and volatile.",
      "Connect deck composition to betting, blackjack payouts, doubles, splits, and insurance.",
    ],
    quickRules: [
      "More tens and aces remaining is good for the player.",
      "More low cards remaining is good for the dealer.",
      "Counting estimates composition; it does not predict the next card.",
      "The edge is long-run and statistical, not a guarantee of a winning session.",
    ],
    sections: [
      {
        title: "High cards help the player",
        body: [
          "A shoe rich in tens and aces increases the chance of blackjacks, and the player is paid 3:2 on a proper blackjack table while the dealer is not. High cards also make double-down hands more valuable and make dealer stiff hands more likely to bust.",
          "The dealer does receive high cards too, but the player has choices the dealer does not: standing, splitting, doubling, surrendering, and changing bet size before the hand.",
        ],
      },
      {
        title: "Low cards help the dealer",
        body: [
          "Low cards let the dealer draw out of stiff totals like 12 through 16 without busting. When many low cards have already appeared, the remaining shoe is richer in high cards, so the count rises.",
          "This is why Hi-Lo assigns positive values to low cards that leave the shoe. You are not saying the low card itself is good; you are saying its removal leaves a better future shoe behind.",
        ],
      },
      {
        title: "Small edge, big variance",
        body: [
          "Counting is powerful because you bet more when the math is better and less when the math is worse. Even then, the advantage is usually modest, and blackjack variance is large.",
          "A good counter can lose for long stretches. That is not a contradiction; it is the shape of a game with a small edge and high standard deviation.",
        ],
      },
    ],
    drills: [
      "Look at ten exposed cards and explain whether they make the remaining shoe better or worse before calculating the exact count.",
      "Write down three reasons high cards help the player and one reason they can also help the dealer.",
      "Simulate a neutral shoe, a high-card-rich shoe, and a low-card-rich shoe with physical cards.",
    ],
    mistakes: [
      "Thinking counting predicts the next card.",
      "Confusing win rate with expected value.",
      "Raising bets because you are due, instead of because the true count is favorable.",
    ],
    sources: [
      researchSources[1],
      researchSources[5],
      {
        label: "Stanford: effectiveness of High-Low simulations",
        href: "https://graphics.stanford.edu/~billyc/class/vis_win0304/as2/",
      },
    ],
  },
  {
    slug: "hi-lo-running-count",
    title: "Hi-Lo tags and running count",
    badge: "System",
    duration: "20 min",
    summary:
      "Master the balanced Hi-Lo count: assign +1 to 2-6, 0 to 7-9, and -1 to tens and aces, then keep a running total through every exposed card.",
    videoId: "WkGldDHLb5k",
    videoTitle: "How To Count Cards: It's Easier Than You'd Think",
    objectives: [
      "Memorize the Hi-Lo tag values.",
      "Understand why a full deck starts and ends at zero.",
      "Count cards in natural blackjack groups instead of one card at a time forever.",
      "Build accuracy before speed.",
    ],
    quickRules: [
      "2, 3, 4, 5, 6 = +1.",
      "7, 8, 9 = 0.",
      "10, J, Q, K, A = -1.",
      "Start every freshly shuffled shoe at 0.",
    ],
    sections: [
      {
        title: "The tag values",
        body: [
          "Hi-Lo is a balanced count, meaning one full deck sums to zero: five low ranks are +1, five high ranks are -1, and three ranks are neutral. This makes the running count meaningful inside a shoe, but it also means multi-deck games need true count conversion.",
          "The tags are intentionally simple. You are not remembering exact cards; you are tracking whether exposed cards were mostly low, neutral, or high.",
        ],
      },
      {
        title: "Running count habits",
        body: [
          "Update the count for every visible card: player hands, dealer upcard, dealer hole card when revealed, hit cards, double cards, split hands, and bust cards. Do not count burn cards or hidden cards you never see.",
          "In real play, many cards cancel. A 5 and a king together are zero. A 2, 6, and queen are +1. Learning these clumps helps you keep pace with a dealer without staring at every single card.",
        ],
      },
      {
        title: "Speed standards",
        body: [
          "A common training milestone is counting a single deck accurately in roughly 30 seconds, but accuracy matters first. If you are wrong, faster wrong answers do not help.",
          "After you can count a clean deck, practice with blackjack layouts: two player hands, dealer upcard, dealer draw cards, and distracted table rhythm.",
        ],
      },
    ],
    drills: [
      "Count down one deck and confirm it ends at zero.",
      "Count in pairs and cancel combinations that sum to zero.",
      "Use the Practice running-count drill on Table speed, then Fast speed.",
      "Have someone deal mock blackjack rounds while you keep the running count silently.",
    ],
    mistakes: [
      "Forgetting to count the dealer hole card when it is exposed.",
      "Counting your own cards but missing other players' cards.",
      "Moving to true count before running count is automatic.",
    ],
    sources: [
      researchSources[0],
      researchSources[1],
      researchSources[5],
    ],
  },
  {
    slug: "true-count-deck-estimation",
    title: "True count and deck estimation",
    badge: "Shoe games",
    duration: "22 min",
    summary:
      "Convert running count into a per-deck signal by estimating decks remaining. This is the core skill that makes Hi-Lo usable in multi-deck games.",
    videoId: "1ClRkNxinB8",
    videoTitle: "Techniques for Mastering True Count Conversion",
    objectives: [
      "Calculate true count from running count and decks remaining.",
      "Practice full-deck and half-deck estimation.",
      "Understand truncation and conservative rounding.",
      "Use true count for bets and index plays.",
    ],
    quickRules: [
      "True count = running count divided by decks remaining.",
      "A running count of +12 with 3 decks left is TC +4.",
      "The same running count is stronger late in the shoe than early.",
      "Use the true count for bet sizing and deviations.",
    ],
    sections: [
      {
        title: "Why running count is not enough",
        body: [
          "A running count of +8 is very different with six decks remaining than with one deck remaining. True count normalizes the running count into a count per deck, which better estimates the density of high cards left.",
          "Single-deck and double-deck games can make the running count feel more directly powerful, but most modern games use multiple decks. That makes deck estimation a required skill.",
        ],
      },
      {
        title: "Deck estimation",
        body: [
          "In a shoe game, estimate either decks remaining in the shoe or decks in the discard tray, depending on what you can see. Many learners start with full-deck estimation, then tighten to half-deck estimation.",
          "Do not obsess over perfect precision at first. A conservative, repeatable estimate is better than freezing while the game moves.",
        ],
      },
      {
        title: "Rounding choices",
        body: [
          "Different training systems floor, truncate, or round true counts. This app truncates toward zero for drills because it is simple and conservative for beginners.",
          "Whatever convention you use, keep it consistent across your bet ramp and index numbers. Mixing rounding systems creates hidden errors.",
        ],
      },
    ],
    drills: [
      "Stack one to eight decks and quiz yourself on visual deck estimates.",
      "Use random running counts and divide by 1, 1.5, 2, 3, 4, and 6 decks.",
      "Call out true count before touching chips in mock rounds.",
      "Practice late-shoe scenarios where the same running count changes sharply.",
    ],
    mistakes: [
      "Using running count directly in a six-deck shoe.",
      "Overestimating remaining decks, which weakens positive counts.",
      "Changing rounding style from hand to hand.",
    ],
    sources: [
      researchSources[0],
      researchSources[5],
      researchSources[7],
    ],
  },
  {
    slug: "bet-ramps-bankroll-risk",
    title: "Bet ramps, bankroll, and risk",
    badge: "Money",
    duration: "24 min",
    summary:
      "Learn why counting makes money primarily through bet sizing, why variance is brutal, and why bankroll decisions matter as much as arithmetic.",
    videoId: "jWvkK_H0HEg",
    videoTitle: "The Science and Art of Bet Spreads in Blackjack",
    objectives: [
      "Understand bet spread and bet ramp vocabulary.",
      "Tie bet size to true count, not emotion.",
      "Understand why risk of ruin matters.",
      "Keep practice bankroll math separate from gambling promises.",
    ],
    quickRules: [
      "Bet minimum at neutral or negative counts.",
      "Increase only when the true count justifies it.",
      "A bigger spread can increase EV and attention at the same time.",
      "No bet ramp removes losing streaks.",
    ],
    sections: [
      {
        title: "Bet ramp basics",
        body: [
          "A bet ramp maps true count to bet size. A simple beginner mental model is 1 unit at TC 0-1, 2 units at TC 2, 4 units at TC 3, and 6 units or more at TC 4+, but real ramps depend on rules, penetration, bankroll, and heat tolerance.",
          "The count is valuable because it tells you when to put more money out. Flat betting with a count captures much less value.",
        ],
      },
      {
        title: "Risk of ruin",
        body: [
          "Risk of ruin is the chance your bankroll hits zero before the long-run edge has time to show. The same game can be reasonable or reckless depending on bankroll size and bet spread.",
          "A small edge with big bets can still go broke. Good counters think in units, session swings, standard deviation, and emotional durability.",
        ],
      },
      {
        title: "Heat and practical constraints",
        body: [
          "A bigger spread may be mathematically stronger, but it can draw attention. Real play involves tradeoffs between EV, variance, table limits, casino tolerance, and your ability to act naturally.",
          "For this learning app, treat bet ramps as educational. Do not use the app as financial advice or proof that a bankroll is safe.",
        ],
      },
    ],
    drills: [
      "Create a paper ramp for TC -1 through +6 using units, not dollars.",
      "Run ten mock shoes and say the bet before each hand.",
      "Mark every place where your ramp would jump and ask whether the jump is practical.",
      "Compare two ramps: conservative 1-6 and aggressive 1-12.",
    ],
    mistakes: [
      "Increasing bets after losses instead of after favorable true counts.",
      "Confusing expected value with guaranteed profit.",
      "Using dollars before deciding the bankroll and unit size.",
    ],
    sources: [
      researchSources[4],
      researchSources[8],
      researchSources[5],
    ],
  },
  {
    slug: "deviations-illustrious-18",
    title: "Deviations, Illustrious 18, and Fab 4",
    badge: "Deviations",
    duration: "26 min",
    summary:
      "Move beyond basic strategy with the highest-value count-based play changes, starting with insurance, 16 vs 10, and 15 vs 10.",
    videoId: "ybrQS0di1Fo",
    videoTitle: "The Illustrious 18 - Card Counting Deviations for Blackjack",
    objectives: [
      "Understand what an index number means.",
      "Learn why deviations are secondary to betting and counting accuracy.",
      "Memorize the first few high-value deviations.",
      "Know how surrender interacts with deviation charts.",
    ],
    quickRules: [
      "Take insurance at TC +3 or higher.",
      "Stand on hard 16 vs dealer 10 at TC 0 or higher.",
      "Stand on hard 15 vs dealer 10 at TC +4 or higher.",
      "Index charts vary by rules and surrender availability.",
    ],
    sections: [
      {
        title: "What an index number means",
        body: [
          "An index number is the true-count threshold where a play changes. If 15 vs 10 has an index of +4, then basic strategy applies below +4 and the index play applies at +4 or higher.",
          "Most early index plays are close calls. That is why the count can tip them from hit to stand, no insurance to insurance, or hit to double.",
        ],
      },
      {
        title: "The first deviations",
        body: [
          "The most common first three are insurance at +3, stand on 16 vs 10 at 0 or higher, and stand on 15 vs 10 at +4 or higher. These are prominent because they occur often or carry meaningful value.",
          "Pairs of tens against 5 or 6 appear in many Illustrious 18 lists, but they are also attention-grabbing in live play. Learn the math, then understand the practical tradeoff.",
        ],
      },
      {
        title: "Fab 4 surrender",
        body: [
          "When late surrender is offered, surrender indices matter. Surrender lets you lose half instead of playing out a bad hand, and the correct threshold can change with count and rules.",
          "Always know whether your chart assumes surrender. A chart with surrender and a chart without surrender can recommend different fallback plays.",
        ],
      },
    ],
    drills: [
      "Memorize the top three deviations and test them with random true counts.",
      "Build flashcards for the Illustrious 18 in groups of four.",
      "Practice saying both the below-index and at-or-above-index play.",
      "Run the app's Decision drill after reviewing this page.",
    ],
    mistakes: [
      "Learning deviations before basic strategy is automatic.",
      "Using running count instead of true count for indices.",
      "Ignoring whether surrender is available.",
    ],
    sources: [
      researchSources[0],
      {
        label: "Wizard of Odds: surrender",
        href: "https://wizardofodds.com/games/blackjack/surrender/",
      },
      {
        label: "Blackjack Forum: Illustrious 18 index examples",
        href: "https://www.blackjacktheforum.com/showthread.php?p=125286",
      },
    ],
  },
  {
    slug: "game-selection-table-conditions",
    title: "Game selection and table conditions",
    badge: "Real tables",
    duration: "21 min",
    summary:
      "Learn what makes a blackjack game worth training for: rules, penetration, shuffle style, table limits, payout, speed, and whether counting is even practical.",
    videoId: "u3ZYXfYK1d0",
    videoTitle: "2 Deck vs 6 Deck: Which Is Better for Blackjack?",
    objectives: [
      "Evaluate rules before sitting down.",
      "Understand penetration and why frequent shuffling hurts counters.",
      "Spot games that are not useful for counting practice.",
      "Understand legal and casino-policy realities.",
    ],
    quickRules: [
      "Prefer 3:2 blackjack over 6:5.",
      "Good penetration matters because deep shoes create stronger count opportunities.",
      "Continuous shuffle machines largely erase count usefulness.",
      "Counting is a mental strategy, but casinos can still refuse service.",
    ],
    sections: [
      {
        title: "Rules and payouts",
        body: [
          "Game selection starts with rules. The best counting skill cannot rescue a terrible payout like 6:5 blackjack. S17, surrender, DAS, and fewer decks generally improve the player's position.",
          "Before playing, identify deck count, blackjack payout, soft-17 rule, double rules, surrender, resplitting limits, and table limits.",
        ],
      },
      {
        title: "Penetration",
        body: [
          "Penetration is how much of the shoe is dealt before shuffle. Deeper penetration gives the count more time to become meaningful and gives the player more chances to bet into strong counts.",
          "A shallow cut card can turn an otherwise decent game into a poor opportunity. Penetration is not the only factor, but it is a major one.",
        ],
      },
      {
        title: "Practical and legal realities",
        body: [
          "Card counting with your brain is generally discussed as legal in many jurisdictions, but casinos are private businesses and can back off, bar, or refuse service to players they believe are counting.",
          "Do not use devices or coordinate anything illegal. This app is for education, arithmetic practice, and understanding blackjack math.",
        ],
      },
    ],
    drills: [
      "Write a table scouting checklist and use it on sample rule sets.",
      "Rank three fictional games by payout, rules, and penetration.",
      "Identify which games are impossible or poor for counting because of continuous shuffling.",
      "Practice explaining why 3:2 vs 6:5 matters in one paragraph.",
    ],
    mistakes: [
      "Sitting at a 6:5 game because it has a low minimum.",
      "Ignoring penetration because the posted rules look decent.",
      "Practicing counting for online games that shuffle every hand.",
    ],
    sources: [
      researchSources[3],
      {
        label: "Wizard of Odds: why number of decks matters",
        href: "https://wizardofodds.com/games/blackjack/why-number-of-decks-matter/",
      },
      {
        label: "Wizard of Odds: card counting Q&A",
        href: "https://wizardofodds.com/ask-the-wizard/blackjack/card-counting/",
      },
    ],
  },
  {
    slug: "training-plan-checkout-skills",
    title: "Training plan and checkout skills",
    badge: "Practice",
    duration: "19 min",
    summary:
      "Turn concepts into a repeatable practice plan: basic strategy, running count, deck estimation, true count, bet ramp, deviations, and mock casino distractions.",
    videoId: "nucXpdPClHg",
    videoTitle: "How to Learn Card Counting: A Practical Guide",
    objectives: [
      "Build a staged training sequence.",
      "Know what to practice before adding more complexity.",
      "Use measurable checkout tests.",
      "Train distractions and table rhythm.",
    ],
    quickRules: [
      "Accuracy first, then speed.",
      "Add only one new skill at a time.",
      "Test skills under distraction before trusting them.",
      "Keep a written error log.",
    ],
    sections: [
      {
        title: "The staged path",
        body: [
          "Start with basic strategy until it is automatic. Add running count with a single deck. Add multi-hand layouts. Add deck estimation. Add true count conversion. Add a bet ramp. Add deviations last.",
          "This order matters because each skill consumes attention. If running count is still effortful, adding deck estimation and deviations will overload you.",
        ],
      },
      {
        title: "Checkout tests",
        body: [
          "A useful checkout is objective: count down a deck accurately, answer random true-count conversions, play basic strategy without chart help, and call the correct bet and deviation in mock rounds.",
          "Do not count a session as clean just because it felt good. Record wrong answers and repeat the exact category the next day.",
        ],
      },
      {
        title: "Distraction training",
        body: [
          "Real tables are noisy. People talk, chips move, cards overlap, and dealers vary speed. Practice while someone asks easy questions, plays music, or deals multiple hands.",
          "The goal is calm execution. If a distraction breaks the count, reset honestly rather than inventing a number.",
        ],
      },
    ],
    drills: [
      "Create a one-week plan with one primary skill per day.",
      "Run 100 basic strategy flashcards and record categories missed.",
      "Count mock rounds while answering simple conversation questions.",
      "Use this app's three drills in order: Running count, True count, Decision.",
    ],
    mistakes: [
      "Adding deviations too early.",
      "Practicing only clean deck countdowns and never real table layouts.",
      "Not tracking errors by category.",
    ],
    sources: [
      researchSources[7],
      researchSources[6],
      {
        label: "Blackjack Apprenticeship: training equipment",
        href: "https://www.blackjackapprenticeship.com/what-you-need-for-blackjack-training/",
      },
    ],
  },
];

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
