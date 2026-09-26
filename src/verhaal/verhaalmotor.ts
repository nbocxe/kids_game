/**
 * De verhaalmotor: pure functies zonder Phaser of DOM, zodat alles met `node --test` te testen is.
 * Een toestand wordt nooit aangepast; elke stap geeft een nieuwe toestand terug.
 */
import type { Effect, HeldId, Interactie, Keuze, Scene, Tekst, Toestand, Verhaal, Vervolg, Voorwaarde } from "./types.ts";

export const METER_START = 3;
export const METER_MAX = 10;

const lijst = <T>(x: T | T[] | undefined): T[] => (x === undefined ? [] : Array.isArray(x) ? x : [x]);
const klem = (n: number) => Math.max(0, Math.min(METER_MAX, n));

export function klopt(v: Voorwaarde | undefined, t: Toestand): boolean {
  if (!v) return true;
  if (!lijst(v.vlag).every((f) => t.vlaggen.includes(f))) return false;
  if (lijst(v.nietVlag).some((f) => t.vlaggen.includes(f))) return false;
  const helden = lijst(v.held);
  if (helden.length && !helden.includes(t.held)) return false;
  if (v.ondeugdMin !== undefined && t.ondeugd < v.ondeugdMin) return false;
  if (v.ondeugdMax !== undefined && t.ondeugd > v.ondeugdMax) return false;
  if (v.hartMin !== undefined && t.hart < v.hartMin) return false;
  if (v.hartMax !== undefined && t.hart > v.hartMax) return false;
  if (v.of && !v.of.some((w) => klopt(w, t))) return false;
  return true;
}

export function pasToe(t: Toestand, e: Effect | undefined): Toestand {
  if (!e) return t;
  const weg = new Set(e.wis ?? []);
  const vlaggen = t.vlaggen.filter((f) => !weg.has(f));
  for (const f of e.zet ?? []) if (!vlaggen.includes(f)) vlaggen.push(f);
  return { ...t, ondeugd: klem(t.ondeugd + (e.ondeugd ?? 0)), hart: klem(t.hart + (e.hart ?? 0)), vlaggen };
}

/** Kiest de eerste passende variant. Geen passende variant geeft een lege tekst (de regel wordt overgeslagen). */
export function tekstVan(tekst: Tekst, t: Toestand): string {
  if (typeof tekst === "string") return tekst;
  return tekst.find((v) => klopt(v.als, t))?.tekst ?? "";
}

export function nieuweToestand(verhaal: Verhaal, held: HeldId): Toestand {
  return naarScene(verhaal, { held, ondeugd: METER_START, hart: METER_START, vlaggen: [], scene: null }, verhaal.start);
}

function naarScene(verhaal: Verhaal, t: Toestand, id: string): Toestand {
  if (id === "wereld") return { ...t, scene: null };
  const scene = verhaal.scenes[id];
  if (!scene) throw new Error(`Onbekende scène: ${id}`);
  return pasToe({ ...t, scene: id }, scene.effect);
}

export function huidigeScene(verhaal: Verhaal, t: Toestand): Scene | null {
  return t.scene ? verhaal.scenes[t.scene] : null;
}

/** De regels van de huidige scène zoals de speler ze ziet (lege varianten weggelaten). */
export function regelsVan(verhaal: Verhaal, t: Toestand) {
  const scene = huidigeScene(verhaal, t);
  if (!scene) return [];
  return scene.regels
    .map((r) => ({ spreker: r.spreker, tekst: tekstVan(r.tekst, t) }))
    .filter((r) => r.tekst !== "");
}

export function beschikbareKeuzes(verhaal: Verhaal, t: Toestand): Keuze[] {
  return (huidigeScene(verhaal, t)?.keuzes ?? []).filter((k) => klopt(k.als, t));
}

export function kies(verhaal: Verhaal, t: Toestand, keuze: Keuze): Toestand {
  return naarScene(verhaal, pasToe(t, keuze.effect), keuze.naar);
}

export function volgende(vervolg: Vervolg, t: Toestand): string {
  if (typeof vervolg === "string") return vervolg;
  const doel = vervolg.find((v) => klopt(v.als, t));
  if (!doel) throw new Error("Geen passend vervolg");
  return doel.naar;
}

/** Voor scènes zonder keuzes: ga door naar het vervolg. */
export function verder(verhaal: Verhaal, t: Toestand): Toestand {
  const scene = huidigeScene(verhaal, t);
  if (!scene?.naar) throw new Error(`Scène ${t.scene} heeft geen vervolg`);
  return naarScene(verhaal, t, volgende(scene.naar, t));
}

export function minispelUitslag(verhaal: Verhaal, t: Toestand, gelukt: boolean): Toestand {
  const spel = huidigeScene(verhaal, t)?.minispel;
  if (!spel) throw new Error(`Scène ${t.scene} heeft geen minispel`);
  return naarScene(verhaal, t, gelukt ? spel.gelukt : spel.betrapt);
}

const gedaan = (i: Interactie) => `gedaan_${i.id}`;

export function beschikbareInteracties(verhaal: Verhaal, t: Toestand): Interactie[] {
  return verhaal.interacties.filter(
    (i) => !i.automatisch && klopt(i.als, t) && !(i.eenmalig && t.vlaggen.includes(gedaan(i))),
  );
}

export function automatischeInteractie(verhaal: Verhaal, t: Toestand): Interactie | null {
  return (
    verhaal.interacties.find((i) => i.automatisch && klopt(i.als, t) && !t.vlaggen.includes(gedaan(i))) ?? null
  );
}

export function startInteractie(verhaal: Verhaal, t: Toestand, i: Interactie): Toestand {
  const na = i.eenmalig || i.automatisch ? pasToe(t, { zet: [gedaan(i)] }) : t;
  return naarScene(verhaal, na, i.scene);
}

export function missieVan(verhaal: Verhaal, t: Toestand): string {
  return verhaal.missies.find((m) => klopt(m.als, t))?.tekst ?? "";
}
