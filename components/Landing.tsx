"use client";

import { useState } from "react";
import { SCENARIOS } from "@/lib/scenarios.ts";
import { PERSONAS, CALL_LABEL } from "@/lib/personas.ts";
import { Avatar, Title } from "./Chrome.tsx";

const FEATURES = [
  { n: "01", tone: "red" as const, label: "Pit Wall", tag: "Call the strategy live" },
  { n: "02", tone: "yellow" as const, label: "Circuit Pass", tag: "Flex your Strategy IQ" },
  { n: "03", tone: "ice" as const, label: "Paddock Mamak", tag: "Dodge traffic, find supper" },
];

export function Landing({
  onStart,
}: {
  onStart: (callsign: string, scenarioId: string) => void;
}) {
  const [callsign, setCallsign] = useState("");
  const [picked, setPicked] = useState(SCENARIOS[0].id);

  return (
    <div className="pb-32 pt-6 lg:pb-10">
      {/* --- hero: full-bleed, no side padding, so the ghost word can run
          truly edge to edge instead of stopping at a content margin. --- */}
      <div className="relative overflow-hidden px-4 pb-2 pt-6">
        <span
          aria-hidden
          className="title ghost-red bleed absolute -top-3 left-0 text-[30vw] leading-[0.78] lg:text-[11rem]"
        >
          SEPANG
        </span>
        <div className="relative pt-[13vw] lg:pt-20">
          <Title size="text-[16vw] leading-[0.8] lg:text-8xl">CALL THE</Title>
          <Title hit="SHOTS" size="text-[16vw] leading-[0.8] lg:text-8xl">
            STRATEGY
          </Title>
        </div>
        <p className="relative mt-4 max-w-sm text-base leading-snug text-fg/80 lg:max-w-md lg:text-lg">
          Fifty degrees of asphalt. A monsoon over Turn 11. Three engineers screaming
          different things in your ear — <span className="text-red">you make the call.</span>
        </p>
      </div>

      {/* --- features: big, terse, three rows instead of a paragraph each --- */}
      <div className="mt-8 flex flex-col gap-2 px-4">
        {FEATURES.map((f, i) => (
          <div
            key={f.label}
            style={{ "--i": i } as React.CSSProperties}
            className="anim-rise card flex items-center gap-4 px-4 py-3.5"
          >
            <span
              className="title shrink-0 text-3xl leading-none opacity-90"
              style={{ color: `var(--${f.tone})` }}
            >
              {f.n}
            </span>
            <div className="min-w-0">
              <div className="title text-2xl leading-none">{f.label}</div>
              <div className="data mt-1 text-[11px] uppercase tracking-[0.15em] text-muted">
                {f.tag}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- roster: horizontal snap strip, game-select energy --- */}
      <div className="mt-9">
        <div className="annot data mb-3 px-4 text-[10px] uppercase tracking-[0.25em] text-muted">
          <span>Your pit wall</span>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PERSONAS.map((p, i) => (
            <div
              key={p.id}
              style={{ "--i": i } as React.CSSProperties}
              className="anim-rise card relative w-[68vw] shrink-0 snap-start overflow-hidden sm:w-64"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `var(--${p.tone})` }}
              />
              <div className="halftone flex items-center justify-center pt-6 pb-2">
                <Avatar persona={p} size={104} />
              </div>
              <div className="px-4 pb-4 pt-1 text-center">
                <div className="title text-2xl leading-none" style={{ color: `var(--${p.tone})` }}>
                  {p.name}
                </div>
                <div className="mt-2 text-[12px] leading-snug text-muted">{p.pitch}</div>
                <div className="data mt-3 inline-block rounded-full border border-line px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-muted">
                  Wants {CALL_LABEL[p.advocates]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- setup --- */}
      <div className="mt-9 px-4">
        <input
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          maxLength={24}
          placeholder="YOUR CALL-SIGN"
          autoComplete="off"
          className="title w-full rounded-xl border border-line bg-surface px-4 py-4 text-2xl outline-none placeholder:text-muted/40 focus:border-red"
        />

        <div className="mt-4 flex flex-col gap-2.5">
          {SCENARIOS.map((s, i) => {
            const active = s.id === picked;
            return (
              <button
                key={s.id}
                onClick={() => setPicked(s.id)}
                aria-pressed={active}
                style={{ "--i": i } as React.CSSProperties}
                className={`anim-rise card relative overflow-hidden px-4 py-4 text-left transition-transform active:scale-[0.985] ${
                  active ? "border-red" : ""
                }`}
              >
                {active && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-red" />}
                <div className="title text-xl leading-none">{s.name}</div>
                <div className="mt-1.5 text-[13px] leading-snug text-muted">{s.blurb}</div>
                <div className="data mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
                  <span>
                    TRACK <span className="text-yellow">{s.trackTempC}°C</span>
                  </span>
                  <span>
                    HUM <span className="text-ice">{s.humidityPct}%</span>
                  </span>
                  <span>
                    LAPS <span className="text-ice">{s.lapsRemaining}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="actionbar mt-8">
        <div className="shell px-4">
          <button
            onClick={() => onStart(callsign.trim() || "STRATEGIST", picked)}
            className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
          >
            Take the pit wall
          </button>
        </div>
      </div>
    </div>
  );
}
