"use client";

import { useState } from "react";
import { downloadBlob, threadsIntentUrl, xIntentUrl } from "@/lib/share.ts";

/* Simplified glyphs, not a copy of any brand's exact logo file — plain
   strokes are enough to read as "X" / "camera" / "interlocked loops" at
   52px, and side-steps redrawing a trademarked path by hand. */

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M9 3c-3.3 0-6 3-6 7v4c0 4 2.7 7 6 7 2.6 0 4.6-1.6 5.4-4" />
      <path d="M15 21c3.3 0 6-3 6-7v-4c0-4-2.7-7-6-7-2.6 0-4.6 1.6-5.4 4" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ShareButton({
  label,
  onClick,
  busy,
  children,
}: {
  label: string;
  onClick: () => void;
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      className="share-btn disabled:opacity-50"
    >
      <span className="share-btn__fill" aria-hidden />
      <span className="share-btn__icon">{children}</span>
    </button>
  );
}

export function ShareRow({
  caption,
  getBlob,
}: {
  caption: string;
  getBlob: () => Promise<Blob | null>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function withDownload() {
    const blob = await getBlob();
    if (blob) downloadBlob(blob, "jomlap-pass.png");
    return blob;
  }

  async function onX() {
    setBusy("x");
    setNote("");
    try {
      await withDownload();
      window.open(xIntentUrl(caption), "_blank", "noopener,noreferrer");
      setNote("Pass saved to your downloads — attach it to the post.");
    } finally {
      setBusy(null);
    }
  }

  async function onThreads() {
    setBusy("threads");
    setNote("");
    try {
      await withDownload();
      window.open(threadsIntentUrl(caption), "_blank", "noopener,noreferrer");
      setNote("Pass saved to your downloads — attach it to the post.");
    } finally {
      setBusy(null);
    }
  }

  async function onInstagram() {
    setBusy("ig");
    setNote("");
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("no image");

      const file = new File([blob], "jomlap-pass.png", { type: "image/png" });
      // Instagram has no web share intent, but it IS a target in the native
      // share sheet on a phone — this is the one real path to it on web.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "JomLap", text: caption });
        return;
      }

      downloadBlob(blob, "jomlap-pass.png");
      try {
        await navigator.clipboard.writeText(caption);
        setNote("Pass saved and caption copied — paste both into Instagram.");
      } catch {
        setNote("Pass saved — open Instagram and share it from your gallery.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setNote("Could not share. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="data text-[10px] uppercase tracking-[0.25em] text-muted">Share to</span>
      <div className="flex items-center gap-3.5">
        <ShareButton label="Share to X" onClick={onX} busy={busy === "x"}>
          <XIcon />
        </ShareButton>
        <ShareButton label="Share to Threads" onClick={onThreads} busy={busy === "threads"}>
          <ThreadsIcon />
        </ShareButton>
        <ShareButton label="Share to Instagram" onClick={onInstagram} busy={busy === "ig"}>
          <InstagramIcon />
        </ShareButton>
      </div>
      {note && <p className="data text-center text-[11px] text-muted">{note}</p>}
    </div>
  );
}
