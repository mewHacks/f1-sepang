"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONAS, CALL_LABEL } from "@/lib/personas.ts";
import { Avatar, Reveal, Title } from "./Chrome.tsx";

// Section-by-section directory of everything inside JomLap
const SECTIONS = [
  {
    n: "01",
    tone: "red" as const,
    label: "Pit Wall Strategy",
    title: "Call the race",
    body: "Mix Sepang's heat and sudden rain, hear three engineers fight over the radio, then make the tire call. You get a score at the end.",
    tag: "Core Game",
  },
  {
    n: "02",
    tone: "yellow" as const,
    label: "Trophy Room",
    title: "Climb the ranks",
    body: "Go from Rookie to Legend. Earn 12 stamps by calling the weather right and beating the local leaderboard.",
    tag: "Achievements",
  },
  {
    n: "03",
    tone: "purple" as const,
    label: "Fan Market",
    title: "Predict the race",
    body: "Bet fake credits on what happens — will it rain at Turn 11, who pits first. See if your gut is right.",
    tag: "Predictions",
  },
  {
    n: "04",
    tone: "green" as const,
    label: "Paddock Mamak",
    title: "Find your supper",
    body: "Answer 5 quick questions to get your food match, or browse 10 real makan spots near the track with directions.",
    tag: "Food & Navigation",
  },
  {
    n: "05",
    tone: "ice" as const,
    label: "Circuit Pass",
    title: "Share your pass",
    body: "Get a pass stamped with your rank and callsign, then post it straight to X, Threads, or Instagram.",
    tag: "Shareable Pass",
  },
];

