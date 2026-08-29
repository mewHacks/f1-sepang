"use client";

import { useState } from "react";
import { Header } from "@/components/Chrome.tsx";
import { Landing } from "@/components/Landing.tsx";
import { PitWall } from "@/components/PitWall.tsx";
import { Debrief } from "@/components/Debrief.tsx";
import { resolve, type RaceResult } from "@/lib/sim.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import type { Call } from "@/lib/personas.ts";

/* One route, three stages. A stage machine beats three pages here: the run
   is a single continuous act, and routing it would mean serialising a race
   result into the URL for no user-visible gain.
   ponytail: add routes when someone needs to deep-link a result. */
type Stage =
  | { at: "landing" }
  | { at: "pitwall"; callsign: string; scenarioId: string }
  | { at: "debrief"; callsign: string; scenarioId: string; result: RaceResult };

export default function Page() {
  const [stage, setStage] = useState<Stage>({ at: "landing" });
  const [muted, setMuted] = useState(false);

  const restart = () => setStage({ at: "landing" });

  return (
    <main className="mx-auto w-full max-w-md flex-1">
      <Header muted={muted} onToggleMute={() => setMuted((m) => !m)} onRestart={restart} />

      {stage.at === "landing" && (
        <Landing
          onStart={(callsign, scenarioId) => setStage({ at: "pitwall", callsign, scenarioId })}
        />
      )}

      {stage.at === "pitwall" && (
        <PitWall
          callsign={stage.callsign}
          scenarioId={stage.scenarioId}
          muted={muted}
          onDecide={(call: Call) =>
            setStage({
              at: "debrief",
              callsign: stage.callsign,
              scenarioId: stage.scenarioId,
              result: resolve(scenarioById(stage.scenarioId), call),
            })
          }
        />
      )}

      {stage.at === "debrief" && (
        <Debrief
          result={stage.result}
          scenarioId={stage.scenarioId}
          callsign={stage.callsign}
          muted={muted}
          onRestart={restart}
        />
      )}
    </main>
  );
}
