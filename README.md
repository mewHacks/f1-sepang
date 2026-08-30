# JomLap

**Call the strategy from Sepang's pit wall — three engineers, one monsoon, zero chill.**

![JomLap home screen](./public/home.png)

---

## Executive Summary

JomLap is a race-strategy game, fan prediction market, and post-race companion built for the **Formula 1's Return to Sepang** hackathon. You step onto the pit wall of Sepang International Circuit as the strategist: three racing engineers each argue for a different call, you pick one, a deterministic lap simulation scores your decision, and you walk away with a shareable result card. Around that core loop sit an achievement/trophy room, a fictional-currency prediction market, and a post-race "Paddock Mamak" escape-routing feature that gets you fed and off the highway after the race. The whole experience is playable with zero F1 knowledge — every screen explains itself in plain language before it uses a racing term — and needs no login, no backend, and no API keys to run end to end.

## The Problem

Formula 1 is a walled garden. Its strategy language — undercuts, inters, tyre delta, safety-car windows — is jargon that locks out casual fans, especially the Malaysian audience Sepang's return is meant to excite. Existing fan apps are either hardcore telemetry dashboards or real-money betting platforms. None of them answer the simple, delightful question a first-timer actually has at a race weekend:

> _"If it were my call, what should I do — and how good was it?"_

On top of that, 90,000 people leave Sepang into the same ELITE-highway jam, with no lightweight tool that routes them to somewhere open and worth eating at while dodging the traffic.

## The Solution

JomLap turns race strategy into a pick-up-and-play game. Each feature is its own piece, built to stand alone and combine into one loop.

### 1. The Pit Wall — call the race

Three engineers argue live over the radio and each want a different tire call:
- **AERO-9** — a nervous strategy computer that only trusts the numbers
- **Uncle Sepang** — a 22-year veteran marshal who reads the sky
- **Din Turbo** — an unsupervised junior who wants full wets *now*

You pick one. A deterministic lap engine resolves the three hand-tuned weather scenarios into a 0–100 **Strategy IQ**, a lap-delta chart, and a verdict from whoever called it. Each scenario is tuned so a different engineer is objectively right.

### 2. The Circuit Pass — share your result

A 9:16 result card with your Strategy IQ, rank, and callsign. It renders client-side, exports as a PNG, and tilts with your pointer (optional holographic shader, off by default). Share to the native share sheet or one tap to X / Threads / Instagram.

### 3. The Paddock Mamak — escape the jam and eat

A five-question swipe quiz matches you to a supper spot that routes *away* from the Sepang exit bottlenecks. Live Google ratings and hours when a key is set, curated static info otherwise.

### 4. The Trophy Room — keep coming back

12 achievements, XP, five ranks, and a per-device leaderboard.

### 5. The Fan Market — predict the race, no real money

Five Sepang-specific yes/no prediction markets played with fictional **Teh Points** — a game, not gambling.

### The radio voice

