/**
 * Voorlopige tekeningen, getekend met code (fase 1). De tekenaar vervangt ze later door echte plaatjes
 * met dezelfde namen. Sprites worden op 2× getekend en op halve grootte getoond, zodat ze scherp blijven.
 */
import Phaser from "phaser";

export const LIJN = 0x3b2a4a; // donkerpaarse contour uit de stijlgids
const HUID = 0xf6c9a0;

type G = Phaser.GameObjects.Graphics;

function maak(scene: Phaser.Scene, naam: string, b: number, h: number, teken: (g: G) => void) {
  const g = scene.make.graphics({}, false);
  g.lineStyle(3, LIJN, 1);
  teken(g);
  g.generateTexture(naam, b, h);
  g.destroy();
}

const cirkel = (g: G, x: number, y: number, r: number, kleur: number) => {
  g.fillStyle(kleur).fillCircle(x, y, r);
  g.strokeCircle(x, y, r);
};
const ovaal = (g: G, x: number, y: number, b: number, h: number, kleur: number) => {
  g.fillStyle(kleur).fillEllipse(x, y, b, h);
  g.strokeEllipse(x, y, b, h);
};
const blok = (g: G, x: number, y: number, b: number, h: number, r: number, kleur: number) => {
  g.fillStyle(kleur).fillRoundedRect(x, y, b, h, r);
  g.strokeRoundedRect(x, y, b, h, r);
};
const driehoek = (g: G, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, kleur: number) => {
  g.fillStyle(kleur).fillTriangle(x1, y1, x2, y2, x3, y3);
  g.strokeTriangle(x1, y1, x2, y2, x3, y3);
};
const ogen = (g: G, y: number, afstand = 6, kleur = LIJN) => {
  g.fillStyle(kleur).fillCircle(32 - afstand, y, 2.8).fillCircle(32 + afstand, y, 2.8);
  g.fillStyle(0xffffff).fillCircle(32 - afstand + 1, y - 1, 1).fillCircle(32 + afstand + 1, y - 1, 1);
};
const lach = (g: G, y: number, breed = 6) => {
  g.lineStyle(2.5, LIJN).beginPath().arc(32, y, breed, 0.2, Math.PI - 0.2).strokePath();
  g.lineStyle(3, LIJN);
};

