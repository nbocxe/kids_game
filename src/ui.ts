/** Alle schermen en dialogen als HTML over het speelveld: grote knoppen, goed leesbaar, en voorgelezen. */
import type { Einde, EindeId, HeldId, Keuze, SprekerId, Toestand } from "./verhaal/types.ts";
import { METER_MAX } from "./verhaal/verhaalmotor.ts";
import { spreek, stil } from "./spraak.ts";

export const HELDEN: Record<HeldId, { naam: string; icoon: string; wie: string }> = {
  pim: { naam: "Pim", icoon: "🧢", wie: "Kind met een pet vol elastiekjes" },
  moos: { naam: "Moos", icoon: "🐱", wie: "Rode kat met één witte sok" },
  tobber: { naam: "Tobber", icoon: "🐶", wie: "Vrolijke, rommelige hond" },
};

const SPREKERS: Record<Exclude<SprekerId, "held">, { naam: string; icoon: string }> = {
  verteller: { naam: "", icoon: "📖" },
  toos: { naam: "Oma Toos", icoon: "👵" },
  brom: { naam: "Meneer Brom", icoon: "👴" },
};

const laag = () => document.getElementById("laag")!;

type Kind = Node | string | null | false | undefined;
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  eigenschappen: Partial<HTMLElementTagNameMap[K]> & { class?: string } = {},
  ...kinderen: Kind[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  const { class: klasse, ...rest } = eigenschappen;
  if (klasse) e.className = klasse;
  Object.assign(e, rest);
  for (const k of kinderen) if (k) e.append(k);
  return e;
}

let voorlezen = true;
export function zetVoorlezen(aan: boolean) {
  voorlezen = aan;
  if (!aan) stil();
}
const lees = (tekst: string) => voorlezen && spreek(tekst);

function toon(scherm: HTMLElement) {
  laag().replaceChildren(scherm);
}
export function sluit() {
  laag().replaceChildren();
  stil();
}

// ── Titel en heldkeuze ──────────────────────────────────────
export function titelScherm(opties: {
  kanVerder: boolean;
  eindes: Einde[];
  gevonden: EindeId[];
}): Promise<"nieuw" | "verder"> {
  return new Promise((klaar) => {
    toon(
      el(
        "div",
        { class: "scherm titel" },
        el("div", { class: "logo" }, "😼🔔"),
        el("h1", {}, "Kattenkwaad", el("br"), el("small", {}, "in de Kriebelstraat")),
        opties.kanVerder && el("button", { class: "groot", onclick: () => klaar("verder") }, "▶ Verder spelen"),
        el("button", { class: opties.kanVerder ? "groot tweede" : "groot", onclick: () => klaar("nieuw") }, "✨ Nieuw spel"),
        plakboek(opties.eindes, opties.gevonden),
      ),
    );
    lees("Kattenkwaad in de Kriebelstraat!");
  });
}

function plakboek(eindes: Einde[], gevonden: EindeId[]) {
  return el(
    "section",
    { class: "plakboek" },
    el("h2", {}, `Plakboek: ${gevonden.length} van ${eindes.length} eindes`),
    el(
      "div",
      { class: "plaatjes" },
      ...eindes.map((e) =>
        gevonden.includes(e.id)
          ? el("div", { class: "plaatje" }, el("span", {}, e.icoon), e.titel)
          : el("div", { class: "plaatje geheim" }, el("span", {}, "❓"), "Nog geheim"),
      ),
    ),
  );
}

export function kiesHeld(): Promise<HeldId> {
  return new Promise((klaar) => {
    toon(
      el(
        "div",
        { class: "scherm" },
        el("h1", {}, "Wie ben jij vandaag?"),
        el(
          "div",
          { class: "kaarten" },
          ...(Object.keys(HELDEN) as HeldId[]).map((id) =>
            el(
              "button",
              { class: "kaart", onclick: () => klaar(id), ariaLabel: HELDEN[id].naam },
              el("span", { class: "icoon" }, HELDEN[id].icoon),
              el("strong", {}, HELDEN[id].naam),
              el("small", {}, HELDEN[id].wie),
            ),
          ),
        ),
      ),
    );
    lees("Wie ben jij vandaag? Pim, Moos of Tobber?");
  });
}

// ── Dialoog ─────────────────────────────────────────────────
export interface Regel {
  spreker: SprekerId;
  tekst: string;
}

/** Toont de regels één voor één. Met keuzes: wacht op een keuze. */
export function dialoog(
  held: HeldId,
  regels: Regel[],
  keuzes: Keuze[] = [],
  tekstVan: (k: Keuze) => string = () => "",
  splitsmoment = false,
): Promise<Keuze | null> {
  return new Promise((klaar) => {
    let i = 0;
    const toonRegel = () => {
      const r = regels[i];
      const laatste = i === regels.length - 1;
      const wie = r.spreker === "held" ? { naam: HELDEN[held].naam, icoon: HELDEN[held].icoon } : SPREKERS[r.spreker];
      const knoppen =
        laatste && keuzes.length
          ? el(
              "div",
              { class: splitsmoment ? "keuzes splits" : "keuzes" },
              ...keuzes.map((k) =>
                el(
                  "button",
                  { class: "keuze", onclick: () => { sluit(); klaar(k); } },
                  k.icoon && el("span", { class: "icoon" }, k.icoon),
                  tekstVan(k),
                ),
              ),
            )
          : el(
              "button",
              {
                class: "verder",
                onclick: () => {
                  if (laatste) { sluit(); klaar(null); } else { i++; toonRegel(); }
                },
              },
              "Verder ▶",
            );
      toon(
        el(
          "div",
          { class: splitsmoment ? "dialoog-laag splitsmoment" : "dialoog-laag" },
          splitsmoment && el("div", { class: "splits-titel" }, "✨ Wat doe jij? ✨"),
          el(
            "div",
            { class: "dialoog" },
            el("div", { class: "spreker" }, el("span", { class: "gezicht" }, wie.icoon), wie.naam),
            el("p", { class: "tekst" }, r.tekst),
            el("button", { class: "opnieuw", ariaLabel: "Nog eens voorlezen", onclick: () => spreek(r.tekst) }, "🔊"),
            knoppen,
          ),
        ),
      );
      lees(laatste && keuzes.length ? `${r.tekst} ${keuzes.map(tekstVan).join(". Of: ")}.` : r.tekst);
    };
    toonRegel();
  });
}

