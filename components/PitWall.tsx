"use client";

import { useEffect, useRef, useState } from "react";
import {
  PERSONAS,
  CALL_LABEL,
  type Call,
  type Persona,
} from "@/lib/personas.ts";
import { type Scenario, registerScenario } from "@/lib/scenarios.ts";
import { buildScenario, mixLabel, type Mix } from "@/lib/buildScenario.ts";
import { streamRadio } from "@/lib/radio.ts";
import { fallbackLine } from "@/lib/fallback.ts";
import { radioBeep } from "@/lib/beep.ts";
import { Avatar, Stat, Title } from "./Chrome.tsx";

type Transmission = { id: string; text: string; open: boolean };
type Step = "mix" | "intro" | "debate" | "verdict";

const CALL_TONE: Record<Call, "ice" | "yellow" | "red"> = {
  BOX_INTERS: "ice",
  STAY_OUT: "yellow",
  FULL_WET: "red",
};

const TRACK_OPTS: { id: Mix["track"]; label: string; sub: string }[] = [
  { id: "cool", label: "Cool", sub: "34°C" },
  { id: "warm", label: "Warm", sub: "44°C" },
  { id: "scorch", label: "Scorching", sub: "54°C" },
];
const RAIN_OPTS: { id: Mix["rain"]; label: string }[] = [
  { id: "dry", label: "Bone dry" },
  { id: "spit", label: "Spitting" },
  { id: "cell", label: "Cell rolling in" },
  { id: "monsoon", label: "Full monsoon" },
];
const LEN_OPTS: { id: Mix["length"]; label: string; sub: string }[] = [
  { id: "sprint", label: "Sprint", sub: "8 laps" },
  { id: "gp", label: "GP", sub: "12 laps" },
  { id: "enduro", label: "Endurance", sub: "18 laps" },
];

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="data mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`card flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                active ? "border-red bg-red/10" : "border-line bg-surface hover:border-fg/30"
              }`}
            >
              <span
                className="title text-base leading-none"
                style={{ color: active ? "var(--red)" : "var(--fg)" }}
              >
                {o.label}
              </span>
              {o.sub && <span className="data mt-1 text-[10px] text-muted">{o.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PitWall({
  callsign,
  muted,
  onDecide,
}: {
  callsign: string;
  muted: boolean;
  onDecide: (call: Call, scenarioId: string) => void;
}) {
  const [step, setStep] = useState<Step>("mix");
  const [mix, setMix] = useState<Mix>({ track: "warm", rain: "cell", length: "gp", sc: false });
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [feed, setFeed] = useState<Transmission[]>([]);
  const [briefed, setBriefed] = useState(false);
  const [picked, setPicked] = useState<Persona["id"] | null>(null);

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Debate streaming — runs whenever we land on the debate step. The cleanup
  // aborts any in-flight stream, so re-entering the step (or a StrictMode
  // remount) just starts a fresh one.
  useEffect(() => {
    if (step !== "debate" || !scenario) return;

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
            {
              personaId: persona.id,
              scenarioId: scenario.id,
              phase: "brief",
              callsign,
              scenario: {
                trackTempC: scenario.trackTempC,
                airTempC: scenario.airTempC,
                humidityPct: scenario.humidityPct,
                lapsRemaining: scenario.lapsRemaining,
                blurb: scenario.blurb,
                name: scenario.name,
              },
            },
            append,
            ctrl.signal,
          );
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setFeed((f) =>
            f.map((t, i) =>
              i === f.length - 1
                ? { ...t, text: fallbackLine(persona.id, "custom", "brief") }
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
  }, [step, scenario, callsign]);

  const goIntro = () => {
    const s = buildScenario(mix);
    registerScenario(s);
    setScenario(s);
    setStep("intro");
  };

  const startDebate = () => {
    setFeed([]);
    setBriefed(false);
    setStep("debate");
  };

  const chooseJudge = (p: Persona) => {
    setPicked(p.id);
    onDecide(p.advocates, scenario!.id);
  };

  /* ---------- STEP 1: SCENARIO MIXER ---------- */
  if (step === "mix") {
    return (
      <div className="px-4 pb-32 pt-5 lg:pb-10">
        <div className="relative overflow-hidden pt-3">
          <span
            aria-hidden
            className="title ghost-red bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
          >
            SETUP
          </span>
          <div className="relative pt-[7vw] lg:pt-12">
            <Title hit="THE SKY" size="text-[13vw] leading-[0.84] lg:text-6xl">
              Mix
            </Title>
            <p className="mt-2 max-w-md text-[13px] leading-snug text-muted">
              You are the strategist now. Dial in the conditions and we&apos;ll build the race around
              them. Then you&apos;ll meet the three judges and decide who called it right.
            </p>
          </div>
        </div>

        <div className="card mt-6 flex flex-col gap-5 p-5">
          <OptionGroup label="Track temperature" options={TRACK_OPTS} value={mix.track} onChange={(v) => setMix((m) => ({ ...m, track: v }))} />
          <OptionGroup label="Rain" options={RAIN_OPTS} value={mix.rain} onChange={(v) => setMix((m) => ({ ...m, rain: v }))} />
          <OptionGroup label="Race length" options={LEN_OPTS} value={mix.length} onChange={(v) => setMix((m) => ({ ...m, length: v }))} />

          <button
            onClick={() => setMix((m) => ({ ...m, sc: !m.sc }))}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
              mix.sc ? "border-yellow bg-yellow/10" : "border-line bg-surface"
            }`}
          >
            <div>
              <div className="title text-base leading-none" style={{ color: mix.sc ? "var(--yellow)" : "var(--fg)" }}>
                Safety car mid-race
              </div>
              <div className="data mt-1 text-[10px] uppercase tracking-wider text-muted">
                Bunches the field, speeds the crossover
              </div>
            </div>
            <span
              className={`h-5 w-9 rounded-full transition-all ${mix.sc ? "bg-yellow" : "bg-line"}`}
            >
              <span
                className="block h-4 w-4 translate-y-0.5 rounded-full bg-fg transition-transform"
                style={{ transform: mix.sc ? "translate(1.05rem, 0.125rem)" : "translate(0.125rem, 0.125rem)" }}
              />
            </span>
          </button>
        </div>

        <div className="data mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted">
          <span className="text-yellow">{mixLabel(mix)}</span>
        </div>

        <div className="actionbar mt-6">
          <div className="shell lg:px-0">
            <button
              onClick={goIntro}
              className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
            >
              Meet the judges →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- STEP 2: JUDGE INTROS ---------- */
  if (step === "intro" && scenario) {
    return (
      <div className="px-4 pb-32 pt-5 lg:pb-10">
        <div className="relative overflow-hidden pt-3">
          <span
            aria-hidden
            className="title ghost bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
          >
            JUDGES
          </span>
          <div className="relative pt-[7vw] lg:pt-12">
            <Title hit="THE THREE" size="text-[13vw] leading-[0.84] lg:text-6xl">
              Meet
            </Title>
            <p className="mt-2 max-w-md text-[13px] leading-snug text-muted">
              Each judge always pushes one call. Get a feel for their personality — then hear them
              argue it out.
            </p>
            <div className="annot data mt-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              {scenario.name} · {scenario.trackTempC}°C · {scenario.lapsRemaining} laps
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {PERSONAS.map((p) => (
            <article
              key={p.id}
              className="card overflow-hidden"
              style={{ borderColor: `color-mix(in srgb, var(--${p.tone}) 40%, transparent)` }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: `color-mix(in srgb, var(--${p.tone}) 12%, transparent)` }}
              >
                <Avatar persona={p} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="display text-lg leading-none" style={{ color: `var(--${p.tone})` }}>
                    {p.name}
                  </div>
                  <div className="data mt-1 text-[10px] uppercase tracking-wider text-muted">{p.role}</div>
                </div>
                <span
                  className="data rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider"
                  style={{ borderColor: `var(--${p.tone})`, color: `var(--${p.tone})` }}
                >
                  Wants {CALL_LABEL[p.advocates]}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-[13px] leading-snug text-fg/80">{p.bio}</p>
                <div
                  className="mt-3 rounded-lg border-l-2 px-3 py-2 text-[13px] leading-snug italic"
                  style={{ borderColor: `var(--${p.tone})`, color: "var(--muted)" }}
                >
                  “{fallbackLine(p.id, "custom", "brief")}”
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="actionbar mt-6">
          <div className="shell lg:px-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStep("mix")}
                className="display rounded-xl border border-line bg-surface py-4 text-base leading-none text-muted transition-transform active:scale-[0.98]"
              >
                ← Back
              </button>
              <button
                onClick={startDebate}
                className="display rounded-xl bg-red py-4 text-base leading-none transition-transform active:scale-[0.98]"
              >
                Hear them argue →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- STEP 3: DEBATE ---------- */
  if (step === "debate" && scenario) {
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
                Three engineers, one sky. Listen to the debate, then decide who was right.
              </p>
              <div className="annot data mt-3 text-[10px] uppercase tracking-[0.2em] text-muted">
                <span>
                  {scenario.trackTempC}°C · {scenario.humidityPct}% humidity · {scenario.lapsRemaining} laps
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
                  className={`anim-slide card overflow-hidden transition-all ${t.open ? "ring-1" : ""}`}
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
            <button
              disabled={!briefed}
              onClick={() => setStep("verdict")}
              className="display w-full rounded-xl bg-yellow py-4 text-base leading-none text-black transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              Who was right? →
            </button>
            <button
              onClick={() => setStep("intro")}
              className="display mt-2 w-full rounded-xl border border-line bg-surface py-3 text-sm leading-none text-muted transition-transform active:scale-[0.98]"
            >
              ← Back to judges
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- STEP 4: JUDGE WHO'S RIGHT ---------- */
  if (step === "verdict" && scenario) {
    return (
      <div className="px-4 pb-32 pt-5 lg:pb-10">
        <div className="relative overflow-hidden pt-3">
          <span
            aria-hidden
            className="title ghost bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
          >
            VERDICT
          </span>
          <div className="relative pt-[7vw] lg:pt-12">
            <Title hit="RIGHT?" size="text-[13vw] leading-[0.84] lg:text-6xl">
              Who was
            </Title>
            <p className="mt-2 max-w-md text-[13px] leading-snug text-muted">
              Based on what you just heard, which judge called it? Tap their card — we&apos;ll run the
              race and reveal who was actually right.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {PERSONAS.map((p) => {
            const tone = CALL_TONE[p.advocates];
            const active = picked === p.id;
            return (
              <button
                key={p.id}
                onClick={() => chooseJudge(p)}
                className={`card flex items-center gap-3 p-4 text-left transition-all active:scale-[0.98] ${
                  active ? "border-yellow bg-yellow/10" : "border-line bg-surface hover:border-fg/30"
                }`}
                style={{ borderColor: active ? "var(--yellow)" : undefined }}
              >
                <Avatar persona={p} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="display text-lg leading-none" style={{ color: `var(--${tone})` }}>
                    {p.name}
                  </div>
                  <div className="data mt-1 text-[10px] uppercase tracking-wider text-muted">{p.role}</div>
                  <div
                    className="data mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider"
                    style={{ borderColor: `var(--${tone})`, color: `var(--${tone})` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--${tone})` }} />
                    {CALL_LABEL[p.advocates]}
                  </div>
                </div>
                <span aria-hidden className="text-xl text-muted/60 transition-transform group-hover:translate-x-0.5">
                  ›
                </span>
              </button>
            );
          })}
        </div>

        <div className="actionbar mt-6">
          <div className="shell lg:px-0">
            <button
              onClick={() => setStep("debate")}
              className="display w-full rounded-xl border border-line bg-surface py-4 text-base leading-none text-muted transition-transform active:scale-[0.98]"
            >
              ← Back to the debate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
