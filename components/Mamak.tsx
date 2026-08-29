"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { ESCAPES, type Escape, type VibeCategory } from "@/lib/mamak.ts";
import { Title } from "./Chrome.tsx";
import { RouteMap } from "./RouteMap.tsx";

type LivePlace = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  isOpen?: boolean;
  googleMapsUri: string;
  routeUrl: string;
};

// 5 Simple, User-Intuitive Preference Questions (Rule-Based)
type VibeQuestion = {
  id: string;
  targetId: string;
  icon: string;
  question: string;
  subtext: string;
  tag: string;
};

const VIBE_QUESTIONS: VibeQuestion[] = [
  {
    id: "q_mamak",
    targetId: "dengkil",
    icon: "☕",
    question: "Craving hot teh tarik & crispy roti canai on plastic chairs?",
    subtext: "Classic late-night mamak feast with friends to debate the race strategy.",
    tag: "24-Hour Mamak & Teh Tarik",
  },
  {
    id: "q_cafe",
    targetId: "cyberjaya",
    icon: "❄️",
    question: "Need freezing cold air-con, specialty iced coffee & chill vibes?",
    subtext: "Cool down immediately, escape the humidity, and relax in aesthetic cafes.",
    tag: "Cold AC & Specialty Cafes",
  },
  {
    id: "q_seafood",
    targetId: "bagan",
    icon: "🦐",
    question: "Want fresh grilled Ikan Bakar & ocean breeze by the beach?",
    subtext: "Drive opposite to all KL highway traffic and feast on seafood by the coast.",
    tag: "Coastal Seafood & Beach",
  },
  {
    id: "q_fast",
    targetId: "mitsui",
    icon: "🛍️",
    question: "Super hungry right now? Need food & cold AC within 6 minutes?",
    subtext: "Quick sanctuary closest to circuit gates with plenty of food court choices.",
    tag: "Instant 6-Min Pitstop",
  },
  {
    id: "q_south",
    targetId: "nilai",
    icon: "🍛",
    question: "Heading South (JB / Melaka / Seremban) and want midnight Nasi Kandar?",
    subtext: "Skip the northern toll queues entirely and grab crispy fried chicken & naan.",
    tag: "Southbound Midnight Feast",
  },
];

const CATEGORIES: { id: VibeCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Spots", icon: "🏁" },
  { id: "mamak", label: "24h Mamak", icon: "☕" },
  { id: "seafood", label: "Beach Seafood", icon: "🦐" },
  { id: "cafe", label: "AC & Coffee", icon: "❄️" },
  { id: "pitstop", label: "Fast Pitstop", icon: "🛍️" },
  { id: "south", label: "Southbound", icon: "🍛" },
];

