"use client";

import { useEffect, useRef } from "react";
import type { LapPoint } from "@/lib/sim.ts";

/* One static canvas draw — no animation loop, no rAF, nothing running after
   paint. On a low-end phone an idle chart should cost exactly zero. */

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#fff";

export function LapChart({ laps }: { laps: LapPoint[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || laps.length === 0) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Cap DPR at 2: a 3x phone gains nothing visible and pays 2.25x the fill.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = 180;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padL = 8;
    const padR = 8;
    const padT = 12;
    const padB = 22;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const gaps = laps.map((l) => l.gap);
    const maxAbs = Math.max(4, ...gaps.map(Math.abs));
    const x = (i: number) => padL + (i / Math.max(1, laps.length - 1)) * plotW;
    const y = (gap: number) => padT + plotH / 2 - (gap / maxAbs) * (plotH / 2);

    // Wetness, as a filled area along the bottom — the weather is context,
    // so it sits behind and stays dim.
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    laps.forEach((l, i) => ctx.lineTo(x(i), padT + plotH - l.wetness * plotH * 0.55));
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.closePath();
    ctx.fillStyle = "rgba(230,233,242,0.10)";
    ctx.fill();

    // Reference car baseline.
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = css("--line");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y(0));
    ctx.lineTo(padL + plotW, y(0));
    ctx.stroke();
    ctx.setLineDash([]);

    // Gap trace.
    ctx.beginPath();
    laps.forEach((l, i) => (i ? ctx.lineTo(x(i), y(l.gap)) : ctx.moveTo(x(i), y(l.gap))));
    ctx.strokeStyle = css("--red");
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Where you ended up.
    const last = laps[laps.length - 1];
    ctx.beginPath();
    ctx.arc(x(laps.length - 1), y(last.gap), 4, 0, Math.PI * 2);
    ctx.fillStyle = css("--red");
    ctx.fill();

    ctx.fillStyle = css("--muted");
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText("LAP 1", padL, h - 7);
    const endLabel = `LAP ${laps.length}`;
    ctx.fillText(endLabel, padL + plotW - ctx.measureText(endLabel).width, h - 7);

    ctx.fillStyle = "rgba(230,233,242,0.45)";
    ctx.fillText("WATER", padL, padT + plotH - 4);
  }, [laps]);

  return (
    <div className="card overflow-hidden p-2">
      <div className="data mb-1 flex justify-between px-1.5 text-[10px] uppercase tracking-wider text-muted">
        <span>Gap to field</span>
        <span className="text-red">your race</span>
      </div>
      <canvas ref={ref} role="img" aria-label="Lap-by-lap gap to the reference car" />
    </div>
  );
}