// ── Minispel: belletje lellen ───────────────────────────────
const VERSTOPPLEKKEN = [
  { tekst: "Achter de vuilnisbak", icoon: "🗑️", veilig: true },
  { tekst: "Achter de rozenstruik", icoon: "🌹", veilig: true },
  { tekst: "Blijf gewoon staan", icoon: "🧍", veilig: false },
];
export const DEUR_TIJD_MS = 4500;

export function belletjeLellen(): Promise<boolean> {
  return new Promise((klaar) => {
    const balk = el("div", { class: "balk-vulling" });
    const status = el("p", { class: "tekst" }, "Druk op de bel!");
    const plekken = el("div", { class: "keuzes verstop", hidden: true });
    let klaarGezet = false;
    const einde = (gelukt: boolean, zin: string) => {
      if (klaarGezet) return;
      klaarGezet = true;
      clearTimeout(timer);
      plekken.hidden = true;
      status.textContent = zin;
      lees(zin);
      setTimeout(() => { sluit(); klaar(gelukt); }, 1600);
    };
    let timer = 0;
    for (const p of VERSTOPPLEKKEN)
      plekken.append(
        el(
          "button",
          {
            class: "keuze",
            onclick: () =>
              p.veilig
                ? einde(true, p.icoon === "🗑️" ? "Pfff, wat een lucht! Maar je bent goed verstopt." : "Au, prikkels! Maar niemand ziet je.")
                : einde(false, "De deur gaat open…"),
          },
          el("span", { class: "icoon" }, p.icoon),
          p.tekst,
        ),
      );
    const bel = el(
      "button",
      {
        class: "bel",
        ariaLabel: "Deurbel",
        onclick: () => {
          bel.disabled = true;
          bel.classList.add("rinkelt");
          status.textContent = "Tingelingeling! Snel, verstop je!";
          lees("Tingelingeling! Snel, verstop je!");
          plekken.hidden = false;
          balk.style.transitionDuration = `${DEUR_TIJD_MS}ms`;
          requestAnimationFrame(() => requestAnimationFrame(() => balk.classList.add("vol")));
          timer = window.setTimeout(() => einde(false, "Te laat! De deur gaat open…"), DEUR_TIJD_MS);
        },
      },
      "🔔",
    );
    toon(
      el(
        "div",
        { class: "dialoog-laag minispel" },
        el(
          "div",
          { class: "dialoog" },
          el("div", { class: "spreker" }, el("span", { class: "gezicht" }, "🚪"), "Belletje lellen"),
          el("div", { class: "deur" }, bel),
          status,
          el("div", { class: "balk", title: "De deur gaat open…" }, balk),
          plekken,
        ),
      ),
    );
    lees("Druk op de bel!");
  });
}

// ── Einde ───────────────────────────────────────────────────
export function eindeScherm(einde: Einde, eindes: Einde[], gevonden: EindeId[], nieuw: boolean): Promise<void> {
  return new Promise((klaar) => {
    toon(
      el(
        "div",
        { class: "scherm einde" },
        el("div", { class: "logo" }, einde.icoon),
        el("p", { class: "klein" }, "Einde"),
        el("h1", {}, einde.titel),
        nieuw && el("p", { class: "nieuw" }, "⭐ Nieuw in je plakboek!"),
        plakboek(eindes, gevonden),
        el("p", {}, "Andere keuzes geven een ander einde. Probeer het nog eens!"),
        el("button", { class: "groot", onclick: () => klaar() }, "🔁 Nog een keer"),
      ),
    );
    lees(`Einde: ${einde.titel}. Andere keuzes geven een ander einde!`);
  });
}

// ── HUD ─────────────────────────────────────────────────────
export function werkHudBij(t: Toestand, missie: string, vorige?: Toestand) {
  const zet = (id: string, waarde: number) =>
    ((document.getElementById(id) as HTMLElement).style.width = `${(waarde / METER_MAX) * 100}%`);
  zet("meter-ondeugd", t.ondeugd);
  zet("meter-hart", t.hart);
  document.getElementById("missie")!.textContent = missie ? `🎯 ${missie}` : "";
  if (vorige) {
    const dOndeugd = t.ondeugd - vorige.ondeugd;
    const dHart = t.hart - vorige.hart;
    if (dOndeugd) melding(`😼 ${dOndeugd > 0 ? "+" : ""}${dOndeugd} ondeugd`);
    if (dHart) melding(`💛 ${dHart > 0 ? "+" : ""}${dHart} buurthart`);
  }
}

function melding(tekst: string) {
  const m = el("div", { class: "melding" }, tekst);
  document.getElementById("meldingen")!.append(m);
  setTimeout(() => m.remove(), 2600);
}
