import { streamText } from "ai";
import { hasAI, radioModel } from "@/lib/ai.ts";
import { fallbackLine } from "@/lib/fallback.ts";
import { PERSONAS, CALL_LABEL, type Call } from "@/lib/personas.ts";
import { SCENARIOS, scenarioById } from "@/lib/scenarios.ts";

export const maxDuration = 30;

type Phase = "brief" | "verdict";

/** Callsign is the only free text a user can put in front of the model. */
function cleanCallsign(raw: unknown): string {
  if (typeof raw !== "string") return "Strategist";
  const stripped = raw.replace(/[\p{C}]/gu, " ").trim();
  return stripped.slice(0, 24) || "Strategist";
}

function streamOf(text: string) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Reject anything not in the known sets rather than passing it through.
  const persona = PERSONAS.find((p) => p.id === body.personaId);
  const scenarioExists = SCENARIOS.some((s) => s.id === body.scenarioId);
  const phase: Phase = body.phase === "verdict" ? "verdict" : "brief";

  if (!persona || !scenarioExists) {
    return new Response("Unknown persona or scenario", { status: 400 });
  }

  const scenario = scenarioById(body.scenarioId as string);
  const callsign = cleanCallsign(body.callsign);
  const chosen = typeof body.chosenCall === "string" ? (body.chosenCall as Call) : undefined;
  const seed = typeof body.seed === "number" ? Math.abs(Math.trunc(body.seed)) : 0;

  if (!hasAI) {
    return new Response(streamOf(fallbackLine(persona.id, scenario.id, phase, seed)), {
      headers: TEXT_HEADERS,
    });
  }

  const situation = [
    `Circuit: Sepang International Circuit, Malaysia.`,
    `Track temperature ${scenario.trackTempC}C, air ${scenario.airTempC}C, humidity ${scenario.humidityPct}%.`,
    `${scenario.lapsRemaining} laps remaining. Conditions: ${scenario.blurb}`,
    `Your strategist on the pit wall is called "${callsign}".`,
  ].join(" ");

  const task =
    phase === "brief"
      ? `Transmit ONE radio call arguing for your preferred strategy: ${CALL_LABEL[persona.advocates]}. Stay in character.`
      : `The strategist chose: ${chosen ? CALL_LABEL[chosen] : "unknown"}. Transmit ONE short radio reaction in character — gloat if you were right, cope if you were wrong.`;

  try {
    const result = streamText({
      model: radioModel(),
      system: persona.system,
      prompt: `${situation}\n\n${task}`,
      temperature: 0.9,
      maxOutputTokens: 90,
    });
    return result.toTextStreamResponse({ headers: TEXT_HEADERS });
  } catch {
    // Provider down or out of quota — the show goes on.
    return new Response(streamOf(fallbackLine(persona.id, scenario.id, phase, seed)), {
      headers: TEXT_HEADERS,
    });
  }
}
