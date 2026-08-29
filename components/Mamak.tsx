"use client";

import { useEffect, useState } from "react";
import { ESCAPES } from "@/lib/mamak.ts";
import { Title } from "./Chrome.tsx";

type LivePlace = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  isOpen?: boolean;
  googleMapsUri: string;
  routeUrl: string;
};

export function Mamak({ onRestart }: { onRestart: () => void }) {
  const [livePlaces, setLivePlaces] = useState<Record<string, LivePlace[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const results: Record<string, LivePlace[]> = {};
        await Promise.all(
          ESCAPES.map(async (e) => {
            try {
              const res = await fetch(`/api/places?corridor=${e.id}`);
              const data = await res.json();
              if (data.live && data.places?.length > 0) {
                results[e.id] = data.places;
              }
            } catch {
              // ignore
            }
          }),
        );
        if (active) {
          setLivePlaces(results);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-5 lg:pb-8">
      <div className="relative overflow-hidden pt-3">
        <span
          aria-hidden
          className="title ghost bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
        >
          TEH TARIK
        </span>
        <div className="relative pt-[7vw] lg:pt-12">
          <Title hit="MAMAK" tone="yellow" size="text-[13vw] leading-[0.84] lg:text-6xl">
            Paddock
          </Title>
        </div>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted">
          Race done. Ninety thousand people now want the same two highways. Here is how you
          leave — and where to eat while everyone else sits on the ELITE.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
        {ESCAPES.map((e, i) => {
          const spots = livePlaces[e.id];
          const topSpot = spots?.[0];

          return (
            <article
              key={e.id}
              style={{ "--i": i } as React.CSSProperties}
              className="anim-rise card flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="data text-[10px] uppercase tracking-wider text-muted">
                  Skips {e.skips}
                </span>
                <div className="flex items-center gap-2">
                  {topSpot && (
                    <span className="data flex items-center gap-1 rounded bg-green/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-green">
                      <span className="h-1.5 w-1.5 rounded-full bg-green" />
                      Live Maps
                    </span>
                  )}
                  <span className="data text-[10px] text-yellow">0{i + 1}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="display text-lg leading-none">{e.name}</h3>
                <div className="data mt-1.5 text-[11px] text-muted">{e.via}</div>
                <p className="mt-3 text-[13px] leading-snug text-muted">{e.note}</p>

                {/* Supper stop details: uses Live Google Place if available, or curated default */}
                <div className="mt-4 flex-1 rounded-xl border border-line bg-surface-2 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="data text-[9px] uppercase tracking-wider text-muted">
                      Supper stop recommendation
                    </div>
                    {topSpot?.rating && (
                      <div className="data text-[11px] text-yellow font-medium">
                        ★ {topSpot.rating} <span className="text-muted text-[9px]">({topSpot.userRatingCount || 0})</span>
                      </div>
                    )}
                  </div>

                  <div className="display mt-1.5 text-base leading-snug text-yellow">
                    {topSpot ? topSpot.name : e.food.name}
                  </div>

                  <div className="mt-1 text-[12px] text-muted">
                    {topSpot ? topSpot.address : e.food.dish}
                  </div>

                  {topSpot?.isOpen !== undefined && (
                    <div className="mt-2">
                      <span
                        className={`data text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          topSpot.isOpen
                            ? "bg-green/10 text-green"
                            : "bg-yellow/10 text-yellow"
                        }`}
                      >
                        {topSpot.isOpen ? "● Open Now" : "Hours Vary"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={topSpot ? topSpot.routeUrl : e.routeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="data rounded-lg border border-line py-2.5 text-center text-[10px] uppercase tracking-wider transition-transform active:scale-95 hover:border-fg/40 flex items-center justify-center gap-1"
                  >
                    <span>Route</span>
                    <span aria-hidden>↗</span>
                  </a>
                  <a
                    href={topSpot ? topSpot.googleMapsUri : e.food.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="data rounded-lg bg-yellow py-2.5 text-center text-[10px] uppercase tracking-wider text-black transition-transform active:scale-95 hover:bg-yellow/90 font-medium flex items-center justify-center gap-1"
                  >
                    <span>{topSpot ? "Navigate" : "Find food"}</span>
                    <span aria-hidden>↗</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="data text-[10px] leading-relaxed text-muted">
        Routes open directly in Google Maps with turn-by-turn directions starting from Sepang International Circuit.
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
