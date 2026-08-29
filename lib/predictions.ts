/* Fan prediction markets for the Sepang race weekend.

   Deliberately NOT real betting: the stake is a fictional currency ("Teh
   Points"), there is no purchase, no cash-out, and no real money anywhere.
   It's a prediction game in the spirit of the hackathon brief's "fan
   prediction tools", using market-style odds because shifting odds are more
   fun to watch than a static poll.

   Odds move with the crowd: each market carries a seeded backing split, and
   the player's own stake nudges it. Payout uses the odds at the moment the
   bet is placed, which is how a real market works and stops a player from
   gaming their own late vote. */

export type Market = {
  id: string;
  /** The claim being predicted. Always a yes/no. */
  question: string;
  /** Sepang-specific context so it doesn't read like a generic sports bet. */
  flavour: string;
  /** Seeded backing, 0..1 = share of crowd on YES. */
  seedYes: number;
  closesIn: string;
};

export const MARKETS: Market[] = [
  {
    id: "rain-before-lap-30",
    question: "Rain falls before lap 30",
    flavour: "The 4pm cell over Turn 11 has shown up in three of the last five races here.",
    seedYes: 0.62,
    closesIn: "Lights out",
  },
  {
    id: "safety-car",
    question: "Safety car deployed at least once",
    flavour: "Sepang's run-off is generous, but Turn 1 on lap 1 is Turn 1 on lap 1.",
    seedYes: 0.71,
    closesIn: "Lights out",
  },
  {
    id: "track-over-50",
    question: "Track temperature tops 50°C",
    flavour: "The asphalt here has hit 60°C. Tyre engineers lose sleep over this one.",
    seedYes: 0.55,
    closesIn: "Race start",
  },
  {
    id: "three-stop",
    question: "Race winner makes 3+ pit stops",
    flavour: "Heat, degradation, and a monsoon in the wings. Two stops may not survive.",
    seedYes: 0.38,
    closesIn: "Lap 1",
  },
  {
    id: "under-90s",
    question: "Someone laps under 1:35",
    flavour: "A dry line and fresh softs late on is how records fall at Sepang.",
    seedYes: 0.44,
    closesIn: "Qualifying",
  },
];

export type Bet = {
  marketId: string;
  side: "YES" | "NO";
  stake: number;
  /** Odds locked at placement — payout uses these, not current odds. */
  oddsAtPlacement: number;
};

const KEY = "jomlap.predictions.v1";
const STARTING_BALANCE = 500;

export type PredictionState = {
  balance: number;
  bets: Bet[];
};

const EMPTY: PredictionState = { balance: STARTING_BALANCE, bets: [] };

export function readPredictions(): PredictionState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

export function writePredictions(s: PredictionState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — the session still plays, it just won't persist */
  }
}

/** Current YES share for a market, nudged by whatever the player has staked. */
export function yesShare(market: Market, bets: Bet[]): number {
  const mine = bets.filter((b) => b.marketId === market.id);
  if (mine.length === 0) return market.seedYes;

  // Treat the seed as ~2000 points of existing crowd money so a single
  // player moves the line visibly but can't flip it single-handedly.
  const CROWD = 2000;
  const yesMoney = CROWD * market.seedYes +
    mine.filter((b) => b.side === "YES").reduce((s, b) => s + b.stake, 0);
  const noMoney = CROWD * (1 - market.seedYes) +
    mine.filter((b) => b.side === "NO").reduce((s, b) => s + b.stake, 0);

  return yesMoney / (yesMoney + noMoney);
}

/** Decimal payout multiplier for a side, given the current share. */
export function oddsFor(share: number, side: "YES" | "NO"): number {
  const p = side === "YES" ? share : 1 - share;
  // Clamp so a near-certain outcome still pays something and a long shot
  // doesn't pay absurdly. 5% house-style margin baked in.
  const clamped = Math.min(0.95, Math.max(0.05, p));
  return Math.round((1 / clamped) * 0.95 * 100) / 100;
}

export function placeBet(market: Market, side: "YES" | "NO", stake: number) {
  const state = readPredictions();
  if (stake <= 0 || stake > state.balance) return state;

  const odds = oddsFor(yesShare(market, state.bets), side);
  const next: PredictionState = {
    balance: state.balance - stake,
    bets: [...state.bets, { marketId: market.id, side, stake, oddsAtPlacement: odds }],
  };
  writePredictions(next);
  return next;
}

export const totalStaked = (bets: Bet[]) => bets.reduce((s, b) => s + b.stake, 0);

export const potentialReturn = (bets: Bet[]) =>
  Math.round(bets.reduce((s, b) => s + b.stake * b.oddsAtPlacement, 0));
