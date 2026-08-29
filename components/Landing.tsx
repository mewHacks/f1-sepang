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
          <Title size="text-[15vw] leading-[0.84] lg:text-7xl">CALL THE</Title>
          <Title hit="SHOTS" size="text-[15vw] leading-[0.84] lg:text-7xl">
            STRATEGY
          </Title>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted lg:text-base">
            Sepang. Fifty degrees of asphalt, a monsoon building over Turn 11, and three
            engineers screaming different things in your ear. You pick. You live with it.
          </p>

          <div className="mt-7">
            <div className="data mb-2.5 text-[10px] uppercase tracking-wider text-muted">
              Your pit wall
            </div>
            <div className="flex flex-col gap-2">
              {PERSONAS.map((p, i) => (
                <div
                  key={p.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="anim-rise card flex items-center gap-3 px-3 py-2.5"
                >
                  <Avatar persona={p} size={44} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="display text-sm leading-none"
                      style={{ color: `var(--${p.tone})` }}
                    >
                      {p.name}
                    </div>
                    <div className="mt-1 text-[12px] leading-snug text-muted">{p.pitch}</div>
                  </div>
                  <div className="data hidden shrink-0 text-right text-[9px] uppercase leading-tight text-muted sm:block">
                    Wants
                    <br />
                    <span style={{ color: `var(--${p.tone})` }}>
                      {CALL_LABEL[p.advocates]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- setup --- */}
        <div className="mt-8 lg:mt-0">
          <label className="block">
            <span className="data text-[10px] uppercase tracking-wider text-muted">
              Your call-sign
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
            <div className="data mb-2 text-[10px] uppercase tracking-wider text-muted">
              Pick your nightmare
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
