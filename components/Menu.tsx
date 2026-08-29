"use client";

import { useEffect } from "react";
import type { View } from "@/lib/views.ts";

const ITEMS: { view: View; n: string; label: string; hint: string }[] = [
  { view: "landing", n: "01", label: "Pit Wall", hint: "Call the strategy" },
  { view: "pass", n: "02", label: "Circuit Pass", hint: "Your shareable result" },
  { view: "mamak", n: "03", label: "Paddock Mamak", hint: "Escape routes & supper" },
];

export function Menu({
  open,
  onClose,
  onNavigate,
  hasRun,
  muted,
  onToggleMute,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (v: View) => void;
  hasRun: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  // Escape closes, and the page behind must not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg" role="dialog" aria-modal="true">
      <div
        className="flex items-center justify-between border-b border-line px-4 py-3"
        style={{ paddingTop: "calc(var(--safe-t) + 12px)" }}
      >
        <span className="data text-[10px] uppercase tracking-wider text-muted">Menu</span>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="data rounded-full border border-line px-3 py-1.5 text-[11px] text-muted active:scale-95 transition-transform"
        >
          CLOSE ✕
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1 px-4">
        {ITEMS.map((item, i) => {
          const locked = item.view === "pass" && !hasRun;
          return (
            <button
              key={item.view}
              disabled={locked}
              onClick={() => {
                onNavigate(item.view);
                onClose();
              }}
              style={{ "--i": i } as React.CSSProperties}
              className={`anim-rise group flex items-baseline gap-3 border-b border-line py-4 text-left transition-transform ${
                locked ? "opacity-35" : "active:scale-[0.99]"
              }`}
            >
              <span className="data text-[11px] text-muted">{item.n}</span>
              <span className="flex-1">
                <span className="title block text-[13vw] leading-[0.86] sm:text-5xl">
                  {item.label}
                </span>
                <span className="data mt-1.5 block text-[10px] uppercase tracking-wider text-muted">
                  {locked ? "Run a race first" : item.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div
        className="border-t border-line px-4 py-4"
        style={{ paddingBottom: "calc(var(--safe-b) + 16px)" }}
      >
        <button
          onClick={onToggleMute}
          aria-pressed={muted}
          className="data flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-[11px] uppercase tracking-wider text-muted active:scale-[0.98] transition-transform"
        >
          <span>Team radio audio</span>
          <span style={{ color: muted ? "var(--muted)" : "var(--green)" }}>
            {muted ? "OFF" : "ON"}
          </span>
        </button>
      </div>
    </div>
  );
}
