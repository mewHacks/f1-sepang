"use client";

import { useEffect, useState } from "react";
import { SCENARIOS } from "@/lib/scenarios.ts";
import { PERSONAS, CALL_LABEL } from "@/lib/personas.ts";
import { Avatar, Title } from "./Chrome.tsx";

// Names carry the F1 flavour; the plain-English line does the actual
// explaining, so nobody needs to already know what a "paddock" is.
const FEATURES = [
  {
    n: "01",
    tone: "red" as const,
    label: "Pit Wall",
    plain: "The strategy game",
    tag: "Three engineers argue live — you make the call",
  },
  {
    n: "02",
    tone: "yellow" as const,
    label: "Circuit Pass",
    plain: "Your result card",
    tag: "A shareable score card for how you did",
  },
  {
    n: "03",
    tone: "ice" as const,
    label: "Paddock Mamak",
    plain: "After the race",
    tag: "Skip the traffic jam, find supper nearby",
  },
];

export function Landing({
  onStart,
}: {
  onStart: (callsign: string, scenarioId: string) => void;
}) {
  const [callsign, setCallsign] = useState("");
  const [picked, setPicked] = useState(SCENARIOS[0].id);
  const [active, setActive] = useState(0);

  // Cycles the roster reveal on its own; any tap on a dot resets the clock
  // so a manual choice doesn't get yanked away a moment later.
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % PERSONAS.length), 4200);
    return () => clearInterval(t);
  }, [active]);

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

        {/* --- Hero Comms Trio: instant visual intro to the 3 personas --- */}
        <div className="anim-rise mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/70 p-3.5 backdrop-blur-sm">
          <div className="flex -space-x-3">
            {PERSONAS.map((p) => (
              <div
                key={p.id}
                className="relative rounded-xl border-2 border-bg transition-transform hover:z-10 hover:scale-110"
              >
                <Avatar persona={p} size={44} />
                <span
                  aria-hidden
                  className="anim-blink absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-bg"
                  style={{ background: `var(--${p.tone})` }}
                />
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="data text-[10px] uppercase tracking-[0.2em] text-muted">
              Your three strategists
            </div>
            <div className="display text-sm tracking-wide text-fg">
              AERO-9 <span className="text-muted/60">·</span> UNCLE SEPANG <span className="text-muted/60">·</span> DIN TURBO
            </div>
          </div>
          <span className="data inline-flex items-center gap-1.5 rounded-full bg-red/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red">
            <span className="anim-blink h-1.5 w-1.5 rounded-full bg-red" />
            3 Debates
          </span>
        </div>
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
              <div className="title-loose title text-lg leading-tight sm:text-xl">{f.tag}</div>
              <div className="data mt-1 text-[10px] uppercase tracking-[0.15em] text-muted">
                {f.plain} <span className="text-muted/50">· aka {f.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- roster: one engineer revealed at a time, auto-cycling --- */}
      <div className="mt-9">
        <div className="annot data mb-3 px-4 text-[10px] uppercase tracking-[0.25em] text-muted">
          <span>Your pit wall team</span>
        </div>

        <div className="relative mx-4 h-[380px] overflow-hidden rounded-2xl border border-line sm:mx-auto sm:w-96">
          {PERSONAS.map((p, i) => (
            <div
              key={p.id}
              aria-hidden={i !== active}
              className="absolute inset-0 flex flex-col items-center justify-center bg-surface pt-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: i === active ? 1 : 0,
                transform: i === active ? "scale(1)" : "scale(0.96)",
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: `var(--${p.tone})` }}
              />
              <div className="halftone flex flex-col items-center pt-6 pb-2">
                <Avatar persona={p} size={140} />
              </div>
              <div className="px-6 pb-6 pt-2 text-center">
                <div className="title text-3xl leading-none" style={{ color: `var(--${p.tone})` }}>
                  {p.name}
                </div>
                <div className="data mt-1 text-[10px] uppercase tracking-widest text-muted">
                  {p.role}
                </div>
                <div className="mt-2.5 text-[13px] leading-snug text-fg/80">{p.pitch}</div>
                <div
                  className="data mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
                  style={{
                    borderColor: `color-mix(in srgb, var(--${p.tone}) 40%, transparent)`,
                    background: `color-mix(in srgb, var(--${p.tone}) 10%, transparent)`,
                    color: `var(--${p.tone})`,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--${p.tone})` }} />
                  Wants {CALL_LABEL[p.advocates]}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              aria-label={`Show ${p.name}`}
              aria-current={i === active}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === active ? 20 : 8,
                background: i === active ? `var(--${p.tone})` : "var(--line)",
              }}
            />
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
                  active ? "border-red ring-1 ring-red/30" : ""
                }`}
              >
                {active && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-red" />}
                <div className="flex items-start justify-between gap-2">
                  <div className="title text-xl leading-none">{s.name}</div>
                  <div className="flex -space-x-1.5 opacity-85">
                    {PERSONAS.map((p) => (
                      <Avatar key={p.id} persona={p} size={20} className="border border-bg" />
                    ))}
                  </div>
                </div>
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
