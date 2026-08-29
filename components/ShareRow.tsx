"use client";

import { useState } from "react";
import { downloadBlob, threadsIntentUrl, xIntentUrl } from "@/lib/share.ts";

/* Simplified glyphs, not a copy of any brand's exact logo file — plain
   strokes are enough to read as "X" / "camera" / "interlocked loops" at
   52px, and side-steps redrawing a trademarked path by hand. */

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.186 24C5.464 24 0 18.536 0 11.814 0 5.092 5.464 0 12.186 0c6.643 0 11.968 5.253 12.062 11.884-.047 3.42-1.328 6.27-3.606 8.026-2.152 1.66-4.996 2.37-8.458 2.096-3.79-.3-6.66-2.484-7.674-5.842-.823-2.729-.153-5.718 1.838-8.198 1.89-2.356 4.793-3.666 8.174-3.688 2.87.018 5.378.969 7.25 2.75 1.547 1.472 2.457 3.396 2.632 5.564l-2.484.218c-.347-3.796-3.21-6.096-7.398-6.113-2.616.017-4.825 1.026-6.219 2.842-1.46 1.902-1.928 4.167-1.317 6.377.781 2.825 3.094 4.542 6.035 4.773 2.843.224 5.088-.344 6.674-1.69 1.636-1.385 2.55-3.568 2.573-6.15-.078-5.326-4.32-9.52-9.67-9.52-5.38 0-9.76 4.38-9.76 9.76s4.38 9.76 9.76 9.76c2.793 0 5.292-1.077 7.07-3.05l1.832 1.572C18.666 22.61 15.617 24 12.186 24z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
