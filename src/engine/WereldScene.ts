/** De straat: tekenen, rondlopen (tik-om-te-lopen) en tikken op dingen. Het verhaal zit in de verhaalmotor. */
import Phaser from "phaser";
import { BREEDTE, HOOGTE, HUIZEN, KAART, PLEKKEN, TEGEL, begaanbaar, type Punt } from "./kaart.ts";
import { buren, zoekPad } from "./pad.ts";
import { LIJN, tekenAlles } from "./tekeningen.ts";
import type { HeldId, Interactie, Toestand } from "../verhaal/types.ts";

export interface WereldKoppeling {
  /** Waar je nu op kunt tikken. */
  interacties(): Interactie[];
  /** De held staat bij een interactie. */
  aangekomen(i: Interactie): void;
  bewogen(p: Punt): void;
}

export interface WereldData {
  held: HeldId;
  positie: Punt;
  koppeling: WereldKoppeling;
}

const SNOES: Punt = { x: 1, y: 11 };
const midden = (p: Punt) => ({ x: p.x * TEGEL + TEGEL / 2, y: p.y * TEGEL + TEGEL / 2 });
const voeten = (p: Punt) => ({ x: p.x * TEGEL + TEGEL / 2, y: p.y * TEGEL + TEGEL - 3 });
const gelijk = (a: Punt, b: Punt) => a.x === b.x && a.y === b.y;

export class WereldScene extends Phaser.Scene {
  /** Alleen als er geen dialoog open staat mag je lopen. */
  actief = false;
  private data0!: WereldData;
  private positie!: Punt;
  private held!: Phaser.GameObjects.Image;
  private masker!: Phaser.GameObjects.Image;
  private hartje!: Phaser.GameObjects.Image;
  private kabouter!: Phaser.GameObjects.Image;
  private slof!: Phaser.GameObjects.Image;
  private doel!: Phaser.GameObjects.Image;
  private sterren: Phaser.GameObjects.Image[] = [];
  private pad: Punt[] = [];
  private lopend = false;
  private naAankomst: Interactie | null = null;
  private bezet: Punt[] = [PLEKKEN.brom, PLEKKEN.toos, SNOES];

  constructor() {
    super("wereld");
  }

  init(data: WereldData) {
    this.data0 = data;
    this.positie = { ...data.positie };
    this.pad = [];
    this.lopend = false;
    this.naAankomst = null;
    this.sterren = [];
  }

