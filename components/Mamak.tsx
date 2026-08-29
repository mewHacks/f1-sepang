"use client";

import { ESCAPES } from "@/lib/mamak.ts";
import { Title } from "./Chrome.tsx";

export function Mamak({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-5 lg:pb-8">
      <div>
        <Title hit="MAMAK" tone="yellow" size="text-[13vw] leading-[0.84] sm:text-5xl">
          Paddock
        </Title>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Race done. Ninety thousand people now want the same two highways. Here is how you
          leave — and where to eat while everyone else sits on the ELITE.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
        {ESCAPES.map((e, i) => (
          <article
            key={e.id}
            style={{ "--i": i } as React.CSSProperties}
            className="anim-rise card flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="data text-[10px] uppercase tracking-wider text-muted">
                Skips {e.skips}
              </span>
              <span className="data text-[10px] text-yellow">0{i + 1}</span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="display text-lg leading-none">{e.name}</h3>
              <div className="data mt-1.5 text-[11px] text-muted">{e.via}</div>
              <p className="mt-3 flex-1 text-[13px] leading-snug text-muted">{e.note}</p>

              <div className="mt-4 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
                <div className="data text-[9px] uppercase tracking-wider text-muted">
                  Supper stop
                </div>
                <div className="display mt-1 text-sm leading-none text-yellow">{e.food.name}</div>
                <div className="mt-1 text-[12px] text-muted">{e.food.dish}</div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={e.routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="data rounded-lg border border-line py-2.5 text-center text-[10px] uppercase tracking-wider transition-transform active:scale-95"
                >
                  Route
                </a>
                <a
                  href={e.food.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="data rounded-lg bg-yellow py-2.5 text-center text-[10px] uppercase tracking-wider text-black transition-transform active:scale-95"
                >
                  Find food
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="data text-[10px] leading-relaxed text-muted">
        Routes open in Google Maps. We link an area search rather than a single restaurant —
        opening hours on race night are nobody&apos;s guess to make.
      </p>

      <div className="actionbar lg:mt-2">
        <div className="shell lg:px-0">
          <button
            onClick={onRestart}
            className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
          >
            Back to the pit wall
          </button>
        </div>
      </div>
    </div>
  );
}
