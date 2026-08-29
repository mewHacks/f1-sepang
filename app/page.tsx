"use client";

import { useState } from "react";
import { Header } from "@/components/Chrome.tsx";
import { Menu } from "@/components/Menu.tsx";
import { Landing } from "@/components/Landing.tsx";
import { PitWall } from "@/components/PitWall.tsx";
import { Debrief } from "@/components/Debrief.tsx";
import { SharePass } from "@/components/SharePass.tsx";
import { Mamak } from "@/components/Mamak.tsx";
import { Predictions } from "@/components/Predictions.tsx";
import { Trophies } from "@/components/Trophies.tsx";
import { recordRace } from "@/lib/progress.ts";
import { resolve, type RaceResult } from "@/lib/sim.ts";
import { scenarioById } from "@/lib/scenarios.ts";
import type { Call } from "@/lib/personas.ts";
import type { View } from "@/lib/views.ts";

/* One route, five views. The race is a single continuous act, so routing it
   would mean serialising a result into the URL for no user-visible gain; the
   menu gives the three features their own entry points instead.
   ponytail: add real routes when someone needs to deep-link a result. */

type Run = { callsign: string; scenarioId: string; result: RaceResult };

export default function Page() {
  const [view, setView] = useState<View>("landing");
  const [setup, setSetup] = useState<{ callsign: string; scenarioId: string } | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header
        onHome={() => setView("landing")}
        onOpenMenu={() => setMenuOpen(true)}
        currentView={view}
        onNavigate={setView}
        hasRun={run !== null}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />

      <Menu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={setView}
        hasRun={run !== null}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />

      <main className="shell flex-1">
        {view === "landing" && (
          <Landing
            onStart={(callsign, scenarioId) => {
              setSetup({ callsign, scenarioId });
              setView("pitwall");
            }}
          />
        )}

        {view === "pitwall" && setup && (
          <PitWall
            callsign={setup.callsign}
            scenarioId={setup.scenarioId}
            muted={muted}
            onDecide={(call: Call) => {
              const result = resolve(scenarioById(setup.scenarioId), call);
              setRun({ ...setup, result });
              // Award achievements the moment the race resolves, so the
              // debrief and trophy room agree without extra plumbing.
              recordRace({
                scenarioId: setup.scenarioId,
                strategyIQ: result.strategyIQ,
                wasOptimal: result.wasOptimal,
                advocateId: result.rightAllAlong.id,
                call,
              });
              setView("debrief");
            }}
          />
        )}

        {view === "debrief" && run && (
          <Debrief
            result={run.result}
            scenarioId={run.scenarioId}
            callsign={run.callsign}
            muted={muted}
            onPass={() => setView("pass")}
            onMamak={() => setView("mamak")}
          />
        )}

        {view === "pass" && run && (
          <SharePass
            result={run.result}
            scenarioId={run.scenarioId}
            callsign={run.callsign}
          />
        )}

        {view === "mamak" && <Mamak onRestart={() => setView("landing")} />}

        {view === "predict" && <Predictions muted={muted} />}

        {view === "trophies" && (
          <Trophies callsign={run?.callsign ?? setup?.callsign ?? "YOU"} />
        )}

        {/* A view that needs a race you have not run yet. */}
        {((view === "pitwall" && !setup) ||
          ((view === "debrief" || view === "pass") && !run)) && (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-muted">Run a race first.</p>
            <button
              onClick={() => setView("landing")}
              className="display mt-4 rounded-xl bg-red px-6 py-3 text-base leading-none"
            >
              To the pit wall
            </button>
          </div>
        )}
      </main>
    </>
  );
}
