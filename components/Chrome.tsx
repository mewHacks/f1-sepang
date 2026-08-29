"use client";

import { useEffect, useRef } from "react";
import type { Persona } from "@/lib/personas.ts";

/**
 * Reveals its children with a rise+fade the moment they scroll into view,
 * once, then leaves them alone. IntersectionObserver + a class flip — no
 * scroll listener, no per-frame work, and it costs nothing for anything
 * that's already on screen at load (the hero doesn't need this).
 */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {/* Angled red block — the broadcast chevron motif, no borrowed marks. */}
      <span
        aria-hidden
        className="block bg-red"
        style={{
          width: small ? 10 : 14,
          height: small ? 20 : 28,
          clipPath: "polygon(38% 0, 100% 0, 62% 100%, 0 100%)",
        }}
      />
      <span
        className={`display leading-none ${small ? "text-lg" : "text-2xl"}`}
        style={{ letterSpacing: "-0.02em" }}
      >
        JOM<span className="text-red">LAP</span>
      </span>
    </div>
  );
}

import type { View } from "@/lib/views.ts";

export function Header({
  onHome,
  onOpenMenu,
  currentView,
  onNavigate,
  hasRun = false,
  muted = false,
  onToggleMute,
}: {
  onHome: () => void;
  onOpenMenu: () => void;
  currentView?: View;
  onNavigate?: (view: View) => void;
  hasRun?: boolean;
  muted?: boolean;
  onToggleMute?: () => void;
}) {
  const NAV_ITEMS: { id: View; label: string; icon: string; requiresRun?: boolean }[] = [
    { id: "landing", label: "Pit Wall", icon: "🏁" },
    { id: "trophies", label: "Trophies", icon: "🏆" },
    { id: "predict", label: "Predictions", icon: "🎯" },
    { id: "mamak", label: "Paddock Mamak", icon: "🍛" },
    { id: "pass", label: "Circuit Pass", icon: "🎫", requiresRun: true },
  ];

  return (
    <header
      className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-md"
      style={{ paddingTop: "var(--safe-t)" }}
    >
      <div className="shell flex items-center justify-between px-4 py-3">
        {/* Brand Wordmark */}
        <button
          onClick={onHome}
          aria-label="JomLap — home"
          className="transition-transform active:scale-95 shrink-0"
        >
          <Wordmark small />
        </button>

        {/* Desktop Horizontal Nav Bar */}
        {onNavigate && (
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === "landing"
                  ? currentView === "landing" || currentView === "pitwall" || currentView === "debrief"
                  : currentView === item.id;
              const disabled = item.requiresRun && !hasRun;

              return (
                <button
                  key={item.id}
                  disabled={disabled}
                  onClick={() => onNavigate(item.id)}
                  className={`data flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-red text-white font-medium shadow-sm"
                      : disabled
                      ? "text-muted/40 cursor-not-allowed"
                      : "text-muted hover:text-white hover:bg-surface"
                  }`}
                  title={disabled ? "Run a race on the Pit Wall first" : undefined}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Official Tickets Link in Desktop Nav */}
            <a
              href="https://www.sepangcircuit.com/home"
              target="_blank"
              rel="noopener noreferrer"
              className="data flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs uppercase tracking-wider text-muted hover:text-white hover:border-fg/40 transition-colors ml-1"
            >
              <span>SIC Tickets</span>
              <span className="text-[10px]" aria-hidden>↗</span>
            </a>

            {/* Sound Toggle */}
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                aria-label={muted ? "Unmute pit radio" : "Mute pit radio"}
                className="data flex items-center justify-center h-8 w-8 rounded-lg border border-line text-xs text-muted hover:text-white hover:bg-surface transition-colors ml-1"
                title={muted ? "Unmute radio audio" : "Mute radio audio"}
              >
                {muted ? "🔇" : "🔊"}
              </button>
            )}
          </nav>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="md:hidden data flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted transition-transform active:scale-95"
        >
          Menu
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-[1.5px] w-3.5 bg-fg" />
            <span className="block h-[1.5px] w-3.5 bg-fg" />
          </span>
        </button>
      </div>
    </header>
  );
}

/**
 * Portrait, or a monogram in the engineer's colour until artwork exists.
 * Portraits are light-on-black, so `screen` knocks the black out against any
 * dark surface — no alpha channel and no matting halo.
 */
export function Avatar({
  persona,
  size = 40,
  className = "",
}: {
  persona: Persona;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-black ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--${persona.tone}) 45%, transparent), 0 0 14px -3px color-mix(in srgb, var(--${persona.tone}) 35%, transparent)`,
      }}
    >
      {persona.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={persona.avatar}
          alt={persona.name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          style={{ mixBlendMode: "screen", width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          className="display leading-none"
          style={{ color: `var(--${persona.tone})`, fontSize: size * 0.42 }}
        >
          {persona.name.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

/**
 * Slanted heavy-caps section title. `hit` colour-blocks the last word the way
 * the reference does — the word carries the accent, not a separate rule.
 */
export function Title({
  children,
  hit,
  tone = "red",
  size = "text-4xl",
}: {
  children: string;
  hit?: string;
  tone?: "red" | "yellow";
  size?: string;
}) {
  return (
    <h2 className={`title ${size} anim-rise`}>
      {children}
      {hit && (
        <>
          {" "}
          <span className={tone === "red" ? "title-hit" : "title-hit-y"}>{hit}</span>
        </>
      )}
    </h2>
  );
}

/** Full-bleed broadcast status card. */
export function Flag({
  tone,
  label,
  value,
}: {
  tone: "red" | "yellow" | "green" | "purple";
  label: string;
  value: string;
}) {
  const dark = tone === "yellow" || tone === "green";
  return (
    <div
      className="flag anim-pop"
      style={{ background: `var(--${tone})`, color: dark ? "#0a0a0c" : "#fff" }}
    >
      <span className="display text-lg leading-none">{label}</span>
      <span className="data text-xs opacity-80">{value}</span>
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className="card px-3 py-2.5">
      <div className="data text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="display mt-1 flex items-baseline gap-1 leading-none">
        <span className="text-xl" style={tone ? { color: `var(--${tone})` } : undefined}>
          {value}
        </span>
        {unit && <span className="data text-[11px] text-muted">{unit}</span>}
      </div>
    </div>
  );
}
