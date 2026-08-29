# JomLap

A race-strategy game and post-race companion for Sepang International Circuit. Built for the KrackedDevs **Formula 1's Return to Sepang** hackathon.

**Live:** https://f1-sepang.vercel.app

## What it is

You're handed the pit wall radio. Three engineers each want you to make a different call — one trusts the data, one trusts 22 years of reading the sky, one just wants to send it. You pick, a lap simulation scores you, and you get a shareable result card. Afterwards, an escape-route guide helps you dodge the post-race traffic and find supper.

No F1 knowledge required — every screen explains itself in plain language before it uses any racing term.

## Features

**The strategy game (Pit Wall)**
Pick one of three Sepang weather scenarios — each is tuned so a different engineer is objectively right. Listen to all three argue live over radio (streamed from an LLM, with a scripted fallback if the API is down), then choose a strategy. A deterministic lap simulation (no physics engine, just tuned math) resolves the race and gives you a 0–100 Strategy IQ score.

**Your result card (Circuit Pass)**
A 9:16 shareable card with your score, rendered client-side and exportable as a PNG. Has a pointer-driven 3D tilt and an optional holographic effect (off by default, so it never costs anything on a low-end phone). Shares straight to a phone's native share sheet, or one tap to X, Threads, or Instagram with a pre-written caption.

**After the race (Paddock Mamak)**
A short swipe quiz on what you're in the mood for, matched against curated escape routes and food spots around the circuit. Pulls live ratings and hours from Google Places if an API key is configured — otherwise falls back to static, still-useful info. No fabricated reviews or invented opening hours.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | |
| Styling | Tailwind CSS v4 + hand-written CSS for the design system | |
| AI | [ILMU](https://ilmu.ai) (YTL AI Labs' Malaysian LLM), OpenRouter as fallback | Two of the three engineer personas speak Manglish — a model trained on local language produces it natively instead of doing an impression |
| Maps | Google Places API (optional) | Live ratings/hours when configured; degrades cleanly without a key |
| Image export | `html-to-image` | Loaded on demand, not in the main bundle |
| Audio | Web Audio API | Synthesised radio beep, no audio files to ship |

No backend, no database — state lives in the browser for the length of a session.

## Getting started

```bash
git clone https://github.com/mewHacks/f1-sepang.git
cd f1-sepang
npm install
cp .env.example .env.local   # add your ILMU key
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `ILMU_API_KEY` | Recommended | `sk-...` from console.ilmu.ai. Without it, the radio falls back to scripted lines — the app still works fully. |
| `ILMU_MODEL` | No | Defaults to `nemo-super`. |
| `OPENROUTER_API_KEY` | No | Fallback if ILMU is unavailable; both are OpenAI-compatible. |
| `GOOGLE_MAPS_API_KEY` | No | Enables live ratings/hours in Paddock Mamak. Without it, curated static info is used instead. |

Never commit these — `.env*` is gitignored.

### Other scripts

```bash
npm run check   # runs lib/sim.check.ts — asserts each scenario rewards the engineer it claims to
npm run lint
npm run build
```

## Project structure

```
app/
  api/radio/route.ts     ILMU-backed radio endpoint, with scripted fallback
  api/places/route.ts     Google Places proxy, optional
  page.tsx                Single-route view switcher (landing/pitwall/debrief/pass/mamak)
components/               One file per screen or shared UI piece
lib/
  personas.ts             The three engineers: voice, colour, which call they push
  scenarios.ts            The three weather scenarios and their tuning
  sim.ts + sim.check.ts   Deterministic lap engine + its self-check
  mamak.ts                Escape routes and food spots
  ai.ts / fallback.ts     LLM provider + offline scripted lines
public/portraits/         Engineer portraits (WebP, optimised)
```

## Notes on scope

A few things were deliberately kept simple for demo reliability on a tight deadline:

- The lap "simulation" is tuned arithmetic, not a physics engine — it's fast, deterministic, and testable.
- The radio banter is decorative flavour text; your Strategy IQ score never depends on what the LLM says, so a slow or failed API call can't break the game.
- Paddock Mamak links to a Google Maps *search* rather than a single pinned business — a pinned restaurant can close or change hours; a search query can't go stale.

## License

MIT
