/**
 * De Kriebelstraat als tekenrooster (1 teken = 1 tegel van 32×32).
 *   .  gras        ,  tegelpad     =  straat (woonerf, autovrij)
 *   T  boom        b  struik       o  bankje     w  fontein
 *   -  hek         |  hek (zij)    #  huis       D  voordeur    k  tuinkabouter
 * Later vervangen we dit door een Tiled-kaart; de namen van plekken blijven dan hetzelfde.
 */
export const TEGEL = 32;

export const KAART = [
  "TTTTTTTTTTTTTTTTTTTTTTTTTT",
  "T.........b,,,,,,,,b.....T",
  "T...T......,,,,,,,,......T",
  "T..........,,,ww,,,...b..T",
  "T..b.......,,,,,,,,......T",
  "T.........o,,,,,,,,o.....T",
  "==========================",
  "==========================",
  "==========================",
  "---,----|---,----|---,----",
  "...,..k.|b..,...b|...,....",
  "...,....|...,....|...,....",
  "###D####b###D####b###D####",
  "########b########b########",
  "########b########b########",
];

export const BREEDTE = KAART[0].length;
export const HOOGTE = KAART.length;

const BEGAANBAAR = new Set([".", ",", "="]);

export interface Punt {
  x: number;
  y: number;
}

/** Plekken waar het verhaal naar verwijst (zie `Interactie.plek`). */
export const PLEKKEN: Record<string, Punt> = {
  bel_toos: { x: 12, y: 12 },
  toos: { x: 14, y: 10 },
  brom: { x: 5, y: 11 },
  kabouter: { x: 6, y: 10 },
  slof: { x: 5, y: 3 },
};

export const START: Punt = { x: 21, y: 8 };

/** Huizen: linkerkolom, breedte, dakkleur en naam op het naambordje. */
export const HUIZEN = [
  { x: 0, breedte: 8, dak: 0x6b7fa8, naam: "Brom" },
  { x: 9, breedte: 8, dak: 0xe58fa8, naam: "Toos" },
  { x: 18, breedte: 8, dak: 0xf09a4a, naam: "Thuis" },
];

export function begaanbaar(p: Punt, bezet: Punt[] = []): boolean {
  const rij = KAART[p.y];
  if (!rij || p.x < 0 || p.x >= rij.length) return false;
  return BEGAANBAAR.has(rij[p.x]) && !bezet.some((b) => b.x === p.x && b.y === p.y);
}