Banter is streamed from a Malaysian LLM (ILMU, with an OpenRouter fallback and a scripted offline fallback), so two of the three personas speak native Manglish. Your Strategy IQ never depends on the model's output, so a slow or failed API call can never break the game.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Single-route app, zero backend needed |
| Styling | Tailwind CSS v4 + hand-written CSS design system | Titan One display face, red/black/yellow Malaysian-GP palette |
| AI / radio | [ILMU](https://ilmu.ai) (YTL AI Labs' Malaysian sovereign LLM) via the Vercel `ai` SDK; OpenRouter as fallback | Locally trained model speaks Manglish natively; both OpenAI-compatible so fallback is a base-URL swap |
| Maps | Google Places (New) + Maps Directions, both optional | Live ratings/hours and route links; cleanly degraded when no key is present |
| Image export | `html-to-image` (lazy-loaded only on the share screen) | Keeps the library out of the main bundle |
| Audio | Web Audio API | Synthesised radio beep, no audio files shipped |
| Motion | CSS keyframes + IntersectionObserver | No animation library; transform/opacity only, smooth on low-end phones |

**No backend, no database, no login.** Progress, predictions, and the leaderboard live in `localStorage` — deliberately, so a judge can open the demo with no account wall. The only server code is two optional API routes.

## Project Structure

```
app/
  layout.tsx              Root layout, fonts (Titan One + Geist), metadata
  page.tsx               Single-route view switcher across 7 views
  globals.css            Design tokens + hand-written component styles
  api/
    radio/route.ts       ILMU/OpenRouter radio streaming, scripted fallback
    places/route.ts      Google Places proxy (optional, server-side key)
components/
  Chrome.tsx             Header, Menu, shared UI (Avatar, Title, Stat, Flag…)
  Landing.tsx            Home / hero, "what's in here", roster, callsign entry
  PitWall.tsx            Scenario brief + 3-engineer radio + call picker
  Debrief.tsx            Score reveal, lap chart, engineer verdict
  LapChart.tsx           Lap-delta SVG chart
  SharePass.tsx          Tiltable, exportable 9:16 result card
  ShareRow.tsx           Native-share + social caption buttons
  Mamak.tsx              Swipe quiz + browse-all escape routes
  RouteMap.tsx           Static route-map renderer
  Predictions.tsx        Teh-Points prediction markets
  Trophies.tsx           Achievements album, ranks, leaderboard
lib/
  personas.ts            3 engineers: voice, colour, call they push
  scenarios.ts           3 weather scenarios + tuning + evaporation model
  sim.ts + sim.check.ts  Deterministic lap engine + self-check
  progress.ts            Achievements, XP, ranks, leaderboard
  predictions.ts         Markets, odds, fictional-currency wallet
  mamak.ts               Escape routes & food spots
  sepangPlaces.ts        Scraped real spots dataset
  ai.ts / fallback.ts    LLM provider + offline scripted lines
  radio.ts / beep.ts     Client radio streamer + Web Audio beep
  share.ts / views.ts    Caption builder + view enum
public/
  portraits/             Engineer portraits (WebP)
  hero-car.webp          Landing hero art
  stamps/                Achievement sticker art (WebP, optional)
```

## User Flows

The seven views in `app/page.tsx` are a single continuous race act plus three always-available features. Rendered with Mermaid (GitHub and most Markdown renderers display this natively; if your viewer doesn't, paste the block into [mermaid.live](https://mermaid.live)).

```mermaid
flowchart TD
    subgraph RACE["Race loop · one continuous act"]
        direction TB
        L["Landing · enter callsign"] -->|Start the race| PW["Pit Wall · 3-engineer radio"]
        PW -->|pick a call| DB["Debrief · Strategy IQ · lap chart · verdict"]
        DB -->|Circuit pass| SP["Circuit Pass · export / share 9:16 card"]
        DB -->|Now eat| MK["Paddock Mamak · escape-route match"]
        SP -->|Home| L
        MK -->|Back to the pit wall| L
    end

    FM["Fan Market · 5 Teh-Points YES/NO markets"]
    TR["Trophy Room · achievements · XP · ranks · leaderboard"]

    L -->|"menu"| FM
    L -->|"menu"| TR
    L -->|"menu"| MK

    DB -.->|"recordRace() · +XP & achievements"| TR
    FM -.->|"recordPrediction() · un-locks"| TR
```

**Progression:** every resolved race calls `recordRace()`, which awards achievements, adds XP, and updates the per-device leaderboard immediately — so the Trophy Room always agrees with the Debrief without extra plumbing. Placing a Fan Market bet calls `recordPrediction()` and can unlock achievements too.

**Fan Market:** pick a stake (25 / 50 / 100 Teh Points) and back YES/NO on any of the five Sepang markets. Odds shift with the crowd, and your payout multiplier locks at the moment you place. Played with fictional currency — nothing can be bought, sold, or cashed out, and the UI says so.

**Paddock Mamak:** a five-question swipe quiz tallies your answers and routes you to the winning hideaway — away from the Sepang exit bottlenecks — then offers an optional live Google Places card and a route map from the user's GPS, or a "browse all" directory with category filters and search.

**Demo accessibility:** with no keys set, the radio uses scripted lines and Mamak uses curated static places, so every flow plays end to end with zero configuration. Setting `ILMU_API_KEY` / `OPENROUTER_API_KEY` adds live LLM banter; `GOOGLE_MAPS_API_KEY` adds live ratings, hours, and routes.
