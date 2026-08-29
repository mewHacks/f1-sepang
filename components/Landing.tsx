"use client";

import { useState } from "react";
import { SCENARIOS } from "@/lib/scenarios.ts";
import { PERSONAS, CALL_LABEL } from "@/lib/personas.ts";
import { Avatar, Title } from "./Chrome.tsx";

export function Landing({
  onStart,
}: {
  onStart: (callsign: string, scenarioId: string) => void;
}) {
  const [callsign, setCallsign] = useState("");
  const [picked, setPicked] = useState(SCENARIOS[0].id);

  return (
    <div className="px-4 pb-32 pt-6 lg:pb-10">
      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
        {/* --- pitch + roster --- */}
        <div>
          {/* Layered hero: a ghosted word bleeding off the edge, the real
              headline riding over it. Depth without a single image. */}
          <div className="relative -mt-2 overflow-hidden pb-1 pt-6">
            <span
              aria-hidden
              className="title ghost-red bleed absolute -top-1 left-0 text-[26vw] leading-[0.8] lg:text-[10rem]"
            >
              SEPANG
            </span>
            <div className="relative pt-[9vw] lg:pt-16">
              <Title size="text-[15vw] leading-[0.82] lg:text-7xl">CALL THE</Title>
              <Title hit="SHOTS" size="text-[15vw] leading-[0.82] lg:text-7xl">
                STRATEGY
              </Title>
            </div>
          </div>

          <div className="annot data mt-5 text-[10px] uppercase tracking-[0.2em] text-muted">
            <span>001 — The brief</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted lg:text-base">
            Sepang. Fifty degrees of asphalt, a monsoon building over Turn 11, and three
            engineers screaming different things in your ear. You pick. You live with it.
          </p>

          <div className="mt-8">
            <div className="annot data mb-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>002 — Your pit wall</span>
            </div>
            <div className="flex flex-col gap-2">
              {PERSONAS.map((p, i) => (
                <div
                  key={p.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="anim-rise card relative flex items-stretch gap-3 overflow-hidden p-3"
                >
                  {/* Oversized index, cropped by the card edge. */}
                  <span
                    aria-hidden
                    className="title ghost absolute -bottom-3 right-2 text-[3.5rem] leading-none opacity-70"
                  >
                    0{i + 1}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: `var(--${p.tone})` }}
                  />
                  <div className="halftone shrink-0 self-center rounded-lg opacity-90">
                    <Avatar persona={p} size={48} />
                  </div>
                  <div className="relative min-w-0 flex-1 py-0.5">
                    <div
                      className="title text-xl leading-none"
                      style={{ color: `var(--${p.tone})` }}
                    >
                      {p.name}
                    </div>
                    <div className="mt-1.5 text-[12px] leading-snug text-muted">{p.pitch}</div>
                    <div className="data mt-2 text-[9px] uppercase tracking-[0.15em] text-muted">
                      Wants ›{" "}
                      <span style={{ color: `var(--${p.tone})` }}>{CALL_LABEL[p.advocates]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- setup --- */}
        <div className="mt-8 lg:mt-0">
          <label className="block">
            <span className="annot data flex text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>003 — Your call-sign</span>
            </span>
            <input
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              maxLength={24}
              placeholder="BOX BOX BABY"
              autoComplete="off"
              className="display mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-lg outline-none placeholder:text-muted/40 focus:border-red"
            />
          </label>

          <div className="mt-6">
            <div className="annot data mb-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>004 — Pick your nightmare</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {SCENARIOS.map((s, i) => {
                const active = s.id === picked;
                return (
                  <button
                    key={s.id}
                    onClick={() => setPicked(s.id)}
                    aria-pressed={active}
                    style={{ "--i": i } as React.CSSProperties}
                    className={`anim-rise card relative overflow-hidden px-4 py-3.5 text-left transition-transform active:scale-[0.985] ${
                      active ? "border-red" : ""
                    }`}
                  >
                    {active && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-red" />}
                    <div className="display text-lg leading-none">{s.name}</div>
                    <div className="mt-1.5 text-xs leading-snug text-muted">{s.blurb}</div>
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

          <div className="actionbar lg:mt-6">
            <div className="shell lg:px-0">
              <button
                onClick={() => onStart(callsign.trim() || "STRATEGIST", picked)}
                className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
              >
                Take the pit wall
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
