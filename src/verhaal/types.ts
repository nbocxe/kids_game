/** Alle bouwstenen van het verhaal. Het verhaal zelf is data (zie `verhaal.ts`), de motor voert het uit. */

export type HeldId = "pim" | "moos" | "tobber";

export type SprekerId = "verteller" | "held" | "toos" | "brom";

/** Alle velden moeten kloppen. Een lege voorwaarde klopt altijd. */
export interface Voorwaarde {
  vlag?: string | string[];
  nietVlag?: string | string[];
  held?: HeldId | HeldId[];
  ondeugdMin?: number;
  ondeugdMax?: number;
  hartMin?: number;
  hartMax?: number;
  /** Minstens één van deze voorwaarden moet kloppen. */
  of?: Voorwaarde[];
}

export interface Effect {
  ondeugd?: number;
  hart?: number;
  zet?: string[];
  wis?: string[];
}

/** Een vaste tekst, of varianten waarvan de eerste passende wordt gekozen. */
export type Tekst = string | { als?: Voorwaarde; tekst: string }[];

export interface Regel {
  spreker: SprekerId;
  tekst: Tekst;
}

export interface Keuze {
  tekst: Tekst;
  /** Emoji op de keuzekaart. */
  icoon?: string;
  naar: string;
  effect?: Effect;
  als?: Voorwaarde;
}

/** Waar het verhaal heen gaat na de laatste regel. "wereld" = terug naar de straat. */
export type Vervolg = string | { als?: Voorwaarde; naar: string }[];

export interface Scene {
  id: string;
  regels: Regel[];
  /** Wordt toegepast zodra de scène begint. */
  effect?: Effect;
  keuzes?: Keuze[];
  naar?: Vervolg;
  /** Een groot splitsmoment: de wereld staat stil, keuzes als kaarten. */
  splitsmoment?: boolean;
  minispel?: { spel: "belletje"; gelukt: string; betrapt: string };
  einde?: EindeId;
}

export type EindeId = "stille_held" | "betrapt_toos";

export interface Einde {
  id: EindeId;
  titel: string;
  icoon: string;
}

/** Iets in de straat waar je op kunt tikken. */
export interface Interactie {
  id: string;
  /** Naam van de plek op de kaart (zie `engine/kaart.ts`). */
  plek: string;
  scene: string;
  als?: Voorwaarde;
  /** Kan maar één keer; daarna wordt vlag `gedaan_<id>` gezet. */
  eenmalig?: boolean;
  /** Start vanzelf zodra je terug in de straat bent en de voorwaarde klopt. */
  automatisch?: boolean;
}

export interface Verhaal {
  start: string;
  scenes: Record<string, Scene>;
  interacties: Interactie[];
  eindes: Einde[];
  missies: { als?: Voorwaarde; tekst: string }[];
}

export interface Toestand {
  held: HeldId;
  ondeugd: number;
  hart: number;
  vlaggen: string[];
  /** Huidige scène, of null als je rondloopt in de straat. */
  scene: string | null;
}
