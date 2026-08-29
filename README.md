# JomLap

Sepang Thermal Pit Wall — call the strategy, survive the monsoon, escape the traffic.

Built for the KrackedDevs **Formula 1's Return to Sepang** hackathon.

## What it does

You are the strategist on the pit wall at Sepang. Track temp is 50°C, humidity is
90%, and the 4pm monsoon is building over Turn 11. Three race engineers argue in
your ear — each pushing a different call:

| Engineer | Vibe | Argues for |
| --- | --- | --- |
| **Aero-9** | Brackley data model. Clipped, panicky, speaks in percentages. | Box for inters |
| **Uncle Sepang** | Veteran marshal. Manglish, reads clouds and asphalt by feel. | Stay out on hards |
| **Din Turbo** | Gen Z rempit energy, TikTok-brained, allergic to caution. | Full wet gambit |

You make the call. The lap engine resolves it, scores your Strategy IQ, and hands
you a shareable pass — then routes you off the ELITE highway to the nearest mamak.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4
- ILMU (YTL AI Labs, Malaysian sovereign LLM) via the OpenAI-compatible endpoint,
  through the Vercel AI SDK — with OpenRouter as a one-line fallback
- CSS keyframes for motion (no animation library — keeps low-spec Android smooth)
- `html-to-image` for the 9:16 share card
- Deterministic lap simulation in plain TypeScript — no physics engine, no backend

## Local dev

```bash
npm install
cp .env.example .env.local   # add your ILMU key
npm run dev
```

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `ILMU_API_KEY` | yes | `sk-...` from console.ilmu.ai |
| `ILMU_MODEL` | no | defaults to the model set in `lib/ai.ts` |
| `OPENROUTER_API_KEY` | no | fallback provider if ILMU is unavailable |

Never commit these. `.env*` is gitignored.