  create() {
    if (!this.textures.exists("pim")) tekenAlles(this);
    this.tekenStraat();

    const persoon = (sleutel: string, p: Punt, plek?: string) => {
      const v = voeten(p);
      const s = this.add.image(v.x, v.y, sleutel).setOrigin(0.5, 0.95).setScale(0.5).setDepth(v.y);
      if (plek) s.setData("plek", plek).setInteractive();
      return s;
    };
    persoon("brom", PLEKKEN.brom, "brom");
    persoon("toos", PLEKKEN.toos, "toos");
    persoon("snoes", SNOES);
    this.kabouter = persoon("kabouter", PLEKKEN.kabouter, "kabouter");
    const s = midden(PLEKKEN.slof);
    this.slof = this.add.image(s.x, s.y + 6, "slof").setScale(0.5).setDepth(s.y).setVisible(false);

    this.held = persoon(this.data0.held, this.positie);
    this.masker = this.add.image(0, 0, "masker").setScale(0.5).setVisible(false);
    this.hartje = this.add.image(0, 0, "hartje").setScale(0.6).setVisible(false);
    this.tweens.add({ targets: this.hartje, scale: 0.75, yoyo: true, repeat: -1, duration: 500 });
    this.doel = this.add.image(0, 0, "doel").setVisible(false).setDepth(1);
    this.volgHeld();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, BREEDTE * TEGEL, HOOGTE * TEGEL);
    cam.setBackgroundColor(0x5fa04e);
    cam.startFollow(this.held, true, 0.15, 0.15);
    this.pasZoomAan();
    this.scale.on("resize", this.pasZoomAan, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.pasZoomAan, this));

    this.input.on("pointerup", (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      const plek = over.map((o) => o.getData("plek") as string | undefined).find(Boolean);
      const tegel = { x: Math.floor(p.worldX / TEGEL), y: Math.floor(p.worldY / TEGEL) };
      // Ook een tik óp de deur, kabouter of slof zelf telt, niet alleen op de glinstering.
      const opTegel = this.data0.koppeling.interacties().find((i) => gelijk(PLEKKEN[i.plek], tegel))?.plek;
      if (plek ?? opTegel) this.tikOpPlek((plek ?? opTegel)!);
      else this.tikOpTegel(tegel);
    });
  }

  private pasZoomAan() {
    const { width, height } = this.scale;
    // Ongeveer 14 × 10 tegels in beeld, groot genoeg voor kleine vingers.
    const zoom = Phaser.Math.Clamp(Math.min(width / (14 * TEGEL), height / (10 * TEGEL)), 1, 3);
    // Nooit verder uitzoomen dan de straat groot is (anders zie je lege randen, bv. op een staande telefoon).
    this.cameras.main.setZoom(Math.max(zoom, width / (BREEDTE * TEGEL), height / (HOOGTE * TEGEL)));
  }

  /** Werk de wereld bij na een verandering in het verhaal. */
  ververs(t: Toestand) {
    this.kabouter.setAngle(t.vlaggen.includes("streek_kabouter") ? 180 : 0);
    this.kabouter.setOrigin(0.5, t.vlaggen.includes("streek_kabouter") ? 0.2 : 0.95);
    this.masker.setVisible(t.ondeugd >= 5);
    this.hartje.setVisible(t.hart >= 5);

    for (const s of this.sterren) s.destroy();
    this.sterren = [];
    const beschikbaar = this.data0.koppeling.interacties();
    this.slof.setVisible(beschikbaar.some((i) => i.plek === "slof"));
    for (const i of beschikbaar) {
      const m = midden(PLEKKEN[i.plek]);
      const hoog = i.plek === "brom" || i.plek === "toos" ? 48 : 26;
      const ster = this.add
        .image(m.x, m.y - hoog, "ster")
        .setScale(0.6)
        .setDepth(2000)
        .setData("plek", i.plek)
        .setInteractive();
      this.tweens.add({ targets: ster, y: m.y - hoog - 6, angle: 20, yoyo: true, repeat: -1, duration: 700 });
      this.sterren.push(ster);
    }
  }

  tikOpPlek(plek: string) {
    if (!this.actief) return;
    const i = this.data0.koppeling.interacties().find((x) => x.plek === plek);
    const p = PLEKKEN[plek];
    if (!i || !p) return this.tikOpTegel(p ?? this.positie);
    const doelen = begaanbaar(p, this.bezet) ? [p] : buren(p, this.bezet);
    const pad = zoekPad(this.positie, doelen, this.bezet);
    if (!pad) return;
    this.doel.setVisible(false);
    this.loop(pad, i);
  }

  private tikOpTegel(t: Punt) {
    if (!this.actief) return;
    const pad = zoekPad(this.positie, [t], this.bezet);
    if (!pad || pad.length === 0) return;
    const m = midden(t);
    this.doel.setPosition(m.x, m.y).setVisible(true).setAlpha(1);
    this.loop(pad, null);
  }

  private loop(pad: Punt[], na: Interactie | null) {
    this.pad = pad;
    this.naAankomst = na;
    if (!this.lopend) this.stap();
  }

  private stap() {
    const volgende = this.pad.shift();
    if (!volgende) {
      this.lopend = false;
      this.doel.setVisible(false);
      this.held.setScale(0.5);
      const i = this.naAankomst;
      this.naAankomst = null;
      if (i && this.actief) {
        const p = PLEKKEN[i.plek];
        if (p.x !== this.positie.x) this.held.setFlipX(p.x < this.positie.x);
        this.data0.koppeling.aangekomen(i);
      }
      return;
    }
    this.lopend = true;
    if (volgende.x !== this.positie.x) this.held.setFlipX(volgende.x < this.positie.x);
    const v = voeten(volgende);
    this.tweens.add({
      targets: this.held,
      x: v.x,
      y: v.y,
      duration: 150,
      onUpdate: () => this.volgHeld(),
      onComplete: () => {
        this.positie = volgende;
        this.data0.koppeling.bewogen(volgende);
        this.stap();
      },
    });
    this.tweens.add({ targets: this.held, scaleY: 0.46, yoyo: true, duration: 75 });
  }

  private volgHeld() {
    const { x, y } = this.held;
    this.held.setDepth(y);
    // Het hoofd staat 23 px boven de voeten (zie tekeningen.ts).
    this.masker.setPosition(x, y - 23).setDepth(y + 1);
    this.hartje.setPosition(x + 12, y - 44).setDepth(y + 2);
  }

  /** Voor tests: waar staat een plek op het scherm? */
  schermPositie(plek: string): Punt {
    const cam = this.cameras.main;
    const m = midden(PLEKKEN[plek]);
    return { x: (m.x - cam.worldView.x) * cam.zoom, y: (m.y - cam.worldView.y) * cam.zoom };
  }

  heldPositie(): Punt {
    return { ...this.positie };
  }

  // ── Tekenen ───────────────────────────────────────────────
  private tekenStraat() {
    const g = this.add.graphics().setDepth(0);
    const boven = this.add.graphics().setDepth(5000);
    const ruis = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) % 7;

    for (let y = 0; y < HOOGTE; y++) {
      for (let x = 0; x < BREEDTE; x++) {
        const c = KAART[y][x];
        const px = x * TEGEL;
        const py = y * TEGEL;
        if (c === "," || c === "w") {
          g.fillStyle(0xf1dfb8).fillRect(px, py, TEGEL, TEGEL);
          g.lineStyle(1, 0xdcc49a).strokeRect(px + 0.5, py + 0.5, TEGEL - 1, TEGEL - 1);
        } else if (c === "=") {
          g.fillStyle(0xe2b3a6).fillRect(px, py, TEGEL, TEGEL);
          g.lineStyle(1, 0xc99486);
          for (let r = 0; r < 4; r++) {
            g.lineBetween(px, py + r * 8, px + TEGEL, py + r * 8);
            const o = (r + y * 4) % 2 ? 0 : 8;
            g.lineBetween(px + o, py + r * 8, px + o, py + r * 8 + 8).lineBetween(px + o + 16, py + r * 8, px + o + 16, py + r * 8 + 8);
          }
        } else if (c !== "#" && c !== "D") {
          g.fillStyle(0x8fd16a).fillRect(px, py, TEGEL, TEGEL);
          if (ruis(x, y) < 3) {
            g.fillStyle(0x76b955);
            g.fillTriangle(px + 8, py + 20, px + 10, py + 12, px + 12, py + 20);
            g.fillTriangle(px + 20, py + 26, px + 22, py + 18, px + 24, py + 26);
          }
          if (ruis(x, y) === 5 && c === ".") g.fillStyle(0xffffff).fillCircle(px + 22, py + 9, 2.5).fillStyle(0xffd23f).fillCircle(px + 22, py + 9, 1.2);
        }

        const m = midden({ x, y });
        if (c === "T") {
          g.fillStyle(0x8a5a33).fillCircle(m.x, m.y + 6, 5);
          const groot = x === 4 && y === 2;
          boven.fillStyle(0x3f8f3a).fillCircle(m.x, m.y - 4, groot ? 40 : 22);
          boven.lineStyle(3, LIJN).strokeCircle(m.x, m.y - 4, groot ? 40 : 22);
          boven.fillStyle(0x58ab4a).fillCircle(m.x - 6, m.y - 10, groot ? 22 : 11);
        } else if (c === "b") {
          g.fillStyle(0x3f8f3a).fillCircle(m.x, m.y, 14);
          g.lineStyle(3, LIJN).strokeCircle(m.x, m.y, 14);
          g.fillStyle(0xff6f91).fillCircle(m.x - 5, m.y - 4, 3).fillCircle(m.x + 6, m.y + 3, 3);
        } else if (c === "-") {
          g.fillStyle(0xffffff).fillRect(px, m.y - 6, TEGEL, 4).fillRect(px, m.y + 4, TEGEL, 4);
          for (const o of [4, 14, 24]) g.fillRoundedRect(px + o, m.y - 12, 5, 22, 2);
        } else if (c === "|") {
          g.fillStyle(0xffffff).fillRect(m.x - 2, py, 4, TEGEL);
        } else if (c === "o") {
          g.fillStyle(0xa0673a).fillRoundedRect(px + 3, py + 10, TEGEL - 6, 12, 3);
          g.lineStyle(2, LIJN).strokeRoundedRect(px + 3, py + 10, TEGEL - 6, 12, 3);
        } else if (c === "w" && KAART[y][x - 1] !== "w") {
          g.fillStyle(0x9fd8f5).fillCircle(px + TEGEL, m.y, 26);
          g.lineStyle(3, LIJN).strokeCircle(px + TEGEL, m.y, 26);
          g.fillStyle(0xd8f2ff).fillCircle(px + TEGEL, m.y, 8);
        }
      }
    }

    // Huizen: gevel aan de straatkant, dak erachter.
    const gevel = 12 * TEGEL;
    for (const h of HUIZEN) {
      const x0 = h.x * TEGEL;
      const b = h.breedte * TEGEL;
      g.fillStyle(h.dak).fillRect(x0, gevel + 22, b, HOOGTE * TEGEL - gevel - 22);
      g.lineStyle(2, 0x000000, 0.12);
      for (let r = gevel + 34; r < HOOGTE * TEGEL; r += 12) g.lineBetween(x0, r, x0 + b, r);
      g.fillStyle(0xfff4e0).fillRect(x0, gevel, b, 26);
      g.lineStyle(3, LIJN).strokeRect(x0 + 1.5, gevel + 1.5, b - 3, HOOGTE * TEGEL - gevel);
      for (let x = h.x; x < h.x + h.breedte; x++) {
        const px = x * TEGEL;
        if (KAART[12][x] === "D") {
          g.fillStyle(0x8a4b2a).fillRoundedRect(px + 6, gevel + 2, 20, 24, 3);
          g.lineStyle(2, LIJN).strokeRoundedRect(px + 6, gevel + 2, 20, 24, 3);
          g.fillStyle(0xffd23f).fillCircle(px + 22, gevel + 15, 2);
        } else if ((x - h.x) % 2 === 1) {
          g.fillStyle(0x9fd8f5).fillRect(px + 8, gevel + 6, 16, 14);
          g.lineStyle(2, LIJN).strokeRect(px + 8, gevel + 6, 16, 14);
        }
      }
    }
    // De deurbel van oma Toos (met muzieknootje)
    const bel = midden(PLEKKEN.bel_toos);
    g.fillStyle(0xffd23f).fillCircle(bel.x + 14, bel.y - 6, 4);
    g.lineStyle(1.5, LIJN).strokeCircle(bel.x + 14, bel.y - 6, 4);
  }
}
