"use client";

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

export function Header({
  muted,
  onToggleMute,
  onRestart,
}: {
  muted: boolean;
  onToggleMute: () => void;
  onRestart?: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-sm"
      style={{ paddingTop: "calc(var(--safe-t) + 12px)" }}
    >
      <button onClick={onRestart} aria-label="JomLap — start over" className="active:scale-95 transition-transform">
        <Wordmark small />
      </button>
      <button
        onClick={onToggleMute}
        aria-pressed={muted}
        className="data rounded-full border border-line px-3 py-1.5 text-[11px] text-muted active:scale-95 transition-transform"
      >
        {muted ? "RADIO OFF" : "RADIO ON"}
      </button>
    </header>
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
