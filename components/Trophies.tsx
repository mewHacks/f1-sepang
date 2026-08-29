"use client";

import { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  leaderboard,
  rankFor,
  readProgress,
  RANKS,
  type LeaderRow,
  type Progress,
} from "@/lib/progress.ts";
import { Reveal, Title } from "./Chrome.tsx";

const TIER_COLOR = {
  bronze: "var(--muted)",
  silver: "var(--ice)",
  gold: "var(--yellow)",
} as const;

// Rarity label per tier — shown on every trophy so collectors know the pull.
const RARITY: Record<keyof typeof TIER_COLOR, string> = {
  bronze: "Common",
  silver: "Rare",
  gold: "Legendary",
};

/**
 * Sticker stamp for one achievement. Looks for /stamps/<id>.webp and falls
 * back to a plain badge if the art isn't there yet, so the page works
 * whether or not every sticker has been drawn.
 *
 * Locked stamps render desaturated and faded — the classic "empty slot in
 * the sticker album" read. Static filter, painted once, no per-frame cost.
 */
function Stamp({
  id,
  tier,
  got,
}: {
  id: string;
  tier: keyof typeof TIER_COLOR;
  got: boolean;
}) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    // Car-stamp fallback: a rounded pit-lane badge with a car for collected
    // trophies, a faded checkered flag for locked ones.
    return (
      <span
        className="grid aspect-square w-16 place-items-center rounded-full border-2 text-2xl font-bold"
        style={{
          borderColor: got ? TIER_COLOR[tier] : "var(--line)",
          color: got ? TIER_COLOR[tier] : "var(--muted)",
          background: got
            ? `color-mix(in srgb, ${TIER_COLOR[tier]} 15%, transparent)`
            : "transparent",
          opacity: got ? 1 : 0.5,
        }}
      >
        {got ? "★" : "○"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/stamps/${id}.png`}
      alt=""
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      onError={() => setMissing(true)}
      className="h-14 w-14 shrink-0 object-contain drop-shadow-md transition-all"
      style={{
        filter: got ? "none" : "grayscale(1) brightness(0.6)",
        opacity: got ? 1 : 0.35,
      }}
    />
  );
}

export function Trophies({ callsign }: { callsign: string }) {
  // Read storage in an effect so server and first client paint agree.
  const [progress, setProgress] = useState<Progress | null>(null);
  const [board, setBoard] = useState<LeaderRow[]>([]);

  useEffect(() => {
    setProgress(readProgress());
    setBoard(leaderboard(callsign));
  }, [callsign]);

  if (!progress) {
    return <div className="px-4 py-16 text-center text-sm text-muted">Loading…</div>;
  }

  const rank = rankFor(progress.xp);
  const next = RANKS.find((r) => r.at > progress.xp);
  const toNext = next ? next.at - progress.xp : 0;
  const unlockedCount = progress.unlocked.length;

  return (
    <div className="px-4 pb-32 pt-5 lg:pb-10">
      <div className="relative overflow-hidden pt-3">
        <span
          aria-hidden
          className="title ghost bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
        >
          TROPHIES
        </span>
        <div className="relative pt-[7vw] lg:pt-12">
          <Title hit="ROOM" tone="yellow" size="text-[13vw] leading-[0.84] lg:text-6xl">
            Trophy
          </Title>
        </div>
      </div>

      {/* Rank card */}
      <div className="card halftone relative mt-5 overflow-hidden p-5">
        <div className="data text-[10px] uppercase tracking-wider text-muted">Your rank</div>
        <div className="title mt-1 text-4xl leading-none text-yellow">{rank.name}</div>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="title text-2xl leading-none">{progress.xp} XP</span>
          <span className="data text-xs text-muted">
            {unlockedCount}/{ACHIEVEMENTS.length} achievements
          </span>
        </div>
        {next && (
          <>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-yellow transition-all duration-700"
                style={{ width: `${Math.min(100, (progress.xp / next.at) * 100)}%` }}
              />
            </div>
            <div className="data mt-2 text-[11px] text-muted">
              {toNext} XP to {next.name}
            </div>
          </>
        )}
      </div>

      {/* Leaderboard */}
      <Reveal className="mt-8">
        <h2 className="title title-loose text-3xl leading-tight">Leaderboard</h2>
        <p className="mt-1.5 text-[13px] text-muted">
          Scores on this device. Beat the pace-setters.
        </p>
        <div className="card mt-3 overflow-hidden">
          {board.map((row, i) => (
            <div
              key={`${row.name}-${i}`}
              className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
              style={row.you ? { background: "color-mix(in srgb, var(--red) 12%, transparent)" } : undefined}
            >
              <span
                className="title w-6 shrink-0 text-lg leading-none"
                style={{ color: i === 0 ? "var(--yellow)" : "var(--muted)" }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px]">
                {row.name}
                {row.you && <span className="ml-2 text-xs text-red">you</span>}
              </span>
              <span className="data shrink-0 text-xs text-muted">IQ {row.bestIQ}</span>
              <span className="title w-14 shrink-0 text-right text-lg leading-none">
                {row.xp}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Achievements — square car-stamp album: 4 per row on desktop,
          2 per row on mobile, each box tagged with its rarity. */}
      <Reveal className="mt-8">
        <h2 className="title title-loose text-3xl leading-tight">Achievements</h2>
        <p className="mt-1.5 text-[13px] text-muted">
          Your paddock stamp album — collected trophies become car stamps, each with a rarity.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => {
            const got = progress.unlocked.includes(a.id);
            return (
              <div
                key={a.id}
                className={`card relative flex aspect-square flex-col items-center justify-center gap-2 p-3 text-center transition-all ${
                  got ? "border-yellow/40 bg-surface shadow-lg" : "border-line bg-surface/60"
                }`}
              >
                {/* Rarity tag */}
                <div
                  className="data absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold"
                  style={{ color: got ? TIER_COLOR[a.tier] : "var(--muted)" }}
                >
                  {RARITY[a.tier]}
                </div>

                {/* Car stamp */}
                <Stamp id={a.id} tier={a.tier} got={got} />

                {/* Name */}
                <div
                  className="title text-sm leading-tight"
                  style={{ color: got ? "var(--fg)" : "var(--muted)" }}
                >
                  {a.name}
                </div>

                {/* Status */}
                <div
                  className="data text-[10px] uppercase tracking-wider font-semibold"
                  style={{ color: got ? "var(--yellow)" : "var(--muted)" }}
                >
                  {got ? "✓ Unlocked" : `+${a.xp} XP`}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
