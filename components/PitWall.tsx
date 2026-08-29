"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONAS, CALL_LABEL, type Call } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { streamRadio } from "@/lib/radio.ts";
import { fallbackLine } from "@/lib/fallback.ts";
import { radioBeep } from "@/lib/beep.ts";
import { Stat, Title } from "./Chrome.tsx";

type Transmission = { id: string; text: string; open: boolean };

const CALL_TONE: Record<Call, "ice" | "yellow" | "red"> = {
  BOX_INTERS: "ice",
  STAY_OUT: "yellow",
  FULL_WET: "red",
};

export function PitWall({
  callsign,
  scenarioId,
  muted,
  onDecide,
}: {
  callsign: string;
  scenarioId: string;
  muted: boolean;
  onDecide: (call: Call) => void;
}) {
  const scenario = scenarioById(scenarioId);
  const [feed, setFeed] = useState<Transmission[]>([]);
  const [briefed, setBriefed] = useState(false);
  // Held in a ref so toggling the radio mid-briefing does not restart the
  // whole streaming sequence.
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const ctrl = new AbortController();
    let live = true;

    (async () => {
      for (const persona of PERSONAS) {
        if (!live) return;

        radioBeep(mutedRef.current);
        setFeed((f) => [...f, { id: persona.id, text: "", open: true }]);

        const append = (chunk: string) =>
          setFeed((f) =>
            f.map((t, i) => (i === f.length - 1 ? { ...t, text: t.text + chunk } : t)),
          );

        try {
          await streamRadio(
            { personaId: persona.id, scenarioId, phase: "brief", callsign },
            append,
            ctrl.signal,
          );
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          // Network died mid-demo: fall back to the scripted line so the
          // conversation still completes.
          setFeed((f) =>
            f.map((t, i) =>
              i === f.length - 1
                ? { ...t, text: fallbackLine(persona.id, scenarioId, "brief") }
                : t,
            ),
          );
        }

        if (!live) return;
        setFeed((f) => f.map((t, i) => (i === f.length - 1 ? { ...t, open: false } : t)));
        await new Promise((r) => setTimeout(r, 420));
      }
      if (live) setBriefed(true);
    })();

    return () => {
      live = false;
      ctrl.abort();
    };
  }, [scenarioId, callsign]);

  return (
    <div className="flex flex-col gap-5 px-4 pb-44 pt-5">
      <div>
        <Title hit="WALL" size="text-[13vw] leading-[0.84] sm:text-5xl">
          PIT
        </Title>
        <div className="data mt-2 text-[11px] uppercase tracking-wider text-muted">
          {scenario.name} · {scenario.lapsRemaining} laps to go
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Track" value={scenario.trackTempC} unit="°C" tone="yellow" />
        <Stat label="Air" value={scenario.airTempC} unit="°C" />
        <Stat label="Humidity" value={scenario.humidityPct} unit="%" tone="ice" />
      </div>

      <div className="flex flex-col gap-2.5">
        {feed.map((t, i) => {
          const p = PERSONAS.find((x) => x.id === t.id)!;
          return (
            <article key={`${t.id}-${i}`} className="anim-slide card overflow-hidden">
              <div
                className="flex items-center gap-2 px-3.5 py-2"
                style={{ background: `color-mix(in srgb, var(--${p.tone}) 14%, transparent)` }}
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${t.open ? "anim-blink" : ""}`}
                  style={{ background: `var(--${p.tone})` }}
                />
                <span className="display text-sm leading-none" style={{ color: `var(--${p.tone})` }}>
                  {p.name}
                </span>
                <span className="data ml-auto text-[9px] uppercase text-muted">{p.role}</span>
              </div>
              <p className="px-3.5 py-3 text-[15px] leading-snug">
                {t.text}
                {t.open && <span className="anim-blink ml-0.5 text-red">▊</span>}
              </p>
            </article>
          );
        })}

        {feed.length === 0 && (
          <div className="card relative h-20 overflow-hidden">
            <div className="anim-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="data flex h-full items-center justify-center text-[11px] text-muted">
              OPENING RADIO…
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 pt-3 backdrop-blur-sm"
        style={{ paddingBottom: "calc(var(--safe-b) + 12px)" }}
      >
        <div className="data mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted">
          <span>Your call, {callsign}</span>
          {!briefed && <span className="anim-blink">radio live…</span>}
        </div>
        <div className="flex flex-col gap-2">
          {(Object.keys(CALL_LABEL) as Call[]).map((call, i) => (
            <button
              key={call}
              onClick={() => {
                radioBeep(muted);
                onDecide(call);
              }}
              style={{ "--i": i } as React.CSSProperties}
              className="display anim-rise flex items-center justify-between rounded-xl border px-4 py-3 text-left text-base leading-none transition-transform active:scale-[0.98]"
            >
              <span style={{ color: `var(--${CALL_TONE[call]})` }}>{CALL_LABEL[call]}</span>
              <span aria-hidden className="text-muted">
                ›
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
