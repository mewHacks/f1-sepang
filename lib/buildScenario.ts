import type { Call } from "./personas.ts";
import type { Scenario } from "./scenarios.ts";
import { resolve } from "./sim.ts";

/* Turns the player's mix-and-match weather/race conditions into a real Scenario
   the simulation can resolve. Keeps the same fields the curated scenarios use,
   so the rest of the engine (sim, lap chart, scoring) is untouched. */

export type TrackHeat = "cool" | "warm" | "scorch";
export type Rain = "dry" | "spit" | "cell" | "monsoon";
export type Length = "sprint" | "gp" | "enduro";

export type Mix = {
  track: TrackHeat;
  rain: Rain;
  length: Length;
  sc: boolean;
};

const TRACK: Record<TrackHeat, number> = { cool: 34, warm: 44, scorch: 54 };
const RAIN: Record<Rain, { peak: number; arrives: number; stops?: number; ramp: number; humidity: number }> = {
  dry: { peak: 0, arrives: 99, ramp: 0, humidity: 52 },
  spit: { peak: 0.35, arrives: 4, stops: 8, ramp: 0.22, humidity: 78 },
  cell: { peak: 0.62, arrives: 2, ramp: 0.3, humidity: 89 },
  monsoon: { peak: 1.0, arrives: 1, ramp: 0.36, humidity: 96 },
};
const LAPS: Record<Length, number> = { sprint: 8, gp: 12, enduro: 18 };

const LABEL = {
  track: { cool: "Cool 34°C", warm: "Warm 44°C", scorch: "Scorching 54°C" },
  rain: { dry: "Bone dry", spit: "Spitting", cell: "Cell rolling in", monsoon: "Full monsoon" },
  length: { sprint: "8-lap sprint", gp: "12-lap GP", enduro: "18-lap endurance" },
};

export function mixLabel(m: Mix) {
  return `${LABEL.track[m.track]} · ${LABEL.rain[m.rain]} · ${LABEL.length[m.length]}${
    m.sc ? " · Safety car" : ""
  }`;
}

export function buildScenario(m: Mix): Scenario {
  const trackTempC = TRACK[m.track];
  const r = RAIN[m.rain];
  // A safety car bunches the field and speeds up the crossover — model it as a
  // slightly faster wetness ramp and a note in the brief.
  const ramp = r.ramp + (m.sc ? 0.06 : 0);
  const airTempC = Math.max(20, trackTempC - 10);
  const lapsRemaining = LAPS[m.length];

  const base: Scenario = {
    id: `custom-${m.track}-${m.rain}-${m.length}${m.sc ? "-sc" : ""}`,
    name: `${LABEL.rain[m.rain]} · ${LABEL.length[m.length]}`,
    blurb:
      `${LABEL.rain[m.rain].toLowerCase()} at Sepang, track reading ${trackTempC}°C. ` +
      `${lapsRemaining} laps left${m.sc ? ", safety car due mid-race" : ""}. Three engineers, three opinions.`,
    trackTempC,
    airTempC,
    humidityPct: r.humidity,
    lapsRemaining,
    rainArrivesLap: r.arrives,
    rainStopsLap: r.stops,
    rainRampPerLap: ramp,
    rainPeak: r.peak,
    expectedBest: "STAY_OUT",
  };

  // Derive the objectively right call from the simulation so the game always
  // has a defensible "correct" answer, whatever the player mixes.
  const calls: Call[] = ["BOX_INTERS", "STAY_OUT", "FULL_WET"];
  const best = calls
    .map((c) => ({ c, total: resolve(base, c).totalTime }))
    .sort((a, b) => a.total - b.total)[0].c;
  base.expectedBest = best;

  return base;
}
