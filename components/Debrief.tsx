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
        <div className="relative overflow-hidden pt-3">
          <span
            aria-hidden
            className="title ghost bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
          >
            DEBRIEF
          </span>
          <div className="relative pt-[7vw] lg:pt-12">
            <Title
              hit={result.wasOptimal ? "NAILED IT" : "OOF"}
              tone={result.wasOptimal ? "yellow" : "red"}
              size="text-[13vw] leading-[0.84] lg:text-6xl"
            >
              You
            </Title>
          </div>
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

        {/* The score as the poster moment: the number repeated as a ghost
            outline behind itself, cropped by the panel. */}
        <div className="card halftone relative overflow-hidden px-4 pb-5 pt-4">
          <span
            aria-hidden
            className="title ghost-red absolute -right-4 -top-6 select-none text-[9rem] leading-none"
          >
            {result.strategyIQ}
          </span>
          <div className="annot data relative text-[10px] uppercase tracking-[0.2em] text-muted">
            <span>Strategy IQ</span>
          </div>
          <div
            className="title anim-pop relative mt-1 leading-none"
            style={{ fontSize: "min(30vw, 150px)", lineHeight: 0.78 }}
          >
            {result.strategyIQ}
          </div>
          <div
            className="title relative mt-2 text-xl leading-none"
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
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: `color-mix(in srgb, var(--${winner.tone}) 15%, transparent)` }}
          >
            <Avatar persona={winner} size={48} />
            <div className="min-w-0 flex-1">
              <div className="display text-base leading-none" style={{ color: `var(--${winner.tone})` }}>
                {winner.name}
              </div>
              <div className="data mt-1 text-[10px] uppercase tracking-wider text-muted">
                {winner.role}
              </div>
            </div>
            <span
              className="data rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider"
              style={{
                borderColor: `var(--${winner.tone})`,
                color: `var(--${winner.tone})`,
              }}
            >
              Had it right
            </span>
          </div>
          <p className="px-4 py-3.5 text-[15px] leading-snug">
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
