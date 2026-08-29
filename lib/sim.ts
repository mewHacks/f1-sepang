import { advocateOf, type Call } from "./personas.ts";
import { evaporationPerLap, type Scenario } from "./scenarios.ts";

/* Deterministic race resolver.

   ponytail: this is a decay curve, not a physics engine. Every lap is one pass
   of arithmetic — no integration, no tyre thermal model, no solver. It runs in
   under a millisecond on a budget phone and produces the only three things the
   UI needs: a lap trace to draw, a gap, and a score. */

const BASE_LAP_S = 95.0; // Sepang race pace, roughly
const PIT_LOSS_S = 21.5; // pit lane delta at Sepang

type Compound = "hard" | "inter" | "wet";

/* maxPenalty is the fraction of grip lost when the compound is completely wrong
   for the conditions. Slicks in standing water is a far worse place to be than
   wets on a dry line, so the ceilings differ — without that, hard's higher peak
   grip wins even in a monsoon. */
const COMPOUND: Record<
  Compound,
  {
    label: string;
    optimal: number;
    tolerance: number;
    peakGrip: number;
    maxPenalty: number;
    degPerLap: number;
  }
> = {
  hard: {
    label: "HARD",
    optimal: 0.0,
    tolerance: 0.34,
    peakGrip: 1.0,
    maxPenalty: 0.42,
    degPerLap: 0.016,
  },
  inter: {
    label: "INTER",
    optimal: 0.5,
    tolerance: 0.42,
    peakGrip: 0.95,
    maxPenalty: 0.24,
    degPerLap: 0.026,
  },
  wet: {
    label: "WET",
    optimal: 0.9,
    tolerance: 0.48,
    peakGrip: 0.89,
    maxPenalty: 0.22,
    degPerLap: 0.021,
  },
};

const CALL_COMPOUND: Record<Call, { compound: Compound; pits: boolean }> = {
  BOX_INTERS: { compound: "inter", pits: true },
  STAY_OUT: { compound: "hard", pits: false },
  FULL_WET: { compound: "wet", pits: true },
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** How far off this compound's happy place we are, 0 (perfect) .. 1 (hopeless). */
const mismatch = (c: Compound, wetness: number) =>
  clamp(Math.abs(wetness - COMPOUND[c].optimal) / COMPOUND[c].tolerance, 0, 1);

/** Standing water per lap. Rain adds, hot asphalt takes away. */
export function wetnessTrace(s: Scenario): number[] {
  const evap = evaporationPerLap(s.trackTempC);
  const out: number[] = [];
  let w = 0;
  for (let lap = 1; lap <= s.lapsRemaining; lap++) {
    const raining = lap >= s.rainArrivesLap && lap < (s.rainStopsLap ?? Infinity);
    if (raining) w += s.rainRampPerLap;
    w = clamp(w - evap, 0, s.rainPeak);
    out.push(w);
  }
  return out;
}

export type LapPoint = {
  lap: number;
  wetness: number;
  tyreLife: number; // 1 = fresh, 0 = dead
  lapTime: number;
  /** Cumulative gap to the reference car. Negative = ahead. */
  gap: number;
};

export type RaceResult = {
  call: Call;
  compound: string;
  laps: LapPoint[];
  totalTime: number;
  /** Final gap to the reference car in seconds. Negative = you won the undercut. */
  finalGap: number;
  positionsGained: number;
  strategyIQ: number;
  bestCall: Call;
  wasOptimal: boolean;
  /** Persona whose advice would have been correct. */
  rightAllAlong: ReturnType<typeof advocateOf>;
};

/** Race a single strategy through the scenario. Pure, deterministic. */
function runStint(s: Scenario, call: Call, wet: number[]) {
  const { compound, pits } = CALL_COMPOUND[call];
  const spec = COMPOUND[compound];
  const laps: Omit<LapPoint, "gap">[] = [];

  let tyreLife = 1;
  let total = 0;

  for (let i = 0; i < s.lapsRemaining; i++) {
    const wetness = wet[i];
    const m = mismatch(compound, wetness);

    // Wrong rubber for the conditions both slows you and eats the tyre.
    const grip = spec.peakGrip * (1 - spec.maxPenalty * m * m);
    const wear = spec.degPerLap * (1 + 1.2 * m);
    tyreLife = clamp(tyreLife - wear, 0, 1);

    const effective = grip * (0.72 + 0.28 * tyreLife);
    let lapTime = BASE_LAP_S / effective;
    if (pits && i === 0) lapTime += PIT_LOSS_S;

    total += lapTime;
    laps.push({ lap: i + 1, wetness, tyreLife, lapTime });
  }

  return { laps, total };
}

/**
 * The rest of the field: boxes for inters the moment the track is properly wet,
 * otherwise sits on hards. Gives the player something to be measured against.
 */
function referenceTime(s: Scenario, wet: number[]) {
  const goesWet = wet.some((w) => w > 0.4);
  return runStint(s, goesWet ? "BOX_INTERS" : "STAY_OUT", wet).total;
}

export function resolve(s: Scenario, call: Call): RaceResult {
  const wet = wetnessTrace(s);
  const ref = referenceTime(s, wet);

  const all = (["BOX_INTERS", "STAY_OUT", "FULL_WET"] as Call[]).map((c) => ({
    call: c,
    total: runStint(s, c, wet).total,
  }));
  const best = all.reduce((a, b) => (b.total < a.total ? b : a));
  const worst = all.reduce((a, b) => (b.total > a.total ? b : a));

  const mine = runStint(s, call, wet);

  // Running gap against a reference car doing an even share of its own total.
  const refPerLap = ref / s.lapsRemaining;
  let cum = 0;
  const laps: LapPoint[] = mine.laps.map((l) => {
    cum += l.lapTime - refPerLap;
    return { ...l, gap: cum };
  });

  const spread = worst.total - best.total;
  // Everything within a second of everything else — the scenario had no real
  // answer, so don't pretend the player nailed or blew it.
  const strategyIQ =
    spread < 1
      ? 70
      : Math.round(clamp(100 - ((mine.total - best.total) / spread) * 60, 40, 100));

  const finalGap = mine.total - ref;

  return {
    call,
    compound: COMPOUND[CALL_COMPOUND[call].compound].label,
    laps,
    totalTime: mine.total,
    finalGap,
    // ~1.4s of race pace per track position at Sepang.
    positionsGained: Math.round(-finalGap / 1.4),
    strategyIQ,
    bestCall: best.call,
    wasOptimal: best.call === call,
    rightAllAlong: advocateOf(best.call),
  };
}

export function iqGrade(iq: number) {
  if (iq >= 95) return "PIT WALL LEGEND";
  if (iq >= 80) return "SOLID CALL";
  if (iq >= 65) return "SURVIVABLE";
  if (iq >= 50) return "ROUGH ONE";
  return "BOX BOX BOX (YOU'RE FIRED)";
}
