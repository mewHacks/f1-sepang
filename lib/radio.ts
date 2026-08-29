import type { Call, Persona } from "./personas.ts";

export type RadioRequest = {
  personaId: Persona["id"];
  scenarioId: string;
  phase: "brief" | "verdict";
  callsign?: string;
  chosenCall?: Call;
  seed?: number;
};

/** Stream one radio transmission, handing back text as it arrives. */
export async function streamRadio(
  body: RadioRequest,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch("/api/radio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) throw new Error(`radio ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
