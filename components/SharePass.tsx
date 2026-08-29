"use client";

import { useCallback, useRef, useState } from "react";
import { CALL_LABEL } from "@/lib/personas.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import { iqGrade, type RaceResult } from "@/lib/sim.ts";
import { buildCaption, downloadBlob } from "@/lib/share.ts";
import { Avatar, Title, Wordmark } from "./Chrome.tsx";
import { ShareRow } from "./ShareRow.tsx";

const TILT_MAX_DEG = 10;

/* Pointer-driven 3D tilt, built native rather than pulling in a component
   library for one interaction. rotateX/rotateY only — GPU-composited, no
   layout or paint per frame, so it costs nothing extra on a low-spec phone.
   Inlined rather than a shared hook: a hook returning `{ ref, ...handlers }`
   together trips the react-hooks/refs lint rule, which reads any handler
   living alongside a ref as suspect regardless of what it actually touches. */
function onTiltMove(el: HTMLElement | null, e: React.PointerEvent) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--tilt-x", `${((0.5 - py) * 2 * TILT_MAX_DEG).toFixed(2)}deg`);
  el.style.setProperty("--tilt-y", `${((px - 0.5) * 2 * TILT_MAX_DEG).toFixed(2)}deg`);
  el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
  el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
}

function onTiltLeave(el: HTMLElement | null) {
  if (!el) return;
  el.style.setProperty("--tilt-x", "0deg");
  el.style.setProperty("--tilt-y", "0deg");
}

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
  const tiltRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  // Off by default: it's a bonus, not the point, and a budget phone should
  // never pay for it without asking.
  const [holo, setHolo] = useState(false);
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

      <div className="tilt-wrap flex justify-center">
        {/* Tilt lives on this wrapper, not on cardRef below — html-to-image
            rasterises cardRef's own subtree, so an ancestor's rotateX/Y never
            touches the exported pixels regardless of hover state at export
            time. */}
        <div
          ref={tiltRef}
          onPointerMove={(e) => onTiltMove(tiltRef.current, e)}
          onPointerLeave={() => onTiltLeave(tiltRef.current)}
          className="tilt-card relative"
          style={{ width: CARD_W, height: CARD_H }}
        >
          <div
            ref={cardRef}
            className="absolute inset-0 overflow-hidden"
            style={{ background: "#0a0a0c" }}
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
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2">
                  <Avatar persona={result.rightAllAlong} size={24} />
                  <span className="data text-[9px] uppercase tracking-[0.16em] text-white/60">
                    {result.wasOptimal ? "Verified by" : "Called by"} {result.rightAllAlong.name}
                  </span>
                </div>
                <span
                  className="display text-right text-[11px] leading-tight"
                  style={{ color: result.wasOptimal ? "#00d26a" : "#ffd500" }}
                >
                  {result.wasOptimal ? "OPTIMAL" : "OVERRULED"}
                </span>
              </div>
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

          {/* Holographic sheen — CSS only, no canvas/WebGL. Rides the same
              pointer coordinates the tilt already tracks, so it's free: no
              second listener, no rAF loop. Sits outside cardRef so it never
              touches the exported PNG. */}
          {holo && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                mixBlendMode: "color-dodge",
                opacity: 0.5,
                background:
                  "repeating-linear-gradient(115deg, #ff2e79 0%, #ffd500 12%, #00e5ff 24%, #38e07a 36%, #ff2e79 48%)",
                backgroundSize: "220% 220%",
                backgroundPosition: "var(--glare-x) var(--glare-y)",
                transition: "background-position 0.05s linear",
              }}
            />
          )}
        </div>
      </div>

      <label className="data flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted">
        <input
          type="checkbox"
          checked={holo}
          onChange={(e) => setHolo(e.target.checked)}
          className="h-3.5 w-3.5 accent-red"
        />
        Holo shader FX
        <span className="text-muted/60">(off by default — GPU only, safe on low-spec)</span>
      </label>

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
