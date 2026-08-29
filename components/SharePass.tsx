"use client";

import { useRef, useState } from "react";
import { CALL_LABEL } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { iqGrade, type RaceResult } from "@/lib/sim.ts";
import { Title, Wordmark } from "./Chrome.tsx";

/* Stylised Sepang: the long straights, the Turn 1-2 complex and the final
   hairpin, reduced to hard angles. Deliberately an abstraction rather than a
   survey trace — it reads at thumbnail size and claims to be nothing official. */
const TRACK =
  "M22 104 L150 104 L172 92 L178 74 L164 62 L128 66 L108 52 L126 38 L112 22 L74 20 L52 30 L58 46 L38 58 L44 78 L22 104 Z";

const CARD_W = 320;
const CARD_H = 569; // 9:16

export function SharePass({
  result,
  scenarioId,
  callsign,
}: {
  result: RaceResult;
  scenarioId: string;
  callsign: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const scenario = scenarioById(scenarioId);

  async function exportPass() {
    const node = cardRef.current;
    if (!node || busy) return;
    setBusy(true);
    setNote("");
    try {
      // Loaded on demand: ~30kb that most visitors never need.
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(node, {
        pixelRatio: 3, // 320x569 -> 960x1707, plenty for a Story
        backgroundColor: "#0a0a0c",
        cacheBust: true,
      });
      if (!blob) throw new Error("render failed");

      const file = new File([blob], "jomlap-pass.png", { type: "image/png" });
      const shareData = {
        files: [file],
        title: "JomLap",
        text: `Strategy IQ ${result.strategyIQ} on ${scenario.name} at Sepang.`,
      };

      // Native share sheet goes straight to Stories on a phone; desktop falls
      // back to a download.
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "jomlap-pass.png";
        a.click();
        URL.revokeObjectURL(url);
        setNote("Saved to your downloads.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setNote("Could not create the image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-5 lg:pb-8">
      <div className="lg:hidden">
        <Title hit="PASS" size="text-[13vw] leading-[0.84]">
          Circuit
        </Title>
      </div>

      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="relative shrink-0 overflow-hidden"
          style={{ width: CARD_W, height: CARD_H, background: "#0a0a0c" }}
        >
          {/* track watermark */}
          <svg
            viewBox="0 0 200 120"
            className="absolute -right-10 top-1/2 w-[130%] -translate-y-1/2 opacity-[0.16]"
            aria-hidden
          >
            <path d={TRACK} fill="none" stroke="var(--red)" strokeWidth="7" strokeLinejoin="round" />
          </svg>

          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <Wordmark small />
              <span className="data text-right text-[9px] uppercase leading-tight tracking-wider text-muted">
                Sepang
                <br />
                Intl Circuit
              </span>
            </div>

            <div>
              <div className="data text-[10px] uppercase tracking-wider text-muted">
                Strategist
              </div>
              <div className="title mt-0.5 text-3xl leading-none">{callsign}</div>

              <div className="mt-6 data text-[10px] uppercase tracking-wider text-muted">
                Strategy IQ
              </div>
              <div className="display leading-[0.8]" style={{ fontSize: 116 }}>
                {result.strategyIQ}
              </div>
              <div
                className="display mt-1 text-base"
                style={{ color: result.strategyIQ >= 80 ? "var(--green)" : "var(--yellow)" }}
              >
                {iqGrade(result.strategyIQ)}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Row label="Scenario" value={scenario.name} />
              <Row label="The call" value={CALL_LABEL[result.call]} />
              <Row
                label="Verdict"
                value={result.wasOptimal ? "Optimal" : `${result.rightAllAlong.name} was right`}
                tone={result.wasOptimal ? "var(--green)" : "var(--yellow)"}
              />
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5">
                <span className="data text-[9px] uppercase tracking-wider text-muted">
                  f1-sepang.vercel.app
                </span>
                <span
                  aria-hidden
                  className="block bg-red"
                  style={{ width: 26, height: 5, clipPath: "polygon(20% 0,100% 0,80% 100%,0 100%)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {note && <p className="data text-center text-[11px] text-muted">{note}</p>}

      <div className="actionbar lg:mt-2">
        <div className="shell lg:px-0">
          <button
            onClick={exportPass}
            disabled={busy}
            className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Rendering…" : "Share your pass"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="data text-[9px] uppercase tracking-wider text-muted">{label}</span>
      <span className="display text-right text-[13px] leading-tight" style={tone ? { color: tone } : undefined}>
        {value}
      </span>
    </div>
  );
}
