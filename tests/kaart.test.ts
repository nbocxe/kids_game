import { test } from "node:test";
import assert from "node:assert/strict";
import { KAART, BREEDTE, PLEKKEN, START, begaanbaar } from "../src/engine/kaart.ts";
import { zoekPad, buren } from "../src/engine/pad.ts";
import { verhaal } from "../src/verhaal/verhaal.ts";

const npcs = [PLEKKEN.brom, PLEKKEN.toos];

test("alle rijen zijn even breed", () => {
  for (const [i, rij] of KAART.entries()) assert.equal(rij.length, BREEDTE, `rij ${i}`);
});

test("startplek is begaanbaar", () => assert.ok(begaanbaar(START)));

test("elke plek uit het verhaal bestaat en is bereikbaar vanaf de start", () => {
  for (const i of verhaal.interacties) {
    const plek = PLEKKEN[i.plek];
    assert.ok(plek, `plek ${i.plek} ontbreekt`);
    const doelen = begaanbaar(plek, npcs) ? [plek] : buren(plek, npcs);
    assert.ok(zoekPad(START, doelen, npcs), `${i.plek} onbereikbaar`);
  }
});

test("pad loopt niet door muren", () => {
  const pad = zoekPad({ x: 1, y: 1 }, [{ x: 24, y: 11 }])!;
  assert.ok(pad.length > 0);
  for (const p of pad) assert.ok(begaanbaar(p));
  assert.equal(zoekPad({ x: 1, y: 1 }, [{ x: 3, y: 13 }]), null, "binnen in een huis kan niet");
});
