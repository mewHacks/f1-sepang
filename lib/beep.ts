/* Team-radio click. Synthesised rather than shipped as an audio file — no
   network request, no decode cost, ~200 bytes of code instead of a sprite.
   Audio is decoration: every failure path here is a silent no-op. */

let ctx: AudioContext | null = null;

export function radioBeep(muted: boolean) {
  if (muted || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    // Browsers suspend audio until a gesture; the flow always has a tap first.
    if (ctx.state === "suspended") void ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(1180, t);
    osc.frequency.setValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  } catch {
    /* no audio on this device — not worth telling anyone about */
  }
}