/** Alle helden en buren hebben hun hoofd op dezelfde plek (32, 30), zodat het maskertje overal past. */
export function tekenAlles(scene: Phaser.Scene) {
  // Pim: kind met een pet vol elastiekjes
  maak(scene, "pim", 64, 80, (g) => {
    blok(g, 24, 64, 7, 12, 3, 0x3d4f8f);
    blok(g, 33, 64, 7, 12, 3, 0x3d4f8f);
    blok(g, 18, 44, 28, 24, 10, 0xffc93c);
    cirkel(g, 32, 30, 16, HUID);
    ogen(g, 32);
    lach(g, 35);
    g.fillStyle(0xf4a0a0).fillCircle(21, 37, 3).fillCircle(43, 37, 3);
    g.fillStyle(0x3d7bd9).fillEllipse(32, 19, 36, 18);
    g.strokeEllipse(32, 19, 36, 18);
    blok(g, 14, 20, 36, 6, 3, 0x2f62b3);
    for (const [x, y, k] of [[24, 15, 0xff5d8f], [32, 12, 0x7ee081], [40, 15, 0xffe066]] as const)
      g.fillStyle(k).fillCircle(x, y, 3);
  });

  // Moos: rode kat met één witte sok
  maak(scene, "moos", 64, 80, (g) => {
    g.lineStyle(6, LIJN).beginPath().arc(50, 58, 12, -1.6, 0.8).strokePath();
    g.lineStyle(4, 0xf28c28).beginPath().arc(50, 58, 12, -1.6, 0.8).strokePath();
    g.lineStyle(3, LIJN);
    ovaal(g, 32, 58, 32, 30, 0xf28c28);
    ovaal(g, 24, 72, 10, 8, 0xffffff);
    ovaal(g, 40, 72, 10, 8, 0xf28c28);
    driehoek(g, 18, 26, 20, 8, 30, 18, 0xf28c28);
    driehoek(g, 46, 26, 44, 8, 34, 18, 0xf28c28);
    cirkel(g, 32, 30, 15, 0xf28c28);
    g.fillStyle(0xd96f14).fillRect(28, 16, 3, 7).fillRect(34, 16, 3, 7);
    ogen(g, 29, 6, 0x2f8f3a);
    g.fillStyle(0xff8fab).fillTriangle(29, 34, 35, 34, 32, 37);
    g.lineStyle(1.5, LIJN).lineBetween(14, 35, 24, 36).lineBetween(14, 39, 24, 38).lineBetween(40, 36, 50, 35).lineBetween(40, 38, 50, 39);
  });

  // Tobber: vrolijke, rommelige hond
  maak(scene, "tobber", 64, 80, (g) => {
    ovaal(g, 32, 58, 34, 30, 0xb07a4a);
    g.fillStyle(0xe8d2b0).fillEllipse(32, 62, 16, 16);
    ovaal(g, 24, 72, 10, 8, 0xb07a4a);
    ovaal(g, 40, 72, 10, 8, 0xb07a4a);
    cirkel(g, 32, 30, 16, 0xb07a4a);
    g.fillStyle(0xe8d2b0).fillEllipse(32, 37, 18, 12);
    ovaal(g, 15, 32, 10, 22, 0x6e4526);
    ovaal(g, 49, 32, 10, 22, 0x6e4526);
    g.fillStyle(0x6e4526).fillEllipse(38, 25, 10, 8);
    ogen(g, 29);
    g.fillStyle(LIJN).fillEllipse(32, 34, 8, 6);
    g.fillStyle(0xff7aa2).fillRoundedRect(29, 38, 6, 8, 3);
  });

  // Meneer Brom: mopperkont met een zacht hart
  maak(scene, "brom", 64, 80, (g) => {
    blok(g, 24, 64, 7, 12, 3, 0x4a4a4a);
    blok(g, 33, 64, 7, 12, 3, 0x4a4a4a);
    blok(g, 16, 44, 32, 24, 8, 0xf5f0e6);
    blok(g, 16, 44, 10, 24, 4, 0x7a5230);
    blok(g, 38, 44, 10, 24, 4, 0x7a5230);
    cirkel(g, 32, 30, 16, HUID);
    g.fillStyle(0xbfbfbf).fillEllipse(17, 26, 8, 14).fillEllipse(47, 26, 8, 14);
    ogen(g, 29);
    g.lineStyle(3, 0x8a8a8a).lineBetween(21, 22, 29, 25).lineBetween(43, 22, 35, 25);
    g.lineStyle(3, LIJN);
    g.fillStyle(0xd9d9d9).fillEllipse(32, 37, 22, 8);
    g.strokeEllipse(32, 37, 22, 8);
    g.fillStyle(0xe8a58a).fillCircle(32, 32, 3.5);
  });

  // Oma Toos: gevat, snel en ziet álles
  maak(scene, "toos", 64, 80, (g) => {
    driehoek(g, 32, 40, 12, 76, 52, 76, 0x9b59b6);
    g.fillStyle(0xffffff).fillCircle(32, 56, 2.5).fillCircle(32, 64, 2.5);
    cirkel(g, 32, 13, 8, 0xf2f2f2);
    cirkel(g, 32, 30, 16, HUID);
    g.fillStyle(0xf2f2f2).fillEllipse(32, 18, 30, 10);
    ogen(g, 30);
    g.lineStyle(2, LIJN).strokeCircle(26, 30, 5).strokeCircle(38, 30, 5).lineBetween(31, 30, 33, 30);
    lach(g, 35, 5);
    g.fillStyle(0xf4a0a0).fillCircle(20, 37, 3).fillCircle(44, 37, 3);
  });

  // Snoes: de kat van meneer Brom, lui in de zon
  maak(scene, "snoes", 64, 40, (g) => {
    ovaal(g, 30, 26, 40, 20, 0x9aa0a6);
    cirkel(g, 48, 20, 11, 0x9aa0a6);
    driehoek(g, 40, 14, 42, 4, 48, 11, 0x9aa0a6);
    driehoek(g, 56, 14, 55, 4, 49, 11, 0x9aa0a6);
    g.lineStyle(2, LIJN).lineBetween(42, 20, 46, 20).lineBetween(50, 20, 54, 20);
  });

  // Kabouter Kees
  maak(scene, "kabouter", 48, 64, (g) => {
    blok(g, 12, 38, 24, 22, 8, 0x3d7bd9);
    cirkel(g, 24, 32, 10, HUID);
    driehoek(g, 24, 2, 12, 26, 36, 26, 0xe63946);
    g.fillStyle(0xffffff).fillTriangle(15, 34, 33, 34, 24, 52);
    g.fillStyle(LIJN).fillCircle(20, 30, 1.8).fillCircle(28, 30, 1.8);
    g.fillStyle(0xf4a0a0).fillCircle(24, 34, 2.5);
  });

  // De slof van meneer Brom
  maak(scene, "slof", 56, 36, (g) => {
    ovaal(g, 26, 20, 44, 22, 0x4f8fd9);
    ovaal(g, 16, 20, 18, 14, 0x2f62b3);
    cirkel(g, 42, 12, 6, 0xffffff);
  });

  // Glinstering boven dingen waar je op kunt tikken
  maak(scene, "ster", 32, 32, (g) => {
    g.fillStyle(0xffe066);
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 15 : 5;
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      g.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r);
    }
    g.closePath().fillPath();
    g.lineStyle(2, 0xd4a017).strokePath();
  });

  // Boeven-maskertje (Ondeugd ≥ 5) en hartje (Buurthart ≥ 5)
  maak(scene, "masker", 64, 20, (g) => {
    g.fillStyle(LIJN).fillRoundedRect(12, 4, 40, 12, 6);
    g.fillStyle(0xffffff).fillCircle(26, 10, 3.5).fillCircle(38, 10, 3.5);
  });
  maak(scene, "hartje", 28, 26, (g) => {
    g.fillStyle(0xff4d7a).fillCircle(8, 9, 7).fillCircle(20, 9, 7).fillTriangle(1, 11, 27, 11, 14, 25);
  });

  // Doelcirkel waar je naartoe loopt
  maak(scene, "doel", 32, 32, (g) => {
    g.lineStyle(3, 0xffffff, 0.9).strokeCircle(16, 16, 12);
  });
}
