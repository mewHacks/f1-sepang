/* Player progress: achievements, XP, and the local leaderboard.

   All of it lives in localStorage. No backend, no auth, no accounts — this
   is a hackathon demo judged over a few days, and a login wall between a
   judge and the game would cost far more than a shared score table is worth.
   The leaderboard is therefore "this device", seeded with a few pace-setter
   entries so a first-time player has something to climb toward rather than
   staring at a table with one row.

   ponytail: localStorage + a seeded table beats a database here. Swap the
   read/write pair below for fetch() if this ever needs to be global. */

export type Achievement = {
  id: string;
  name: string;
  /** What the player has to actually do. Shown before unlocking. */
  how: string;
  xp: number;
  /** Rarity drives the badge colour. */
  tier: "bronze" | "silver" | "gold";
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-call",
    name: "First Call",
    how: "Make your first strategy call",
    xp: 10,
    tier: "bronze",
  },
  {
    id: "perfect-call",
    name: "Perfect Call",
    how: "Score 100 Strategy IQ on any race",
    xp: 50,
    tier: "gold",
  },
  {
    id: "storm-reader",
    name: "Storm Reader",
    how: "Win the Ghost Rain race — the one that fools everyone",
    xp: 30,
    tier: "silver",
  },
  {
    id: "monsoon-master",
    name: "Monsoon Master",
    how: "Win The 4PM Deluge on full wets",
    xp: 30,
    tier: "silver",
  },
  {
    id: "all-weather",
    name: "All-Weather Strategist",
    how: "Win all three weather scenarios",
    xp: 75,
    tier: "gold",
  },
  {
    id: "trusted-uncle",
    name: "Trust Uncle",
    how: "Follow Uncle Sepang's call and be right",
    xp: 20,
    tier: "bronze",
  },
  {
    id: "full-send",
    name: "Full Send",
    how: "Follow Din Turbo's call and be right",
    xp: 20,
    tier: "bronze",
  },
  {
    id: "by-the-numbers",
    name: "By The Numbers",
    how: "Follow Aero-9's call and be right",
    xp: 20,
    tier: "bronze",
  },
  {
    id: "oracle",
    name: "Sepang Oracle",
    how: "Get 3 race predictions right",
    xp: 40,
    tier: "gold",
  },
  {
    id: "punter",
    name: "Punter",
    how: "Place your first race prediction",
    xp: 10,
    tier: "bronze",
  },
  {
    id: "supper-sorted",
    name: "Supper Sorted",
    how: "Finish the mamak quiz and get matched",
    xp: 15,
    tier: "bronze",
  },
  {
    id: "shared",
    name: "Certified Poser",
    how: "Share your Circuit Pass",
    xp: 15,
    tier: "bronze",
  },
];

export type Progress = {
  unlocked: string[];
  xp: number;
  bestIQ: number;
  racesRun: number;
  wins: string[]; // scenario ids won
  correctPredictions: number;
};

const KEY = "jomlap.progress.v1";

const EMPTY: Progress = {
  unlocked: [],
  xp: 0,
  bestIQ: 0,
  racesRun: 0,
  wins: [],
  correctPredictions: 0,
};

export function readProgress(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    // Corrupt or blocked storage — start fresh rather than crashing the app.
    return EMPTY;
  }
}

export function writeProgress(p: Progress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode / storage full — progress just won't persist */
  }
}

/** Unlock achievements, returning only the newly-earned ones so the UI can
    announce them. Already-unlocked ids are ignored, so this is safe to call
    repeatedly with the same input. */
export function grant(ids: string[]): Achievement[] {
  const p = readProgress();
  const fresh = ids.filter((id) => !p.unlocked.includes(id));
  if (fresh.length === 0) return [];

  const earned = ACHIEVEMENTS.filter((a) => fresh.includes(a.id));
  p.unlocked.push(...fresh);
  p.xp += earned.reduce((sum, a) => sum + a.xp, 0);
  writeProgress(p);
  return earned;
}

/** Record a finished race and work out what it unlocked. */
export function recordRace(opts: {
  scenarioId: string;
  strategyIQ: number;
  wasOptimal: boolean;
  advocateId: string;
  call: string;
}): Achievement[] {
  const p = readProgress();
  p.racesRun += 1;
  p.bestIQ = Math.max(p.bestIQ, opts.strategyIQ);
  if (opts.wasOptimal && !p.wins.includes(opts.scenarioId)) {
    p.wins.push(opts.scenarioId);
  }
  writeProgress(p);

  const ids = ["first-call"];
  if (opts.strategyIQ === 100) ids.push("perfect-call");
  if (opts.wasOptimal) {
    if (opts.scenarioId === "ghost") ids.push("storm-reader");
    if (opts.scenarioId === "deluge" && opts.call === "FULL_WET")
      ids.push("monsoon-master");
    if (opts.advocateId === "uncle") ids.push("trusted-uncle");
    if (opts.advocateId === "din") ids.push("full-send");
    if (opts.advocateId === "aero9") ids.push("by-the-numbers");
  }
  if (readProgress().wins.length >= 3) ids.push("all-weather");

  return grant(ids);
}

export function recordPrediction(correct: boolean): Achievement[] {
  const p = readProgress();
  if (correct) {
    p.correctPredictions += 1;
    writeProgress(p);
  }
  const ids = ["punter"];
  if (readProgress().correctPredictions >= 3) ids.push("oracle");
  return grant(ids);
}

/* ---- rank ------------------------------------------------------------- */

export const RANKS = [
  { at: 0, name: "Rookie" },
  { at: 40, name: "Junior Strategist" },
  { at: 100, name: "Race Engineer" },
  { at: 180, name: "Chief Strategist" },
  { at: 280, name: "Pit Wall Legend" },
];

export const rankFor = (xp: number) =>
  [...RANKS].reverse().find((r) => xp >= r.at) ?? RANKS[0];

/* ---- leaderboard ------------------------------------------------------ */

export type LeaderRow = { name: string; xp: number; bestIQ: number; you?: boolean };

/* Seeded pace-setters. Clearly fictional names so nobody mistakes these for
   real players — they exist to give a solo player something to climb. */
const SEED: LeaderRow[] = [
  { name: "TURN11 TAUFIK", xp: 310, bestIQ: 100 },
  { name: "MONSOON MEI", xp: 245, bestIQ: 100 },
  { name: "KOPI O KAUTIM", xp: 190, bestIQ: 92 },
  { name: "BOXBOX BALQIS", xp: 120, bestIQ: 84 },
  { name: "SLICK SYAFIQ", xp: 65, bestIQ: 77 },
  { name: "ROOKIE RAJ", xp: 25, bestIQ: 64 },
];

export function leaderboard(callsign: string): LeaderRow[] {
  const p = readProgress();
  const you: LeaderRow = {
    name: callsign.trim() || "YOU",
    xp: p.xp,
    bestIQ: p.bestIQ,
    you: true,
  };
  return [...SEED, you].sort((a, b) => b.xp - a.xp || b.bestIQ - a.bestIQ);
}
