"use client";

import { useEffect, useState } from "react";
import { CALL_LABEL } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { iqGrade, type RaceResult } from "@/lib/sim.ts";
import { streamRadio } from "@/lib/radio.ts";
import { fallbackLine } from "@/lib/fallback.ts";
import { radioBeep } from "@/lib/beep.ts";
import { Avatar, Flag, Stat, Title } from "./Chrome.tsx";
import { LapChart } from "./LapChart.tsx";

export function Debrief({
  result,
  scenarioId,
  callsign,
  muted,
  onPass,
  onMamak,
}: {
  result: RaceResult;
  scenarioId: string;
  callsign: string;
  muted: boolean;
  onPass: () => void;
  onMamak: () => void;
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
    <div className="px-4 pb-40 pt-5 lg:grid lg:grid-cols-[.9fr_1.1fr] lg:items-start lg:gap-10 lg:pb-10">
      <div className="flex flex-col gap-5">
        <Title
          hit={result.wasOptimal ? "NAILED IT" : "OOF"}
          tone={result.wasOptimal ? "yellow" : "red"}
          size="text-[13vw] leading-[0.84] lg:text-6xl"
        >
          You
        </Title>

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
          <div className="data text-[10px] uppercase tracking-wider text-muted">Strategy IQ</div>
          <div
            className="display anim-pop mt-1 leading-none"
            style={{ fontSize: "min(22vw, 132px)", lineHeight: 0.8 }}
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
      </div>

      <div className="mt-5 flex flex-col gap-5 lg:mt-0">
        <LapChart laps={result.laps} />

        <article className="card overflow-hidden">
          <div
            className="flex items-center gap-2.5 px-3 py-2"
            style={{ background: `color-mix(in srgb, var(--${winner.tone}) 14%, transparent)` }}
          >
            <Avatar persona={winner} size={32} />
            <span
              className="display text-sm leading-none"
              style={{ color: `var(--${winner.tone})` }}
            >
              {winner.name}
            </span>
            <span className="data ml-auto text-[9px] uppercase text-muted">had it right</span>
          </div>
          <p className="px-3.5 py-3 text-[15px] leading-snug">
            {verdict || <span className="anim-blink text-muted">…</span>}
          </p>
        </article>

        <div className="actionbar lg:mt-1">
          <div className="shell lg:px-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onPass}
                className="display rounded-xl bg-red py-4 text-base leading-none transition-transform active:scale-[0.98]"
              >
                Circuit pass
              </button>
              <button
                onClick={onMamak}
                className="display rounded-xl border border-line bg-surface py-4 text-base leading-none text-yellow transition-transform active:scale-[0.98]"
              >
                Now eat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
