/** Padvinden op het rooster (breedte-eerst, vier richtingen). Puur, dus testbaar zonder browser. */
import { begaanbaar, type Punt } from "./kaart.ts";

const RICHTINGEN = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];
const k = (p: Punt) => `${p.x},${p.y}`;

/**
 * Kortste pad van `van` naar een van de `doelen` (exclusief `van`, inclusief het doel).
 * Geeft null als geen doel bereikbaar is, en [] als je er al staat.
 */
export function zoekPad(van: Punt, doelen: Punt[], bezet: Punt[] = []): Punt[] | null {
  const doelSet = new Set(doelen.map(k));
  if (doelSet.has(k(van))) return [];
  const vorige = new Map<string, Punt | null>([[k(van), null]]);
  const rij: Punt[] = [van];
  while (rij.length) {
    const p = rij.shift()!;
    for (const r of RICHTINGEN) {
      const n = { x: p.x + r.x, y: p.y + r.y };
      if (vorige.has(k(n)) || !begaanbaar(n, bezet)) continue;
      vorige.set(k(n), p);
      if (doelSet.has(k(n))) {
        const pad: Punt[] = [];
        for (let q: Punt | null = n; q && k(q) !== k(van); q = vorige.get(k(q))!) pad.unshift(q);
        return pad;
      }
      rij.push(n);
    }
  }
  return null;
}

/** De begaanbare buurtegels van een plek (om naast een deur of buur te gaan staan). */
export function buren(p: Punt, bezet: Punt[] = []): Punt[] {
  return RICHTINGEN.map((r) => ({ x: p.x + r.x, y: p.y + r.y })).filter((n) => begaanbaar(n, bezet));
}
