# JomLap

A race-strategy game, prediction market, and post-race companion for Sepang International Circuit. Built for the KrackedDevs **Formula 1's Return to Sepang** hackathon.

**Live:** https://f1-sepang.vercel.app

## What it is

You're handed the pit wall radio. Three engineers each want you to make a different call — one trusts the data, one trusts 22 years of reading the sky, one just wants to send it. You pick, a lap simulation scores you, and you get a shareable result card. Along the way you earn achievements, predict what happens on race day, and get routed to supper past the traffic.

No F1 knowledge required — every screen explains itself in plain language before it uses any racing term.

## Features

**The strategy game — Pit Wall**
Pick one of three Sepang weather scenarios, each tuned so a different engineer is objectively right. All three argue live over radio (streamed from an LLM, with a scripted fallback if the API is down), then you choose. A deterministic lap simulation resolves the race into a 0–100 Strategy IQ score, a lap-delta chart, and a verdict from whoever called it correctly.

**Progression — Trophy Room**
12 achievements tied to real gameplay: winning specific scenarios, siding with a particular engineer and being right, a perfect 100, winning all three weathers. XP feeds five ranks (Rookie → Pit Wall Legend) and a leaderboard. Locked achievements state exactly how to earn them, so they read as goals rather than mysteries.

**Fan predictions — Fan Market**
Five Sepang-specific yes/no markets: rain before lap 30, safety car deployed, track over 50°C, winner makes 3+ stops, someone laps under 1:35. Odds shift with backing, and your payout multiplier locks at the moment you place — the same way a real market works, so you can't game your own late vote.

This is a prediction *game*, not gambling: stakes are fictional "Teh Points", nothing can be bought, sold, or cashed out, and the UI says so plainly.

**Your result card — Circuit Pass**
A 9:16 shareable card rendered client-side and exportable as a PNG. Pointer-driven 3D tilt, plus an optional holographic effect that is off by default so it never costs anything on a low-end phone. Shares to a phone's native share sheet, or one tap to X, Threads, or Instagram with a pre-written caption.

**After the race — Paddock Mamak**
A five-question swipe quiz on what you're in the mood for; every answer is tallied and the highest-scoring spot wins. Shows a live route map from your location to the match, and pulls real ratings and hours from Google Places when a key is configured, falling back to curated static info otherwise. No fabricated reviews or invented opening hours.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | |
| Styling | Tailwind CSS v4 + hand-written CSS design system | Titan One display face, red/black/yellow palette |
| AI | [ILMU](https://ilmu.ai) (YTL AI Labs' Malaysian LLM), OpenRouter as fallback | Two of the three personas speak Manglish — a locally trained model produces it natively instead of doing an impression |
| Maps | Google Places + Maps Embed (both optional) | Live ratings/hours and an embedded route map; degrades cleanly with no key |
| Image export | `html-to-image` | Loaded on demand, not in the main bundle |
| Audio | Web Audio API | Synthesised radio beep, no audio files to ship |
| Motion | CSS keyframes + IntersectionObserver | No animation library; transform/opacity only, so it stays smooth on low-end devices |

No backend and no database. Progress, predictions, and the leaderboard live in `localStorage` — deliberately, so there is no login wall between a judge and the demo.

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

Every one of these is optional — the app is fully playable with no keys at all.

| Variable | Notes |
|---|---|
| `ILMU_API_KEY` | `sk-...` from console.ilmu.ai. Without it the radio uses scripted lines and the game still plays end to end. |
| `ILMU_MODEL` | Defaults to `nemo-super`. |
| `OPENROUTER_API_KEY` | Fallback provider if ILMU is unavailable; both are OpenAI-compatible. |
| `GOOGLE_MAPS_API_KEY` | Server-side only. Enables live ratings and hours in Paddock Mamak. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Exposed to the browser (it is an iframe src). Enables the embedded route map. Restrict it by HTTP referrer and enable only the Maps Embed API. |

Never commit these — `.env*` is gitignored.

### Scripts

```bash
npm run check   # asserts each scenario rewards the engineer it claims to
npm run lint
npm run build
```

## Project structure

```
app/
  api/radio/route.ts      ILMU-backed radio endpoint, with scripted fallback
  api/places/route.ts     Google Places proxy, optional
  page.tsx                Single-route view switcher (7 views)
components/               One file per screen or shared UI piece
lib/
  personas.ts             The three engineers: voice, colour, which call they push
  scenarios.ts            The three weather scenarios and their tuning
  sim.ts + sim.check.ts   Deterministic lap engine + its self-check
  progress.ts             Achievements, XP, ranks, leaderboard
  predictions.ts          Prediction markets, odds, and fictional-currency wallet
  mamak.ts                Escape routes and food spots
  ai.ts / fallback.ts     LLM provider + offline scripted lines
public/portraits/         Engineer portraits (WebP, optimised)
```

## Notes on scope

Some things are deliberately simple, for demo reliability on a tight deadline:

- The lap "simulation" is tuned arithmetic, not a physics engine — fast, deterministic, and covered by `npm run check`, which fails loudly if the scenario tuning ever stops rewarding the engineer it advertises.
- The radio banter is flavour text. Your Strategy IQ never depends on what the LLM says, so a slow or failed API call cannot break the game.
- Paddock Mamak links to a Google Maps *search* rather than a single pinned business — a pinned restaurant can close or change hours; a search query can't go stale.
- The leaderboard is per-device and seeded with clearly fictional pace-setters, so a first-time player has something to climb toward. Making it global would mean accounts, and accounts would mean a login wall.

## License

MIT
