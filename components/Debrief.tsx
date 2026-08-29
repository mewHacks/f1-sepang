"use client";

import { useEffect, useState } from "react";
import { CALL_LABEL } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { iqGrade, type RaceResult } from "@/lib/sim.ts";
import { streamRadio } from "@/lib/radio.ts";
import { fallbackLine } from "@/lib/fallback.ts";
import { radioBeep } from "@/lib/beep.ts";
import { Flag, Stat, Title } from "./Chrome.tsx";
import { LapChart } from "./LapChart.tsx";

export function Debrief({
  result,
  scenarioId,
  callsign,
  muted,
  onRestart,
}: {
  result: RaceResult;
  scenarioId: string;
  callsign: string;
  muted: boolean;
  onRestart: () => void;
}) {
  const scenario = scenarioById(scenarioId);
  const [verdict, setVerdict] = useState("");
  const winner = result.rightAllAlong;

  // The engineer who called it right gets the last word.
  useEffect(() => {
    const ctrl = new AbortController();
    radioBeep(muted);
    streamRadio(
      {
        personaId: winner.id,
        scenarioId,
        phase: "verdict",
        callsign,
        chosenCall: result.call,
      },
      (chunk) => setVerdict((v) => v + chunk),
      ctrl.signal,
    ).catch((err) => {
      if ((err as Error).name !== "AbortError") {
        setVerdict(fallbackLine(winner.id, scenarioId, "verdict"));
      }
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, winner.id]);

  const gained = result.positionsGained;

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-5">
      <div>
        <Title
          hit={result.wasOptimal ? "NAILED IT" : "OOF"}
          tone={result.wasOptimal ? "yellow" : "red"}
          size="text-[13vw] leading-[0.84] sm:text-5xl"
        >
          You
        </Title>
      </div>

      {result.wasOptimal ? (
        <Flag tone="green" label="Optimal call" value={scenario.name.toUpperCase()} />
      ) : (
        <Flag
          tone="yellow"
          label={`Should have: ${CALL_LABEL[result.bestCall]}`}
          value={scenario.name.toUpperCase()}
        />
      )}

      {/* The score, given the space it deserves. */}
      <div className="card chevrons relative overflow-hidden px-4 py-6 text-center">
        <div className="data text-[10px] uppercase tracking-wider text-muted">
          Strategy IQ
        </div>
        <div
          className="display anim-pop mt-1 leading-none"
          style={{ fontSize: "22vw", lineHeight: 0.8 }}
        >
          {result.strategyIQ}
        </div>
        <div
          className="display mt-2 text-base"
          style={{ color: result.strategyIQ >= 80 ? "var(--green)" : "var(--yellow)" }}
        >
          {iqGrade(result.strategyIQ)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Your call" value={result.compound} tone="ice" />
        <Stat
          label="Net gap"
          value={`${result.finalGap > 0 ? "+" : ""}${result.finalGap.toFixed(1)}`}
          unit="s"
          tone={result.finalGap <= 0 ? "green" : "red"}
        />
        <Stat
          label="Positions"
          value={`${gained > 0 ? "+" : ""}${gained}`}
          tone={gained >= 0 ? "green" : "red"}
        />
      </div>

      <LapChart laps={result.laps} />

      <article className="card overflow-hidden">
        <div
          className="flex items-center gap-2 px-3.5 py-2"
          style={{ background: `color-mix(in srgb, var(--${winner.tone}) 14%, transparent)` }}
        >
          <span className="display text-sm leading-none" style={{ color: `var(--${winner.tone})` }}>
            {winner.name}
          </span>
          <span className="data ml-auto text-[9px] uppercase text-muted">had it right</span>
        </div>
        <p className="px-3.5 py-3 text-[15px] leading-snug">
          {verdict || <span className="anim-blink text-muted">…</span>}
        </p>
      </article>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 pt-3 backdrop-blur-sm"
        style={{ paddingBottom: "calc(var(--safe-b) + 12px)" }}
      >
        <button
          onClick={onRestart}
          className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
        >
          Run it again
        </button>
      </div>
    </div>
  );
}
