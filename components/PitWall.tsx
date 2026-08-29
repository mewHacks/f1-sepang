"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONAS, CALL_LABEL, advocateOf, type Call } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { streamRadio } from "@/lib/radio.ts";
import { fallbackLine } from "@/lib/fallback.ts";
import { radioBeep } from "@/lib/beep.ts";
import { Avatar, Stat, Title } from "./Chrome.tsx";

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
    <div className="px-4 pb-44 pt-5 lg:grid lg:grid-cols-[1.15fr_.85fr] lg:items-start lg:gap-10 lg:pb-10">
      <div className="flex flex-col gap-5">
        <div className="relative overflow-hidden pt-3">
          <span
            aria-hidden
            className="title ghost-red bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
          >
            {scenario.name}
          </span>
          <div className="relative pt-[7vw] lg:pt-12">
            <Title hit="WALL" size="text-[13vw] leading-[0.84] lg:text-6xl">
              PIT
            </Title>
            <p className="mt-2 max-w-sm text-[13px] leading-snug text-muted">
              Three engineers will each argue for a different call. Listen, then pick one below.
            </p>
            <div className="annot data mt-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>
                {scenario.name} · {scenario.lapsRemaining} laps to go
              </span>
            </div>
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
              <article
                key={`${t.id}-${i}`}
                className={`anim-slide card overflow-hidden transition-all ${
                  t.open ? "ring-1" : ""
                }`}
                style={t.open ? { borderColor: `var(--${p.tone})` } : undefined}
              >
                <div
                  className="flex items-center gap-3 px-3 py-2.5"
                  style={{ background: `color-mix(in srgb, var(--${p.tone}) 15%, transparent)` }}
                >
                  <Avatar persona={p} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="display text-sm leading-none" style={{ color: `var(--${p.tone})` }}>
                        {p.name}
                      </span>
                      {t.open && (
                        <span
                          aria-hidden
                          className="anim-blink inline-block h-2 w-2 rounded-full"
                          style={{ background: `var(--${p.tone})` }}
                        />
                      )}
                    </div>
                    <div className="data text-[9px] uppercase tracking-wider text-muted mt-0.5">
                      {p.role}
                    </div>
                  </div>
                  <div className="data text-[9px] uppercase tracking-wider text-muted/70">
                    CH-0{PERSONAS.indexOf(p) + 1}
                  </div>
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
      </div>

      <div className="actionbar lg:sticky lg:top-24">
        <div className="shell lg:px-0">
          <div className="data mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted">
            <span>Your call, {callsign}</span>
            {!briefed && <span className="anim-blink">radio live…</span>}
          </div>
          <div className="flex flex-col gap-2.5">
            {(Object.keys(CALL_LABEL) as Call[]).map((call, i) => {
              const advocate = advocateOf(call);
              return (
                <button
                  key={call}
                  onClick={() => {
                    radioBeep(muted);
                    onDecide(call);
                  }}
                  style={{ "--i": i } as React.CSSProperties}
                  className="anim-rise group flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-left transition-all active:scale-[0.98] hover:border-fg/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar persona={advocate} size={36} />
                    <div>
                      <div className="display text-base leading-none" style={{ color: `var(--${CALL_TONE[call]})` }}>
                        {CALL_LABEL[call]}
                      </div>
                      <div className="data mt-1 text-[10px] uppercase tracking-wider text-muted">
                        Pushed by {advocate.name}
                      </div>
                    </div>
                  </div>
                  <span aria-hidden className="text-xl text-muted/60 transition-transform group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
