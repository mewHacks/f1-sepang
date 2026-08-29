import type { Persona } from "./personas.ts";

/* Every line the engineers can say without a network call.

   This is not a stub — it is the demo safety net. If ILMU's early-access
   endpoint is down, a key is missing, or the free quota is exhausted at the
   worst possible moment, the app still plays start to finish and nobody
   watching can tell. The LLM upgrades these lines; it is not load-bearing. */

type Phase = "brief" | "verdict";

const LINES: Record<Persona["id"], Record<string, Record<Phase, string[]>>> = {
  aero9: {
    turn11: {
      brief: [
        "Cell over Turn 11 is committing. Crossover in 1.4 laps.",
        "Wet-line probability 87.2 percent. Box. Box now.",
      ],
      verdict: ["Model held. Delta recovered inside three laps."],
    },
    ghost: {
      brief: [
        "Precipitation detected sector 2. Recommend inters immediately.",
        "I cannot model asphalt evaporation. Confidence 61.0 percent. That frightens me.",
      ],
      verdict: ["Track dried faster than forecast. Adjusting weights. Uncomfortable."],
    },
    deluge: {
      brief: [
        "Standing water sector 3. Inters are 4.1 seconds off optimum.",
        "This exceeds my parameters. Box for inters, immediately.",
      ],
      verdict: ["Intermediates aquaplaned. Full wets were correct. Logging the error."],
    },
  },
  uncle: {
    turn11: {
      brief: [
        "Aiyo, this one different. Cloud damn black already, not passing.",
        "Okay okay, this time the computer boy is right. Box la.",
      ],
      verdict: ["Correct call. Even old man must admit sometimes."],
    },
    ghost: {
      brief: [
        "Eh relax. Track fifty-two degrees, rain touch also vaporize la.",
        "Twenty-two years I stand here. Don't pit. Trust uncle, can one.",
      ],
      verdict: ["See? Dry already. Sepang always like that, don't play play."],
    },
    deluge: {
      brief: [
        "This one no joke. Back straight already got river.",
        "Cannot save this one with slicks. Go full wet, faster the better.",
      ],
      verdict: ["Ya, monsoon proper. Nothing to read, just survive."],
    },
  },
  din: {
    turn11: {
      brief: [
        "Bro bro bro, full wets now, we go viral!",
        "Inters is for people scared of their mother. Send it.",
      ],
      verdict: ["Okay inters worked. But full wet would look cooler, admit it."],
    },
    ghost: {
        brief: [
        "Wets. Now. Trust me bro, I saw a TikTok about this.",
        "If we pit first we get the meme. Content is content.",
      ],
      verdict: ["Track dried. I lost. But my lap onboard still slaps."],
    },
    deluge: {
      brief: [
        "YO I TOLD YOU. Full wets, right now, no thinking!",
        "This is literally my Kesas Highway commute. Bolt them on.",
      ],
      verdict: ["FULL SEND VINDICATED. Uncle, respectfully, get rekt."],
    },
  },
};

export function fallbackLine(
  personaId: Persona["id"],
  scenarioId: string,
  phase: Phase,
  seed = 0,
): string {
  const byScenario = LINES[personaId];
  const pool = (byScenario[scenarioId] ?? byScenario.turn11)[phase];
  return pool[seed % pool.length];
}
