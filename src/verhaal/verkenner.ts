/**
 * Route-verkenner: speelt het verhaal op alle mogelijke manieren (in de wereld: elke interactie) en verzamelt
 * wat er bereikt wordt. Gebruikt door de speeltester-tests.
 */
import {
  automatischeInteractie,
  beschikbareInteracties,
  beschikbareKeuzes,
  huidigeScene,
  kies,
  minispelUitslag,
  nieuweToestand,
  startInteractie,
  verder,
} from "./verhaalmotor.ts";
import type { EindeId, HeldId, Toestand, Verhaal } from "./types.ts";

export interface Verkenning {
  eindes: Set<EindeId>;
  scenes: Set<string>;
  /** Toestanden waarin de speler niets meer kan. */
  doodlopend: Toestand[];
  toestanden: number;
  /** Per einde: de meterstanden waarmee het bereikt werd. */
  meters: { ondeugd: number; hart: number }[];
}

const sleutel = (t: Toestand) => JSON.stringify([t.scene, t.ondeugd, t.hart, [...t.vlaggen].sort()]);

export function verken(verhaal: Verhaal, helden: HeldId[] = ["pim", "moos", "tobber"]): Verkenning {
  const uit: Verkenning = { eindes: new Set(), scenes: new Set(), doodlopend: [], toestanden: 0, meters: [] };
  const gezien = new Set<string>();
  const rij: Toestand[] = helden.map((h) => nieuweToestand(verhaal, h));

  while (rij.length) {
    const t = rij.pop()!;
    const k = sleutel(t);
    if (gezien.has(k)) continue;
    gezien.add(k);
    uit.meters.push({ ondeugd: t.ondeugd, hart: t.hart });

    const scene = huidigeScene(verhaal, t);
    const volgenden: Toestand[] = [];
    if (!scene) {
      const auto = automatischeInteractie(verhaal, t);
      if (auto) volgenden.push(startInteractie(verhaal, t, auto));
      else for (const i of beschikbareInteracties(verhaal, t)) volgenden.push(startInteractie(verhaal, t, i));
    } else {
      uit.scenes.add(scene.id);
      if (scene.einde) {
        uit.eindes.add(scene.einde);
        continue;
      }
      if (scene.minispel) volgenden.push(minispelUitslag(verhaal, t, true), minispelUitslag(verhaal, t, false));
      else if (scene.keuzes) for (const keuze of beschikbareKeuzes(verhaal, t)) volgenden.push(kies(verhaal, t, keuze));
      else if (scene.naar) volgenden.push(verder(verhaal, t));
    }
    if (volgenden.length === 0) uit.doodlopend.push(t);
    rij.push(...volgenden);
  }
  uit.toestanden = gezien.size;
  return uit;
}
