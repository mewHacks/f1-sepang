import type { Call } from "./personas.ts";

export type Scenario = {
  id: string;
  name: string;
  /** One line shown on the scenario picker. */
  blurb: string;
  trackTempC: number;
  airTempC: number;
  humidityPct: number;
  lapsRemaining: number;
  /** Lap (1-indexed within the remaining window) the rain starts falling. */
  rainArrivesLap: number;
  /** Lap the cell passes over. Omit for rain that never lets up. */
  rainStopsLap?: number;
  /** How fast standing water builds once it starts. */
  rainRampPerLap: number;
  /** Ceiling wetness for this weather cell, 0..1. */
  rainPeak: number;
  /** The call the sim rewards. Asserted in sim.check.ts so tuning can't drift. */
  expectedBest: Call;
};

/* Sepang's whole character is that hot asphalt fights the rain. Evaporation is
   derived from track temp rather than hand-set per scenario, so "50°C track
   boils off light rain" is a real mechanic, not flavour text. */
export const evaporationPerLap = (trackTempC: number) =>
  Math.max(0, (trackTempC - 30) * 0.0085);

export const SCENARIOS: Scenario[] = [
  {
    id: "turn11",
    name: "Turn 11 Cell",
    blurb: "Dark wall building over Turn 11. Radar says it commits. 12 laps left.",
    trackTempC: 42,
    airTempC: 32,
    humidityPct: 88,
    lapsRemaining: 12,
    rainArrivesLap: 2,
    rainRampPerLap: 0.3,
    rainPeak: 0.6,
    expectedBest: "BOX_INTERS",
  },
  {
    id: "ghost",
    name: "Ghost Rain",
    blurb: "Spits of rain, track reading 52°C. Half the field is panicking.",
    trackTempC: 52,
    airTempC: 35,
    humidityPct: 79,
    lapsRemaining: 12,
    rainArrivesLap: 4,
    rainStopsLap: 8,
    rainRampPerLap: 0.3,
    rainPeak: 0.45,
    expectedBest: "STAY_OUT",
  },
  {
    id: "deluge",
    name: "The 4PM Deluge",
    blurb: "Monsoon proper. Rivers across the back straight within two laps.",
    trackTempC: 38,
    airTempC: 27,
    humidityPct: 96,
    lapsRemaining: 12,
    rainArrivesLap: 2,
    rainRampPerLap: 0.34,
    rainPeak: 1.0,
    expectedBest: "FULL_WET",
  },
];

export const scenarioById = (id: string) =>
  SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];

/* Custom, mix-and-match scenarios the player builds in the Pit Wall are kept
   in a client-side registry so Debrief / SharePass can look them up by id
   without a backend. The radio API never relies on this — the browser sends
   the scenario fields with each request instead. */
const CUSTOM = new Map<string, Scenario>();

export function registerScenario(s: Scenario) {
  CUSTOM.set(s.id, s);
}

export function getCustomScenario(id: string): Scenario | undefined {
  return CUSTOM.get(id);
}
