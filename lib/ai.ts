import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/* ILMU is YTL AI Labs' Malaysian sovereign LLM. It matters here for a real
   reason and not just the story: Uncle Sepang and Din Turbo speak Manglish, and
   a model trained on local language produces it natively instead of doing an
   impression of it.

   Both ILMU and OpenRouter are OpenAI-compatible, so falling back is a base URL
   swap — ponytail: that ternary is the entire provider abstraction. */

const ILMU_KEY = process.env.ILMU_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

export const hasAI = Boolean(ILMU_KEY || OPENROUTER_KEY);

export function radioModel() {
  if (ILMU_KEY) {
    const ilmu = createOpenAICompatible({
      name: "ilmu",
      baseURL: "https://api.ilmu.ai/v1",
      apiKey: ILMU_KEY,
    });
    return ilmu(process.env.ILMU_MODEL ?? "nemo-super");
  }

  const openrouter = createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_KEY!,
  });
  return openrouter(process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite");
}