export function Landing({
  onStart,
}: {
  onStart: (callsign: string) => void;
}) {
  const [callsign, setCallsign] = useState("");
  const [active, setActive] = useState(0);

  // Hero parallax: refs written to directly (no React state) so a mouse
  // sweeping across the hero doesn't trigger a re-render per pixel. Touch
  // devices never fire pointermove without a finger down, so this is
  // inherently free on mobile — nothing runs until a mouse actually moves.
  const carRef = useRef<HTMLImageElement>(null);
  const slabRef = useRef<HTMLDivElement>(null);

  // Cycles the roster reveal on its own; any tap on a dot resets the clock
  // so a manual choice doesn't get yanked away a moment later.
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % PERSONAS.length), 4200);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="pb-32 pt-6 lg:pb-10">
      {/* --- hero: full-bleed, no side padding, so the ghost word and the
          car can both run truly edge to edge. --- */}
      <div
        className="relative min-h-[620px] overflow-hidden px-4 pb-2 pt-6 sm:min-h-[560px] lg:min-h-[640px]"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          if (carRef.current)
            carRef.current.style.transform = `translate3d(${px * -22}px, ${py * -14}px, 0)`;
          if (slabRef.current)
            slabRef.current.style.transform = `translate3d(${px * -10}px, ${py * -7}px, 0)`;
        }}
        onPointerLeave={() => {
          if (carRef.current) carRef.current.style.transform = "translate3d(0,0,0)";
          if (slabRef.current) slabRef.current.style.transform = "translate3d(0,0,0)";
        }}
      >
        {/* Diagonal slab + car, bleeding off the bottom-right. Pure decor —
            aria-hidden, and it sits behind the text so nothing overlaps
            content on a narrow phone. */}
        <div
          ref={slabRef}
          aria-hidden
          className="absolute -right-24 -top-10 h-[420px] w-[420px] bg-red opacity-[0.14] transition-transform duration-200 ease-out sm:h-[520px] sm:w-[520px]"
          style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={carRef}
          src="/hero-car.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-2 -right-10 w-[78vw] max-w-[560px] opacity-90 transition-transform duration-200 ease-out sm:-right-16 sm:w-[52vw] lg:bottom-4 lg:-right-16 lg:w-[38vw]"
        />

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
        <p className="relative mt-5 max-w-[85vw] text-lg leading-relaxed text-fg/85 sm:max-w-md lg:max-w-lg lg:text-xl">
          You are running race strategy at the Malaysian Grand Prix. The track is 50°C, rain
          is coming, and three engineers each want you to do something different.{" "}
          <span className="text-red">You decide. No F1 knowledge needed.</span>
        </p>

        {/* --- Hero Comms Trio: instant visual intro to the 3 personas ---
            Capped to the text column on wide screens — full-width here was
            running straight over the car. */}
        <div className="anim-rise relative mt-6 flex max-w-[85vw] flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/85 p-3.5 sm:max-w-md lg:max-w-lg">
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
            <div className="title text-lg leading-tight">Your three engineers</div>
            <div className="mt-0.5 text-[13px] leading-snug text-muted">
              They never agree. That is the whole game.
            </div>
          </div>
        </div>
      </div>

      {/* --- Section-by-Section App Walkthrough --- */}
      <Reveal className="mt-12 px-4">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-red">
          <span className="h-1.5 w-1.5 rounded-full bg-red" />
          <span>Application Directory</span>
        </div>
        <h2 className="title title-loose text-3xl leading-tight sm:text-4xl mt-1">
          Inside the Web App
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted max-w-md">
          Five things to do in JomLap — pick a race, chase stamps, predict the outcome, grab supper, share your pass.
        </p>

        <div className="mt-6 flex flex-col gap-3.5">
          {SECTIONS.map((f, i) => (
            <div
              key={f.label}
              style={{ "--i": i } as React.CSSProperties}
              className="anim-rise card flex flex-col sm:flex-row gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5 lg:hover:border-fg/30"
            >
              <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 shrink-0">
                <span
                  className="font-mono text-3xl font-bold leading-none"
                  style={{ color: `var(--${f.tone})` }}
                >
                  {f.n}
                </span>
                <span
                  className="sm:hidden data text-[9px] font-mono uppercase tracking-wider rounded-full border px-2 py-0.5"
                  style={{ borderColor: `var(--${f.tone})`, color: `var(--${f.tone})` }}
                >
                  {f.tag}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="data text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: `var(--${f.tone})` }}
                  >
                    {f.label}
                  </div>
                  <span
                    className="hidden sm:inline-block data text-[9px] font-mono uppercase tracking-wider rounded-full border px-2 py-0.5"
                    style={{ borderColor: `var(--${f.tone})`, color: `var(--${f.tone})` }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3 className="title title-loose text-xl leading-snug sm:text-2xl mt-1 text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-fg/80">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* --- roster: one engineer revealed at a time, auto-cycling --- */}
      <Reveal className="mt-10">
        <div className="px-4">
          <h2 className="title title-loose text-3xl leading-tight sm:text-4xl">
            Meet the three
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-fg/75">
            Each one always pushes for a different call. One of them is right.
          </p>
        </div>

        <div className="relative mx-4 mt-4 h-[400px] overflow-hidden rounded-2xl border border-line sm:mx-auto sm:w-96">
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
                <div className="data mt-1.5 text-xs uppercase tracking-wider text-muted">
                  {p.role}
                </div>
                <div className="mt-3 text-[15px] leading-relaxed text-fg/85">{p.pitch}</div>
                <div
                  className="data mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider"
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
      </Reveal>

      {/* --- setup --- */}
      <Reveal className="mt-11 px-4">
        <h2 className="title title-loose text-3xl leading-tight sm:text-4xl">Start a race</h2>

        <label className="mt-5 block">
          <span className="mb-2 block text-[15px] text-fg/75">
            What should they call you on the radio?
          </span>
          <input
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            maxLength={24}
            placeholder="Type a name"
            autoComplete="off"
            className="title w-full rounded-xl border border-line bg-surface px-4 py-4 text-2xl outline-none placeholder:text-muted/40 focus:border-red"
          />
        </label>

        <div className="mb-2 mt-6 text-[15px] text-fg/75">
          Then you&apos;ll mix the weather yourself and meet the judges.
        </div>
      </Reveal>

      {/* --- official circuit tickets banner --- */}
      <Reveal className="mt-11 px-4">
        <div className="card relative overflow-hidden p-5 border-line bg-gradient-to-br from-surface to-surface-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="data text-[10px] uppercase tracking-[0.2em] text-red font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red" />
                Sepang International Circuit
              </div>
              <h3 className="title text-2xl leading-tight text-white mt-1">
                Experience Sepang Trackside Live
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg/75 max-w-md">
                Get official grandstand tickets, track day passes, and race schedules directly from SIC.
              </p>
            </div>
            <a
              href="https://www.sepangcircuit.com/home"
              target="_blank"
              rel="noopener noreferrer"
              className="data shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-xs uppercase tracking-wider text-white font-medium transition-all hover:bg-white/10 hover:border-fg/40 active:scale-95 text-center"
            >
              <span>Get Official Tickets</span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </Reveal>

      <div className="actionbar mt-8">
        <div className="shell px-4">
          <button
            onClick={() => onStart(callsign.trim() || "STRATEGIST")}
            className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
          >
            Start the race →
          </button>
        </div>
      </div>
    </div>
  );
}
