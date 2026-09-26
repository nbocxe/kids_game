/** Automatisch opslaan in localStorage. Werkt het niet (privévenster), dan speelt het spel gewoon verder. */
import type { EindeId, Toestand } from "./verhaal/types.ts";
import type { Punt } from "./engine/kaart.ts";

const SLEUTEL = "kattenkwaad-v1";

export interface Opslag {
  spel: { toestand: Toestand; positie: Punt } | null;
  eindes: EindeId[];
  voorlezen: boolean;
}

const LEEG: Opslag = { spel: null, eindes: [], voorlezen: true };

export function laad(): Opslag {
  try {
    const ruw = localStorage.getItem(SLEUTEL);
    return ruw ? { ...LEEG, ...JSON.parse(ruw) } : { ...LEEG };
  } catch {
    return { ...LEEG };
  }
}

export function bewaar(wijziging: Partial<Opslag>): Opslag {
  const nieuw = { ...laad(), ...wijziging };
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(nieuw));
  } catch {
    // Geen opslag beschikbaar: niet erg.
  }
  return nieuw;
}
