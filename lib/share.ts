import { CALL_LABEL, type Call } from "./personas.ts";

export const PASS_URL = "https://f1-sepang.vercel.app";

export function buildCaption(opts: {
  callsign: string;
  scenarioName: string;
  iq: number;
  grade: string;
  call: Call;
}) {
  return `${opts.callsign} scored ${opts.iq} Strategy IQ (${opts.grade}) on ${opts.scenarioName} at Sepang. Called: ${CALL_LABEL[opts.call]}. Beat it on JomLap:`;
}

/* X and Threads both support a text+url compose intent but neither will take
   a pre-attached image over a plain link — that's a platform limit, not
   something to fake around. The caller downloads the pass alongside opening
   these so it is sitting in Downloads, ready to attach. */
export const xIntentUrl = (caption: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(PASS_URL)}`;

export const threadsIntentUrl = (caption: string) =>
  `https://www.threads.net/intent/post?text=${encodeURIComponent(`${caption} ${PASS_URL}`)}`;

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
