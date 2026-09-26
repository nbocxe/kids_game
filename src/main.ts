/** Spelbesturing: koppelt verhaalmotor, straat, schermen en opslag aan elkaar. */
import Phaser from "phaser";
import "./stijl.css";
import { verhaal } from "./verhaal/verhaal.ts";
import {
  automatischeInteractie,
  beschikbareInteracties,
  beschikbareKeuzes,
  huidigeScene,
  kies,
  minispelUitslag,
  missieVan,
  nieuweToestand,
  regelsVan,
  startInteractie,
  tekstVan,
  verder,
} from "./verhaal/verhaalmotor.ts";
import type { EindeId, Interactie, Toestand } from "./verhaal/types.ts";
import { WereldScene } from "./engine/WereldScene.ts";
import { START, type Punt } from "./engine/kaart.ts";
import { bewaar, laad } from "./opslag.ts";
import * as ui from "./ui.ts";

let toestand: Toestand;
let positie: Punt = START;
let wereld: WereldScene | null = null;
let spel: Phaser.Game | null = null;

const hud = document.getElementById("hud")!;

function startWereld(): Promise<void> {
  const data = {
    held: toestand.held,
    positie,
    koppeling: {
      interacties: () => (toestand.scene ? [] : beschikbareInteracties(verhaal, toestand)),
      aangekomen: (i: Interactie) => void doeInteractie(i),
      bewogen: (p: Punt) => {
        positie = p;
        bewaar({ spel: { toestand, positie } });
      },
    },
  };
  return new Promise((klaar) => {
    const gereed = (scene: Phaser.Scene) => {
      wereld = scene as WereldScene;
      klaar();
    };
    if (!spel) {
      spel = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "spel",
        backgroundColor: "#5fa04e",
        scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
        scene: [],
      });
      spel.events.once("ready", () => {
        spel!.scene.add("wereld", WereldScene, false);
        const s = spel!.scene.getScene("wereld")!;
        s.events.once("create", () => gereed(s));
        spel!.scene.start("wereld", data);
      });
    } else {
      const s = spel.scene.getScene("wereld")!;
      s.events.once("create", () => gereed(s));
      s.scene.restart(data);
    }
  });
}

async function doeInteractie(i: Interactie) {
  if (!wereld?.actief) return;
  await speel(startInteractie(verhaal, toestand, i));
}

/** Speelt scènes af tot je weer in de straat staat of een einde bereikt. */
async function speel(nieuw: Toestand) {
  const vorige = toestand;
  toestand = nieuw;
  ui.werkHudBij(toestand, missieVan(verhaal, toestand), vorige);

  while (toestand.scene) {
    if (wereld) wereld.actief = false;
    bewaar({ spel: { toestand, positie } });
    const scene = huidigeScene(verhaal, toestand)!;
    const oud = toestand;

    if (scene.minispel) {
      toestand = minispelUitslag(verhaal, toestand, await ui.belletjeLellen());
    } else {
      const keuzes = beschikbareKeuzes(verhaal, toestand);
      const keuze = await ui.dialoog(
        toestand.held,
        regelsVan(verhaal, toestand),
        keuzes,
        (k) => tekstVan(k.tekst, toestand),
        scene.splitsmoment,
      );
      if (scene.einde) return eindigen(scene.einde);
      toestand = keuze ? kies(verhaal, toestand, keuze) : verder(verhaal, toestand);
    }
    ui.werkHudBij(toestand, missieVan(verhaal, toestand), oud);
    wereld?.ververs(toestand);
  }

  // Terug in de straat
  bewaar({ spel: { toestand, positie } });
  wereld?.ververs(toestand);
  const auto = automatischeInteractie(verhaal, toestand);
  if (auto) {
    setTimeout(() => void speel(startInteractie(verhaal, toestand, auto)), 700);
  } else if (wereld) {
    wereld.actief = true;
  }
}

async function eindigen(eindeId: EindeId) {
  const opslag = laad();
  const nieuw = !opslag.eindes.includes(eindeId);
  const gevonden = nieuw ? [...opslag.eindes, eindeId] : opslag.eindes;
  bewaar({ spel: null, eindes: gevonden });
  const einde = verhaal.eindes.find((e) => e.id === eindeId)!;
  hud.hidden = true;
  await ui.eindeScherm(einde, verhaal.eindes, gevonden, nieuw);
  await menu();
}

async function menu() {
  hud.hidden = true;
  if (wereld) wereld.actief = false;
  const opslag = laad();
  const keuze = await ui.titelScherm({ kanVerder: !!opslag.spel, eindes: verhaal.eindes, gevonden: opslag.eindes });
  if (keuze === "verder" && opslag.spel) {
    toestand = opslag.spel.toestand;
    positie = opslag.spel.positie;
  } else {
    const held = await ui.kiesHeld();
    toestand = nieuweToestand(verhaal, held);
    positie = START;
  }
  ui.sluit();
  await startWereld();
  hud.hidden = false;
  const begin = toestand;
  toestand = { ...begin, scene: null }; // zodat de HUD niet "+0" meldt
  await speel(begin);
}

// ── Knoppen in de HUD ───────────────────────────────────────
const voorleesKnop = document.getElementById("knop-voorlezen")!;
function zetVoorlezen(aan: boolean) {
  ui.zetVoorlezen(aan);
  voorleesKnop.textContent = aan ? "🔊" : "🔇";
  voorleesKnop.ariaLabel = aan ? "Voorlezen staat aan" : "Voorlezen staat uit";
  bewaar({ voorlezen: aan });
}
voorleesKnop.onclick = () => zetVoorlezen(voorleesKnop.textContent !== "🔊");
document.getElementById("knop-menu")!.onclick = () => {
  ui.sluit();
  void menu();
};
zetVoorlezen(laad().voorlezen);

// Hulpmiddel voor de speeltester (Playwright).
Object.assign(window, {
  __kk: {
    toestand: () => toestand,
    positie: () => wereld?.heldPositie(),
    scherm: (plek: string) => wereld?.schermPositie(plek),
    tik: (plek: string) => wereld?.tikOpPlek(plek),
    actief: () => !!wereld?.actief,
  },
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

void menu();
