"use client";

import { useState } from "react";
import { SCENARIOS } from "@/lib/scenarios.ts";
import { Title } from "./Chrome.tsx";

export function Landing({
  onStart,
}: {
  onStart: (callsign: string, scenarioId: string) => void;
}) {
  const [callsign, setCallsign] = useState("");
  const [picked, setPicked] = useState(SCENARIOS[0].id);

  return (
    <div className="flex flex-col gap-6 px-4 pb-32 pt-6">
      <div>
        <Title size="text-[15vw] leading-[0.84] sm:text-6xl">CALL THE</Title>
        <Title hit="SHOTS" size="text-[15vw] leading-[0.84] sm:text-6xl">
          STRATEGY
        </Title>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Sepang. Fifty degrees of asphalt, a monsoon building over Turn 11, and three
          engineers screaming different things in your ear. You pick. You live with it.
        </p>
      </div>

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

      <div>
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
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 bg-red"
                  />
                )}
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

      {/* Thumb-reach action bar. Fixed so the CTA never needs scrolling to. */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 pt-3 backdrop-blur-sm"
        style={{ paddingBottom: "calc(var(--safe-b) + 12px)" }}
      >
        <button
          onClick={() => onStart(callsign.trim() || "STRATEGIST", picked)}
          className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
        >
          Take the pit wall
        </button>
      </div>
    </div>
  );
}
