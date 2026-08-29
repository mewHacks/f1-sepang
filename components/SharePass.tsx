"use client";

import { useCallback, useRef, useState } from "react";
import { CALL_LABEL } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { iqGrade, type RaceResult } from "@/lib/sim.ts";
import { buildCaption, downloadBlob } from "@/lib/share.ts";
import { Title, Wordmark } from "./Chrome.tsx";
import { ShareRow } from "./ShareRow.tsx";

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

  const grade = iqGrade(result.strategyIQ);
  const caption = buildCaption({
    callsign,
    scenarioName: scenario.name,
    iq: result.strategyIQ,
    grade,
    call: result.call,
  });

  /** Render the card to a PNG blob. Shared by the main button and ShareRow
      so there is exactly one place that knows how to rasterise this card. */
  const getBlob = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return null;
    // Loaded on demand: ~13kb that most visitors never need.
    const { toBlob } = await import("html-to-image");
    return toBlob(node, {
      pixelRatio: 3, // 320x569 -> 960x1707, plenty for a Story
      backgroundColor: "#0a0a0c",
      cacheBust: true,
    });
  }, []);

  async function exportPass() {
    if (busy) return;
    setBusy(true);
    setNote("");
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("render failed");

      const file = new File([blob], "jomlap-pass.png", { type: "image/png" });
      const shareData = { files: [file], title: "JomLap", text: caption };

      // Native share sheet goes straight to Stories on a phone; desktop falls
      // back to a download.
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        downloadBlob(blob, "jomlap-pass.png");
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
          {/* Red bloom + grain, baked into the card so it survives export. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(115% 62% at 82% -6%, rgba(225,6,0,0.55), transparent 62%)," +
                "radial-gradient(85% 48% at 4% 104%, rgba(225,6,0,0.32), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* track watermark */}
          <svg
            viewBox="0 0 200 120"
            className="absolute -right-10 top-[38%] w-[135%] -translate-y-1/2"
            aria-hidden
          >
            <path
              d={TRACK}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.22"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </svg>

          {/* Ghosted scenario name bleeding off the left edge. */}
          <span
            aria-hidden
            className="title absolute -left-3 top-[30%] whitespace-nowrap text-[4.5rem] leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.22)",
            }}
          >
            SEPANG
          </span>

          <span
            aria-hidden
            className="edge-label data absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/40"
          >
            Thermal Pit Wall
          </span>

          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <Wordmark small />
              <span className="data text-right text-[9px] uppercase leading-tight tracking-[0.18em] text-white/50">
                Sepang
                <br />
                Intl Circuit
              </span>
            </div>

            <div className="relative">
              <div className="data text-[9px] uppercase tracking-[0.2em] text-white/50">
                Strategist
              </div>
              <div className="title mt-0.5 text-3xl leading-none">{callsign}</div>

              <div className="data mt-7 text-[9px] uppercase tracking-[0.2em] text-white/50">
                Strategy IQ
              </div>
              <div className="title leading-[0.78]" style={{ fontSize: 128 }}>
                {result.strategyIQ}
              </div>
              <div
                className="title mt-1 text-lg leading-none"
                style={{ color: result.strategyIQ >= 80 ? "#00d26a" : "#ffd500" }}
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
                tone={result.wasOptimal ? "#00d26a" : "#ffd500"}
              />
              <div
                className="mt-2 flex items-center justify-between pt-2.5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
              >
                <span className="data text-[9px] uppercase tracking-[0.18em] text-white/50">
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

      <ShareRow caption={caption} getBlob={getBlob} />

      <div className="actionbar lg:mt-2">
        <div className="shell lg:px-0">
          <button
            onClick={exportPass}
            disabled={busy}
            className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Rendering…" : "Save your pass"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="data text-[9px] uppercase tracking-[0.18em] text-white/50">{label}</span>
      <span className="display text-right text-[13px] leading-tight" style={tone ? { color: tone } : undefined}>
        {value}
      </span>
    </div>
  );
}
