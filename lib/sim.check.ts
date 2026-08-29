/* Run: npm run check
   The one thing that must not silently break: each scenario has to reward the
   call it claims to, or the whole three-engineer premise collapses. */

import assert from "node:assert/strict";
import { SCENARIOS } from "./scenarios.ts";
import { resolve, wetnessTrace } from "./sim.ts";
import { CALL_LABEL, type Call } from "./personas.ts";

const CALLS: Call[] = ["BOX_INTERS", "STAY_OUT", "FULL_WET"];

for (const s of SCENARIOS) {
  const wet = wetnessTrace(s);

  assert.equal(wet.length, s.lapsRemaining, `${s.id}: wetness trace length`);
  assert.ok(
    wet.every((w) => w >= 0 && w <= 1),
    `${s.id}: wetness escaped 0..1`,
  );

  const results = CALLS.map((c) => resolve(s, c));

  // Every scenario must have exactly one winning call, and it must be the one
  // the scenario advertises — otherwise an engineer is being set up to lose.
  const best = results.filter((r) => r.wasOptimal);
  assert.equal(best.length, 1, `${s.id}: expected exactly one optimal call`);
  assert.equal(
    best[0].call,
    s.expectedBest,
    `${s.id}: tuned to reward ${CALL_LABEL[best[0].call]}, but claims ${CALL_LABEL[s.expectedBest]}`,
  );

  for (const r of results) {
    assert.ok(r.strategyIQ >= 40 && r.strategyIQ <= 100, `${s.id}/${r.call}: IQ out of range`);
    assert.equal(r.laps.length, s.lapsRemaining, `${s.id}/${r.call}: lap count`);
    assert.ok(
      r.laps.every((l) => Number.isFinite(l.lapTime) && l.lapTime > 0),
      `${s.id}/${r.call}: bad lap time`,
    );
    assert.ok(
      r.laps.every((l) => l.tyreLife >= 0 && l.tyreLife <= 1),
      `${s.id}/${r.call}: tyre life escaped 0..1`,
    );
  }

  // The right call must actually feel like a win, not a rounding error.
  const winner = results.find((r) => r.wasOptimal)!;
  const others = results.filter((r) => !r.wasOptimal);
  assert.ok(
    others.every((o) => o.strategyIQ < winner.strategyIQ),
    `${s.id}: optimal call did not score highest`,
  );
  assert.equal(winner.strategyIQ, 100, `${s.id}: optimal call should score 100`);

  console.log(
    `${s.id.padEnd(8)} best=${CALL_LABEL[winner.call].padEnd(18)} ` +
      `right=${winner.rightAllAlong.name.padEnd(13)} ` +
      `IQ=[${results.map((r) => r.strategyIQ).join(", ")}] ` +
      `peakWet=${Math.max(...wet).toFixed(2)}`,
  );
}

// Determinism: same input, same output. The share card depends on this.
const a = resolve(SCENARIOS[0], "BOX_INTERS");
const b = resolve(SCENARIOS[0], "BOX_INTERS");
assert.deepEqual(a, b, "resolve() is not deterministic");

// All three engineers get to be right somewhere, or one of them is decoration.
const winners = new Set(SCENARIOS.map((s) => resolve(s, s.expectedBest).rightAllAlong.id));
assert.equal(winners.size, 3, `each engineer needs a winning scenario, got: ${[...winners]}`);

console.log("\nok — sim checks passed");
