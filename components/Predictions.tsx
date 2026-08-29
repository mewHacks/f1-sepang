"use client";

import { useEffect, useState } from "react";
import {
  MARKETS,
  oddsFor,
  placeBet,
  potentialReturn,
  readPredictions,
  totalStaked,
  yesShare,
  type Market,
  type PredictionState,
} from "@/lib/predictions.ts";
import { recordPrediction } from "@/lib/progress.ts";
import { radioBeep } from "@/lib/beep.ts";
import { Reveal, Title } from "./Chrome.tsx";

const STAKES = [25, 50, 100];

export function Predictions({ muted }: { muted: boolean }) {
  // Storage is read in an effect, not during render, so the server and the
  // first client paint agree (otherwise React hydration mismatches).
  const [state, setState] = useState<PredictionState | null>(null);
  const [stake, setStake] = useState(50);
  const [toast, setToast] = useState("");

  useEffect(() => setState(readPredictions()), []);

  function bet(market: Market, side: "YES" | "NO") {
    if (!state || stake > state.balance) return;
    radioBeep(muted);
    setState(placeBet(market, side, stake));
    const earned = recordPrediction(false);
    setToast(
      earned.length > 0
        ? `Unlocked: ${earned.map((a) => a.name).join(", ")}`
        : `${stake} staked on ${side}`,
    );
    setTimeout(() => setToast(""), 2600);
  }

  if (!state) {
    return <div className="px-4 py-16 text-center text-sm text-muted">Loading…</div>;
  }

  const staked = totalStaked(state.bets);

  return (
    <div className="px-4 pb-32 pt-5 lg:pb-10">
      <div className="relative overflow-hidden pt-3">
        <span
          aria-hidden
          className="title ghost-red bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
        >
          CALL IT
        </span>
        <div className="relative pt-[7vw] lg:pt-12">
          <Title hit="MARKET" tone="red" size="text-[13vw] leading-[0.84] lg:text-6xl">
            Fan
          </Title>
        </div>
        <p className="relative mt-4 max-w-md text-[15px] leading-relaxed text-fg/80">
          Predict what happens on race day. Back yes or no, watch the odds move, and see
          who called it. Played with <span className="text-yellow">Teh Points</span> — not
          money, not real betting.
        </p>
      </div>

      {/* Wallet */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="card px-3 py-2.5">
          <div className="data text-[10px] uppercase tracking-wider text-muted">Balance</div>
          <div className="title mt-1 text-xl leading-none text-yellow">{state.balance}</div>
        </div>
        <div className="card px-3 py-2.5">
          <div className="data text-[10px] uppercase tracking-wider text-muted">Staked</div>
          <div className="title mt-1 text-xl leading-none">{staked}</div>
        </div>
        <div className="card px-3 py-2.5">
          <div className="data text-[10px] uppercase tracking-wider text-muted">To win</div>
          <div className="title mt-1 text-xl leading-none text-green">
            {potentialReturn(state.bets)}
          </div>
        </div>
      </div>

      {/* Stake selector */}
      <div className="mt-4 flex items-center gap-2">
        <span className="data text-xs uppercase tracking-wider text-muted">Stake</span>
        {STAKES.map((s) => (
          <button
            key={s}
            onClick={() => setStake(s)}
            aria-pressed={stake === s}
            className={`data rounded-lg border px-3 py-1.5 text-xs transition-transform active:scale-95 ${
              stake === s ? "border-yellow text-yellow" : "border-line text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {MARKETS.map((m, i) => {
          const share = yesShare(m, state.bets);
          const pct = Math.round(share * 100);
          const mine = state.bets.filter((b) => b.marketId === m.id);
          const canAfford = stake <= state.balance;

          return (
            <Reveal key={m.id}>
              <article
                style={{ "--i": i } as React.CSSProperties}
                className="card overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="title title-loose text-xl leading-tight">{m.question}</h3>
                    <span className="data shrink-0 rounded-full border border-line px-2 py-1 text-[9px] uppercase tracking-wider text-muted">
                      {m.closesIn}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{m.flavour}</p>

                  {/* Odds bar — the crowd's current split, visually. */}
                  <div className="mt-3.5">
                    <div className="data mb-1.5 flex justify-between text-[11px]">
                      <span className="text-green">YES {pct}%</span>
                      <span className="text-red">{100 - pct}% NO</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="bg-green transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="flex-1 bg-red/70" />
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => bet(m, "YES")}
                      disabled={!canAfford}
                      className="title rounded-xl border border-green/40 bg-green/10 py-3 text-base leading-none text-green transition-transform active:scale-[0.97] disabled:opacity-40"
                    >
                      Yes · {oddsFor(share, "YES").toFixed(2)}×
                    </button>
                    <button
                      onClick={() => bet(m, "NO")}
                      disabled={!canAfford}
                      className="title rounded-xl border border-red/40 bg-red/10 py-3 text-base leading-none text-red transition-transform active:scale-[0.97] disabled:opacity-40"
                    >
                      No · {oddsFor(share, "NO").toFixed(2)}×
                    </button>
                  </div>

                  {mine.length > 0 && (
                    <div className="data mt-2.5 text-[11px] text-muted">
                      Your position:{" "}
                      {mine.map((b, j) => (
                        <span key={j} className={b.side === "YES" ? "text-green" : "text-red"}>
                          {j > 0 && ", "}
                          {b.stake} on {b.side} @ {b.oddsAtPlacement.toFixed(2)}×
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <p className="data mt-5 text-[10px] leading-relaxed text-muted">
        Teh Points are fictional and have no value. Nothing here can be bought, sold, or
        cashed out. Markets settle after the real race weekend.
      </p>

      {toast && (
        <div className="anim-pop fixed inset-x-4 bottom-24 z-30 rounded-xl border border-yellow/40 bg-surface px-4 py-3 text-center text-sm text-yellow lg:left-1/2 lg:right-auto lg:w-80 lg:-translate-x-1/2">
          {toast}
        </div>
      )}
    </div>
  );
}
