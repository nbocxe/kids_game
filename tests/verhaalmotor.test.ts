import { test } from "node:test";
import assert from "node:assert/strict";
import { klopt, pasToe, tekstVan, nieuweToestand, beschikbareInteracties, startInteractie, verder, automatischeInteractie, minispelUitslag, kies, beschikbareKeuzes } from "../src/verhaal/verhaalmotor.ts";
import { verhaal } from "../src/verhaal/verhaal.ts";
import type { Toestand } from "../src/verhaal/types.ts";

const basis: Toestand = { held: "pim", ondeugd: 3, hart: 3, vlaggen: ["a"], scene: null };

test("voorwaarden", () => {
  assert.ok(klopt(undefined, basis));
  assert.ok(klopt({ vlag: "a", held: ["pim", "moos"], ondeugdMin: 3 }, basis));
  assert.ok(!klopt({ nietVlag: "a" }, basis));
  assert.ok(!klopt({ hartMin: 4 }, basis));
  assert.ok(klopt({ of: [{ vlag: "x" }, { held: "pim" }] }, basis));
  assert.ok(!klopt({ of: [{ vlag: "x" }, { held: "moos" }] }, basis));
});

test("effecten houden meters tussen 0 en 10", () => {
  const t = pasToe(basis, { ondeugd: 20, hart: -9, zet: ["b", "a"], wis: ["a"] });
  assert.equal(t.ondeugd, 10);
  assert.equal(t.hart, 0);
  assert.deepEqual(t.vlaggen, ["b", "a"]);
  assert.deepEqual(basis.vlaggen, ["a"], "origineel blijft ongewijzigd");
});

test("tekstvarianten kiezen de eerste passende", () => {
  const tekst = [{ als: { held: "moos" as const }, tekst: "kat" }, { tekst: "anders" }];
  assert.equal(tekstVan(tekst, basis), "anders");
  assert.equal(tekstVan(tekst, { ...basis, held: "moos" }), "kat");
});

test("een hele route: bel gelukt, slof terug, Stille Held", () => {
  let t = nieuweToestand(verhaal, "moos");
  assert.equal(t.scene, "intro");
  t = verder(verhaal, t);
  assert.equal(t.scene, null);
  const bel = beschikbareInteracties(verhaal, t).find((i) => i.id === "bel_toos")!;
  t = startInteractie(verhaal, t, bel);
  t = minispelUitslag(verhaal, t, true);
  assert.equal(t.ondeugd, 5);
  t = verder(verhaal, t);
  assert.ok(!beschikbareInteracties(verhaal, t).some((i) => i.id === "bel_toos"), "bel is eenmalig");
  const auto = automatischeInteractie(verhaal, t)!;
  assert.equal(auto.id, "slof_kwijt");
  t = verder(verhaal, startInteractie(verhaal, t, auto));
  assert.equal(automatischeInteractie(verhaal, t), null);
  t = startInteractie(verhaal, t, beschikbareInteracties(verhaal, t).find((i) => i.id === "slof")!);
  const terug = beschikbareKeuzes(verhaal, t).find((k) => k.naar === "gevolg_terug")!;
  t = verder(verhaal, verder(verhaal, kies(verhaal, t, terug)));
  assert.equal(t.scene, "einde_held");
});
