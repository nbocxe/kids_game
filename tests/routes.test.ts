/** Speeltester: de route-verkenner loopt alle keuzes af. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { verken } from "../src/verhaal/verkenner.ts";
import { verhaal } from "../src/verhaal/verhaal.ts";
import type { Voorwaarde } from "../src/verhaal/types.ts";

const v = verken(verhaal);

test("elk einde is bereikbaar", () => {
  for (const e of verhaal.eindes) assert.ok(v.eindes.has(e.id), `einde ${e.id} onbereikbaar`);
});

test("elk einde is voor elke held bereikbaar", () => {
  for (const held of ["pim", "moos", "tobber"] as const) {
    const w = verken(verhaal, [held]);
    assert.equal(w.eindes.size, verhaal.eindes.length, `${held} mist een einde`);
  }
});

test("geen doodlopende plekken", () => {
  assert.deepEqual(v.doodlopend, []);
});

test("elke scène is bereikbaar", () => {
  const ongebruikt = Object.keys(verhaal.scenes).filter((id) => !v.scenes.has(id));
  assert.deepEqual(ongebruikt, []);
});

test("scène-ids en verwijzingen kloppen", () => {
  const bestaat = (id: string) => id === "wereld" || id in verhaal.scenes;
  for (const [id, s] of Object.entries(verhaal.scenes)) {
    assert.equal(s.id, id);
    for (const k of s.keuzes ?? []) assert.ok(bestaat(k.naar), `${id} → ${k.naar}`);
    const naar = typeof s.naar === "string" ? [s.naar] : (s.naar ?? []).map((n) => n.naar);
    for (const n of naar) assert.ok(bestaat(n), `${id} → ${n}`);
    if (s.minispel) assert.ok(bestaat(s.minispel.gelukt) && bestaat(s.minispel.betrapt));
    const uitgangen = [s.keuzes, s.naar, s.minispel, s.einde].filter(Boolean).length;
    assert.equal(uitgangen, 1, `${id} moet precies één soort vervolg hebben`);
  }
  for (const i of verhaal.interacties) assert.ok(bestaat(i.scene), `interactie ${i.id}`);
});

test("elke gezette vlag wordt ergens gebruikt, en andersom", () => {
  const gezet = new Set<string>();
  const gebruikt = new Set<string>();
  const lees = (w?: Voorwaarde) => {
    if (!w) return;
    for (const f of [w.vlag, w.nietVlag].flat()) if (f) gebruikt.add(f);
    w.of?.forEach(lees);
  };
  const leesTekst = (t: unknown) => Array.isArray(t) && t.forEach((x) => lees(x.als));
  for (const s of Object.values(verhaal.scenes)) {
    s.effect?.zet?.forEach((f) => gezet.add(f));
    s.regels.forEach((r) => leesTekst(r.tekst));
    for (const k of s.keuzes ?? []) {
      k.effect?.zet?.forEach((f) => gezet.add(f));
      lees(k.als);
      leesTekst(k.tekst);
    }
    if (Array.isArray(s.naar)) s.naar.forEach((n) => lees(n.als));
  }
  for (const i of verhaal.interacties) lees(i.als);
  verhaal.missies.forEach((m) => lees(m.als));
  assert.deepEqual([...gezet].filter((f) => !gebruikt.has(f)), [], "gezet maar nooit gebruikt");
  assert.deepEqual([...gebruikt].filter((f) => !gezet.has(f)), [], "gebruikt maar nooit gezet");
});

test("meters blijven tussen 0 en 10", () => {
  for (const m of v.meters) {
    assert.ok(m.ondeugd >= 0 && m.ondeugd <= 10);
    assert.ok(m.hart >= 0 && m.hart <= 10);
  }
});