export function Mamak({ onRestart }: { onRestart: () => void }) {
  // Starts directly in Quiz mode without showing tabs upfront
  const [view, setView] = useState<"quiz" | "browse">("quiz");
  const [hasExploredBrowse, setHasExploredBrowse] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<VibeCategory>("all");
  const [livePlaces, setLivePlaces] = useState<Record<string, LivePlace[]>>({});

  // Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // Question Deck State
  const [qIndex, setQIndex] = useState(0);
  const [matchedEscape, setMatchedEscape] = useState<Escape | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  // 3-Second Calculating Telemetry State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcStepText, setCalcStepText] = useState("🛰️ ACQUIRING GPS & TRAFFIC DELTAS...");

  // Drag state for swipe card
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Request browser location
  const requestLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLocationStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("granted");
        },
        () => {
          setLocationStatus("denied");
        },
        { timeout: 8000, enableHighAccuracy: false },
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Fetch Live Places in background
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const results: Record<string, LivePlace[]> = {};
        await Promise.all(
          ESCAPES.map(async (e) => {
            try {
              const res = await fetch(`/api/places?corridor=${e.id}`);
              const data = await res.json();
              if (data.live && data.places?.length > 0) {
                results[e.id] = data.places;
              }
            } catch {
              // ignore
            }
          }),
        );
        if (active) {
          setLivePlaces(results);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 3-second calculation animation sequence
  const triggerMatchCalculation = (targetEscape: Escape) => {
    setIsCalculating(true);
    setCalcProgress(0);

    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setCalcProgress(progress);

      if (elapsed < 850) {
        setCalcStepText("🛰️ LOCKING GPS COORDS & SEPANG GATE CONGESTION...");
      } else if (elapsed < 1800) {
        setCalcStepText("⚡ CALCULATING HIGHWAY DELTAS & BYPASS ROUTES...");
      } else if (elapsed < 2650) {
        setCalcStepText("🍛 VERIFYING OPEN MAMAKS & SUPPER AVAILABILITY...");
      } else {
        setCalcStepText("✓ ROUTE LOCKED · PRESENTING HIDEAWAY");
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          setIsCalculating(false);
          setMatchedEscape(targetEscape);
        }, 150);
      }
    }, 50);
  };

  const handleSwipe = (dir: "left" | "right") => {
    setSwipeDirection(dir);
    const currentQ = VIBE_QUESTIONS[qIndex];
    const target = ESCAPES.find((e) => e.id === currentQ.targetId) || ESCAPES[0];

    setTimeout(() => {
      if (dir === "right") {
        triggerMatchCalculation(target);
      } else {
        if (qIndex < VIBE_QUESTIONS.length - 1) {
          setQIndex((prev) => prev + 1);
        } else {
          // Reached end without matching: switch to full browse view
          switchToBrowse();
        }
      }
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 240);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCalculating) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.x > 80) {
      handleSwipe("right");
    } else if (dragOffset.x < -80) {
      handleSwipe("left");
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const resetQuiz = () => {
    setMatchedEscape(null);
    setQIndex(0);
    setSwipeDirection(null);
    setDragOffset({ x: 0, y: 0 });
    setIsCalculating(false);
    setView("quiz");
  };

  const switchToBrowse = () => {
    setHasExploredBrowse(true);
    setView("browse");
    setIsCalculating(false);
  };

  // Nav routing URL helper
  const getNavUrl = (destination: string, fallbackUrl: string, placeId?: string) => {
    if (placeId) {
      if (userLocation) {
        return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination_place_id=${placeId}`;
      }
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        "Sepang International Circuit",
      )}&destination_place_id=${placeId}`;
    }
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(
        destination,
      )}`;
    }
    return fallbackUrl;
  };

  // Filtered & Searched Escapes for Browse Mode
  const displayedEscapes = useMemo(() => {
    return ESCAPES.filter((e) => {
      const matchesCategory = filter === "all" || e.category === filter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        e.name.toLowerCase().includes(query) ||
        e.tagline.toLowerCase().includes(query) ||
        e.food.dish.toLowerCase().includes(query) ||
        e.via.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [filter, searchQuery]);

  const currentQ = VIBE_QUESTIONS[qIndex];

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-5 lg:pb-8">
      {/* Header Section */}
      <div className="relative overflow-hidden pt-3">
        <span
          aria-hidden
          className="title ghost bleed absolute -top-2 left-0 text-[24vw] leading-[0.8] lg:text-[8rem]"
        >
          MAKAN
        </span>
        <div className="relative pt-[7vw] lg:pt-12">
          <Title hit="MAMAK" tone="yellow" size="text-[13vw] leading-[0.84] lg:text-6xl">
            Paddock
          </Title>
        </div>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted">
          90,000 people stuck on the ELITE highway. Answer a few simple questions to find your post-race hideaway.
        </p>

        {/* Location Status Indicator */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[10px] uppercase tracking-wider text-muted transition-transform active:scale-95"
          >
            {locationStatus === "granted" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green" />
                <span className="text-green font-medium">GPS: Live Location</span>
              </>
            ) : locationStatus === "requesting" ? (
              <>
                <span className="anim-blink h-2 w-2 rounded-full bg-yellow" />
                <span className="text-yellow">Acquiring GPS...</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-muted/60" />
                <span>📍 Tap for Live GPS Origin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subtabs only visible AFTER user has chosen to explore the browse directory */}
      {hasExploredBrowse && (
        <div className="flex rounded-xl border border-line bg-surface p-1">
          <button
            onClick={() => {
              setView("quiz");
              setIsCalculating(false);
            }}
            className={`flex-1 rounded-lg py-2.5 text-center text-xs uppercase tracking-wider transition-all ${
              view === "quiz"
                ? "bg-red text-white font-medium shadow-md"
                : "text-muted hover:text-white"
            }`}
          >
            ⚡ Vibe Questions
          </button>
          <button
            onClick={() => {
              setView("browse");
              setIsCalculating(false);
            }}
            className={`flex-1 rounded-lg py-2.5 text-center text-xs uppercase tracking-wider transition-all ${
              view === "browse"
                ? "bg-red text-white font-medium shadow-md"
                : "text-muted hover:text-white"
            }`}
          >
            📋 Browse All ({ESCAPES.length})
          </button>
        </div>
      )}

      {/* VIEW 1: SIMPLE USER-INTUITIVE QUESTIONS */}
      {view === "quiz" && (
        <div className="flex flex-col items-center">
          {/* 3-SECOND CALCULATING TELEMETRY OVERLAY */}
          {isCalculating ? (
            <div className="anim-pop card relative w-full max-w-sm overflow-hidden p-6 border-red/40 bg-surface/95 text-center shadow-2xl">
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-red/40 animate-[spin_6s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-yellow/30 animate-[spin_3s_linear_infinite_reverse]" />
                <div className="anim-blink h-12 w-12 rounded-full bg-red/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>

              <div className="title mt-5 text-2xl tracking-wide text-white">
                CALCULATING HIDEAWAY
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-line">
                <div
                  className="h-full bg-gradient-to-r from-yellow to-red transition-all duration-75"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-muted data">
                <span>{calcProgress}% PROCESSED</span>
                <span>TRAFFIC DELTA ENGINE</span>
              </div>

              <div className="data mt-3 min-h-[32px] rounded-lg bg-surface-2 p-2 text-center text-[10px] uppercase tracking-wider text-yellow">
                {calcStepText}
              </div>
            </div>
          ) : matchedEscape ? (
            /* MATCHED RESULT VIEW */
            <div className="anim-pop card relative w-full max-w-md overflow-hidden p-5 border-yellow/40 bg-surface">
              <div className="flex items-center justify-between">
                <span className="data text-xs uppercase tracking-widest text-yellow font-medium">
                  ★ Ideal Hideaway Matched
                </span>
                <span className="data text-xs text-muted">
                  {matchedEscape.driveTime} ({matchedEscape.distance})
                </span>
              </div>

              {/* One picture per card, not two: the emoji is gone, the
                  engineer's portrait below is the only image here. */}
              <div className="mt-3">
                <h3 className="title text-2xl leading-none text-white">
                  {matchedEscape.name}
                </h3>
                <div className="data mt-1 text-[11px] text-yellow">
                  {matchedEscape.tagline}
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted">
                {matchedEscape.note}
              </p>

              {/* Engineer Endorsement */}
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={matchedEscape.engineerTip.avatar}
                  alt={matchedEscape.engineerTip.author}
                  className="h-10 w-10 rounded-lg object-cover border border-line"
                />
                <div className="flex-1">
                  <div className="data text-[9px] uppercase tracking-wider text-muted">
                    {matchedEscape.engineerTip.author}&apos;s Post-Race Tip
                  </div>
                  <div className="mt-1 text-xs italic text-fg/90">
                    &ldquo;{matchedEscape.engineerTip.text}&rdquo;
                  </div>
                </div>
              </div>

              {/* Live Place Card */}
              {livePlaces[matchedEscape.id]?.[0] && (
                <div className="mt-3.5 rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex items-center justify-between">
                    <div className="data text-[9px] uppercase tracking-wider text-green flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green" />
                      Live Google Maps Place
                    </div>
                    {livePlaces[matchedEscape.id][0].rating && (
                      <div className="data text-xs text-yellow">
                        ★ {livePlaces[matchedEscape.id][0].rating} ({livePlaces[matchedEscape.id][0].userRatingCount})
                      </div>
                    )}
                  </div>
                  <div className="display mt-1 text-sm text-yellow">
                    {livePlaces[matchedEscape.id][0].name}
                  </div>
                  <div className="data mt-0.5 text-[11px] text-muted truncate">
                    {livePlaces[matchedEscape.id][0].address}
                  </div>
                </div>
              )}

              <RouteMap
                userLocation={userLocation}
                destination={
                  livePlaces[matchedEscape.id]?.[0]?.name ?? matchedEscape.food.name
                }
              />

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={resetQuiz}
                  className="data rounded-xl border border-line py-3.5 text-center text-xs uppercase tracking-wider transition-all hover:bg-white/5 active:scale-95"
                >
                  🔄 Retake Questions
                </button>
                <a
                  href={getNavUrl(
                    matchedEscape.name,
                    matchedEscape.routeUrl,
                    livePlaces[matchedEscape.id]?.[0]?.id,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="data rounded-xl bg-yellow py-3.5 text-center text-xs uppercase tracking-wider text-black font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 hover:bg-yellow/90"
                >
                  <span>Route on Maps</span>
                  <span>↗</span>
                </a>
              </div>

              <button
                onClick={switchToBrowse}
                className="data mt-3 w-full text-center text-[11px] uppercase tracking-wider text-muted hover:text-white"
              >
                Or browse all {ESCAPES.length} hideaways →
              </button>
            </div>
          ) : (
            /* SIMPLE INTUITIVE QUESTION CARD */
            <div className="relative w-full max-w-sm">
              <div className="data mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted">
                <span>Preference {qIndex + 1} of {VIBE_QUESTIONS.length}</span>
                <span className="text-yellow">{currentQ.tag}</span>
              </div>

              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="card relative flex flex-col overflow-hidden select-none cursor-grab active:cursor-grabbing transition-transform"
                style={{
                  transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${
                    dragOffset.x * 0.06
                  }deg) ${
                    swipeDirection === "left"
                      ? "translateX(-120%)"
                      : swipeDirection === "right"
                      ? "translateX(120%)"
                      : ""
                  }`,
                  transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {/* Visual Drag Overlays */}
                {dragOffset.x > 35 && (
                  <div className="absolute top-4 right-4 z-20 rounded-lg border-2 border-green bg-green/20 px-3 py-1 text-sm font-bold uppercase text-green shadow-lg">
                    YES! ✓
                  </div>
                )}
                {dragOffset.x < -35 && (
                  <div className="absolute top-4 left-4 z-20 rounded-lg border-2 border-red bg-red/20 px-3 py-1 text-sm font-bold uppercase text-red shadow-lg">
                    PASS ✕
                  </div>
                )}

                {/* Card Top Banner */}
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-2/80">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentQ.icon}</span>
                    <span className="data text-xs uppercase tracking-wider text-muted">
                      {currentQ.tag}
                    </span>
                  </div>
                  <span className="data text-xs text-muted">
                    {qIndex + 1}/{VIBE_QUESTIONS.length}
                  </span>
                </div>

                {/* Question Body */}
                <div className="p-6 flex flex-col flex-1 items-center text-center justify-center min-h-[220px]">
                  <div className="text-4xl mb-3">{currentQ.icon}</div>
                  <h3 className="title title-loose text-2xl sm:text-3xl text-white max-w-xs">
                    &ldquo;{currentQ.question}&rdquo;
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted max-w-xs">
                    {currentQ.subtext}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 border-t border-line p-3.5 bg-surface-2/50">
                  <button
                    onClick={() => handleSwipe("left")}
                    className="data rounded-xl border border-line py-3.5 text-center text-xs uppercase tracking-wider text-muted transition-transform active:scale-95 hover:bg-white/5"
                  >
                    ✕ Not Feeling It
                  </button>
                  <button
                    onClick={() => handleSwipe("right")}
                    className="data rounded-xl bg-yellow py-3.5 text-center text-xs uppercase tracking-wider text-black font-semibold transition-transform active:scale-95 hover:bg-yellow/90"
                  >
                    ★ YES, That&apos;s Me!
                  </button>
                </div>
              </div>

              {/* Choose Myself Bypass Link */}
              <div className="mt-4 text-center">
                <button
                  onClick={switchToBrowse}
                  className="data text-xs uppercase tracking-wider text-muted hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Or choose myself instead (Browse all spots) →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BROWSE ALL & MANUAL FILTER/SEARCH */}
      {view === "browse" && (
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spots, food (e.g. roti, seafood, coffee)..."
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/50 focus:border-yellow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`data shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-wider transition-all ${
                  filter === cat.id
                    ? "bg-yellow text-black font-medium"
                    : "border border-line bg-surface text-muted hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2">
            {displayedEscapes.length === 0 ? (
              <div className="card p-8 text-center col-span-2">
                <p className="text-sm text-muted">No spots matching &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                  }}
                  className="data mt-3 text-xs uppercase tracking-wider text-yellow"
                >
                  Clear search & filters
                </button>
              </div>
            ) : (
              displayedEscapes.map((e, i) => {
                const liveSpot = livePlaces[e.id]?.[0];
                return (
                  <article
                    key={e.id}
                    style={{ "--i": i } as React.CSSProperties}
                    className="anim-rise card flex flex-col overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-line px-4 py-2.5 bg-surface-2/50">
                      <span className="data text-[10px] uppercase tracking-wider text-muted">
                        Skips {e.skips}
                      </span>
                      <div className="flex items-center gap-2">
                        {liveSpot && (
                          <span className="data flex items-center gap-1 rounded bg-green/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-green">
                            <span className="h-1.5 w-1.5 rounded-full bg-green" />
                            Live Maps
                          </span>
                        )}
                        <span className="data text-[10px] text-yellow font-medium">
                          {e.driveTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="title text-2xl leading-none">{e.name}</h3>
                          <div className="data mt-1 text-[11px] text-yellow">
                            {e.tagline}
                          </div>
                        </div>
                      </div>

                      <p className="mt-2.5 text-[13px] leading-snug text-muted">{e.note}</p>

                      {/* Supper recommendation */}
                      <div className="mt-3.5 flex-1 rounded-xl border border-line bg-surface-2 p-3">
                        <div className="flex items-center justify-between">
                          <div className="data text-[9px] uppercase tracking-wider text-muted">
                            Supper stop recommendation
                          </div>
                          {liveSpot?.rating && (
                            <div className="data text-xs text-yellow font-medium">
                              ★ {liveSpot.rating} <span className="text-muted text-[9px]">({liveSpot.userRatingCount || 0})</span>
                            </div>
                          )}
                        </div>
                        <div className="display mt-1 text-sm text-yellow">
                          {liveSpot ? liveSpot.name : e.food.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted truncate">
                          {liveSpot ? liveSpot.address : e.food.dish}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <a
                          href={getNavUrl(e.name, e.routeUrl, liveSpot?.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="data rounded-lg border border-line py-2.5 text-center text-[10px] uppercase tracking-wider transition-transform active:scale-95 hover:border-fg/40 flex items-center justify-center gap-1"
                        >
                          <span>Route ({e.driveTime})</span>
                          <span aria-hidden>↗</span>
                        </a>
                        <a
                          href={liveSpot ? liveSpot.googleMapsUri : e.food.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="data rounded-lg bg-yellow py-2.5 text-center text-[10px] uppercase tracking-wider text-black font-semibold transition-transform active:scale-95 hover:bg-yellow/90 flex items-center justify-center gap-1"
                        >
                          <span>Navigate</span>
                          <span aria-hidden>↗</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="text-center mt-2">
            <button
              onClick={() => {
                setView("quiz");
                resetQuiz();
              }}
              className="data text-xs uppercase tracking-wider text-yellow hover:underline"
            >
              ⚡ Back to Vibe Questions
            </button>
          </div>
        </div>
      )}

      <p className="data text-[10px] leading-relaxed text-muted">
        {userLocation
          ? "Routes dynamically calculated from your live GPS location to avoid Sepang exit bottlenecks."
          : "Routes start from Sepang International Circuit gates with turn-by-turn Google Maps navigation."}
      </p>

      <div className="actionbar lg:mt-2">
        <div className="shell lg:px-0">
          <button
            onClick={onRestart}
            className="display w-full rounded-xl bg-red py-4 text-xl leading-none transition-transform active:scale-[0.98]"
          >
            Back to the pit wall
          </button>
        </div>
      </div>
    </div>
  );
}
