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
    <svg viewBox="0 0 192 192" fill="currentColor" className="w-5 h-5">
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.2984 44.7431 97.0349 44.7431 96.7714 44.745C76.0645 44.745 60.6094 57.4042 54.4449 79.5292C48.7424 99.9928 53.6493 121.724 67.5794 136.002C80.3707 149.112 99.2891 154.218 119.553 149.805C136.331 146.149 149.278 134.425 155.834 117.842C157.069 114.717 155.531 111.161 152.406 109.926C149.281 108.691 145.725 110.229 144.49 113.354C139.224 126.674 128.825 136.091 115.347 139.028C98.4239 142.713 82.5939 138.441 71.8596 127.426C60.7779 116.056 56.8837 98.7188 61.4283 82.4116C66.3686 64.6853 78.7174 54.545 96.7714 54.545C96.9744 54.5431 97.1774 54.5431 97.3804 54.545C116.669 54.6677 127.994 66.8687 129.206 88.0837C118.895 87.0543 108.57 87.009 98.4069 87.9482C75.8778 90.0334 62.0157 102.57 63.8596 119.18C64.8315 127.939 70.0469 135.253 77.9409 139.467C85.7337 143.626 95.8344 144.494 105.772 141.854C118.847 138.382 128.536 128.749 133.076 114.683C136.568 103.864 137.996 92.0837 137.332 80.4907C138.744 80.9997 140.134 81.5471 141.498 82.1337C144.757 83.5358 148.558 82.0186 149.96 78.7599C151.362 75.5012 149.845 71.7001 146.586 70.298C139.813 67.3861 132.614 65.2505 125.132 63.9312C122.915 47.9622 113.626 36.6346 97.5619 36.5368C97.1694 36.5349 96.7769 36.5349 96.3844 36.5368C71.3096 36.5368 52.7937 51.7876 45.4194 78.2096C38.5638 102.77 44.4699 128.841 61.1643 145.975C76.4952 161.71 99.2081 167.838 123.518 162.541C143.729 158.136 159.278 144.053 167.143 124.161C168.497 120.732 166.815 116.829 163.386 115.475C159.957 114.121 156.054 115.803 154.7 119.232C148.118 135.882 135.097 147.678 118.17 151.364C97.7788 155.807 78.7303 150.668 65.867 137.47C51.9806 123.216 47.0706 101.533 52.7768 81.1077C58.8931 59.1764 74.2407 46.545 96.3844 46.545C96.6199 46.5431 96.8554 46.5431 97.0909 46.545C118.895 46.6853 131.789 60.1064 133.023 83.8292C128.948 83.3323 124.789 83.0818 120.575 83.0818C103.541 83.0818 86.8776 86.0825 72.8465 91.5645C63.4862 95.2223 55.4373 100.999 49.7714 108.138C44.0837 115.304 41.0837 123.473 41.0837 131.77C41.0837 147.683 52.8876 160.77 69.4184 163.268C83.5684 165.405 98.4116 162.77 111.455 155.975C124.57 149.141 133.864 138.455 137.886 125.688C138.744 122.96 139.388 120.125 139.818 117.206C140.669 117.581 141.509 117.973 142.337 118.379C145.474 119.916 149.278 118.632 150.815 115.495C152.352 112.358 151.068 108.554 147.931 107.017C146.037 106.089 144.098 105.21 142.119 104.381C141.979 98.6655 141.341 93.3989 140.219 88.6014C140.669 88.7299 141.109 88.8594 141.537 88.9883ZM122.616 112.599C119.347 122.753 112.378 129.688 102.973 132.186C95.9419 134.053 88.7778 133.435 83.1891 130.448C77.5255 127.42 73.7431 122.148 73.0483 115.892C71.7483 104.186 81.6034 94.6199 97.4334 93.1555C104.996 92.4555 112.724 92.5199 120.448 93.3444C120.732 99.8825 121.464 106.331 122.616 112.599Z" />
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
