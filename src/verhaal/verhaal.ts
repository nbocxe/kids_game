/**
 * Fase 1: "Een ochtend in de Kriebelstraat".
 * Twee buren (oma Toos en meneer Brom), één streek met minispel (belletje lellen),
 * één splitsmoment (de slof) en twee eindes.
 */
import type { Verhaal } from "./types.ts";

export const verhaal: Verhaal = {
  start: "intro",

  eindes: [
    { id: "stille_held", titel: "De Stille Held", icoon: "🦸" },
    { id: "betrapt_toos", titel: "Betrapt door Oma Toos", icoon: "🥧" },
  ],

  missies: [
    { als: { nietVlag: "streek_bel" }, tekst: "Bel aan bij oma Toos en verstop je snel!" },
    { als: { vlag: "slof_kwijt" }, tekst: "Zoek de slof van meneer Brom in het park." },
    { tekst: "Kijk rond in de straat." },
  ],

  interacties: [
    { id: "bel_toos", plek: "bel_toos", scene: "bel_start", eenmalig: true },
    { id: "kabouter", plek: "kabouter", scene: "kabouter", eenmalig: true },
    { id: "praat_toos", plek: "toos", scene: "toos_praat" },
    { id: "praat_brom", plek: "brom", scene: "brom_praat" },
    { id: "slof", plek: "slof", scene: "slof_gevonden", als: { vlag: "slof_kwijt" }, eenmalig: true },
    { id: "slof_kwijt", plek: "brom", scene: "brom_slof_kwijt", als: { vlag: "streek_bel" }, automatisch: true },
  ],

  scenes: {
    intro: {
      id: "intro",
      regels: [
        { spreker: "verteller", tekst: "Het is zaterdag in de Kriebelstraat." },
        {
          spreker: "verteller",
          tekst: [
            { als: { held: "pim" }, tekst: "Pim zet de pet vol elastiekjes op." },
            { als: { held: "moos" }, tekst: "Moos rekt zich uit in de zon. Eerst een snorharen-check." },
            { als: { held: "tobber" }, tekst: "Tobber kwispelt zo hard dat zijn oren flapperen." },
          ],
        },
        { spreker: "verteller", tekst: "Vandaag is een perfecte dag voor kattenkwaad!" },
        { spreker: "verteller", tekst: "Tik op de straat om te lopen. Tik op een glinstering om iets te doen." },
      ],
      naar: "wereld",
    },

    // ── Oma Toos ────────────────────────────────────────────────
    bel_start: {
      id: "bel_start",
      regels: [
        { spreker: "verteller", tekst: "Dit is de deur van oma Toos. Haar bel speelt een liedje." },
        { spreker: "verteller", tekst: "Druk op de bel. Verstop je dan snel, voordat de deur opengaat!" },
      ],
      minispel: { spel: "belletje", gelukt: "bel_gelukt", betrapt: "bel_betrapt" },
    },
    bel_gelukt: {
      id: "bel_gelukt",
      effect: { ondeugd: 2, zet: ["streek_bel"] },
      regels: [
        { spreker: "toos", tekst: "Hallo? … Is daar iemand?" },
        { spreker: "toos", tekst: "Hm. Zeker die ondeugende wind weer." },
        { spreker: "verteller", tekst: "Hihi. Ze heeft je niet gezien!" },
      ],
      naar: "wereld",
    },
    bel_betrapt: {
      id: "bel_betrapt",
      effect: { ondeugd: 1, hart: 1, zet: ["streek_bel", "betrapt_toos"] },
      regels: [
        { spreker: "toos", tekst: "Jij bent óf heel dapper… óf heel slecht in belletje lellen." },
        { spreker: "toos", tekst: "Oefen nog maar een beetje op verstoppen, hoor." },
        { spreker: "verteller", tekst: "Oma Toos knipoogt en doet de deur weer dicht." },
      ],
      naar: "wereld",
    },
    toos_praat: {
      id: "toos_praat",
      regels: [
        {
          spreker: "toos",
          tekst: [
            { als: { nietVlag: "streek_bel" }, tekst: "Goeiemorgen! Ik ga zo een taart bakken." },
            { als: { vlag: "betrapt_toos" }, tekst: "Ik hou je in de gaten, kleine belletjeslellert!" },
            { tekst: "Die wind vandaag! Hij belt steeds bij mij aan." },
          ],
        },
        {
          spreker: "toos",
          tekst: [{ als: { vlag: "slof_kwijt" }, tekst: "Ik zag Snoes met iets naar het park rennen." }],
        },
      ],
      naar: "wereld",
    },

    // ── Meneer Brom ─────────────────────────────────────────────
    kabouter: {
      id: "kabouter",
      regels: [
        { spreker: "verteller", tekst: "Dit is Kees, de tuinkabouter van meneer Brom." },
        { spreker: "verteller", tekst: "Meneer Brom poetst hem elke dag." },
      ],
      keuzes: [
        { tekst: "Zet Kees op zijn kop", icoon: "🙃", naar: "kabouter_om", effect: { ondeugd: 1, zet: ["streek_kabouter"] } },
        { tekst: "Laat Kees maar staan", icoon: "🧍", naar: "kabouter_laat" },
      ],
    },
    kabouter_om: {
      id: "kabouter_om",
      regels: [
        {
          spreker: "verteller",
          tekst: [
            { als: { held: "moos" }, tekst: "Met één poot duw je Kees om. Plof!" },
            { als: { held: "tobber" }, tekst: "Je duwt Kees om met je neus. Plof!" },
            { tekst: "Je draait Kees voorzichtig om. Plof!" },
          ],
        },
        { spreker: "verteller", tekst: "Kees staat nu op zijn puntmuts. Hij lijkt wel te lachen." },
      ],
      naar: "wereld",
    },
    kabouter_laat: {
      id: "kabouter_laat",
      regels: [{ spreker: "verteller", tekst: "Kees kijkt je dankbaar aan. Denk je." }],
      naar: "wereld",
    },
    brom_praat: {
      id: "brom_praat",
      regels: [
        {
          spreker: "brom",
          tekst: [
            { als: { vlag: "slof_kwijt" }, tekst: "Heb jij mijn slof gezien? Ik loop op één sok!" },
            { als: { vlag: "streek_kabouter" }, tekst: "Wie heeft Kees op zijn kop gezet? Grrr." },
            { tekst: "Wat moet je? Ik ben druk aan het mopperen." },
          ],
        },
        { spreker: "verteller", tekst: "Meneer Brom moppert graag. Maar hij heeft een zacht hart." },
      ],
      naar: "wereld",
    },
    brom_slof_kwijt: {
      id: "brom_slof_kwijt",
      effect: { zet: ["slof_kwijt"] },
      regels: [
        { spreker: "verteller", tekst: "Opeens hoor je geroep bij het huis van meneer Brom." },
        { spreker: "brom", tekst: "Mijn slof! Wie heeft mijn slof gepikt?" },
        { spreker: "brom", tekst: "Het is mijn allerliefste slof!" },
        {
          spreker: "verteller",
          tekst: [
            { als: { held: "tobber" }, tekst: "Oeps. Tobber weet het wel. Die slof ligt in het park." },
            { tekst: "Snoes, de kat van meneer Brom, rent met iets naar het park." },
          ],
        },
      ],
      naar: "wereld",
    },

    // ── Splitsmoment: de slof ───────────────────────────────────
    slof_gevonden: {
      id: "slof_gevonden",
      splitsmoment: true,
      regels: [
        {
          spreker: "verteller",
          tekst: [
            { als: { held: "tobber" }, tekst: "Daar is hij! Je hebt hem zelf begraven. Hij ruikt naar kaas." },
            { tekst: "Daar ligt de slof, onder de grote boom." },
          ],
        },
        { spreker: "verteller", tekst: "Wat ga je doen?" },
      ],
      keuzes: [
        {
          tekst: "Verstop de slof nog beter",
          icoon: "🙈",
          naar: "gevolg_verstopt",
          effect: { ondeugd: 2, zet: ["brom_geplaagd"] },
        },
        {
          tekst: "Zet de slof op het hoofd van Kees",
          icoon: "🎩",
          naar: "gevolg_kabouter",
          effect: { ondeugd: 1, hart: 1, zet: ["slof_kabouter"] },
        },
        {
          tekst: "Breng de slof stiekem terug",
          icoon: "💝",
          naar: "gevolg_terug",
          effect: { hart: 2, zet: ["brom_vriend"] },
        },
      ],
    },
    gevolg_verstopt: {
      id: "gevolg_verstopt",
      regels: [
        { spreker: "verteller", tekst: "Je legt de slof in het vogelhuisje. Daar zoekt niemand!" },
        { spreker: "brom", tekst: "Waar is mijn slof nou?!" },
        { spreker: "verteller", tekst: "Meneer Brom zoekt de hele dag. Op één slof en één laars." },
        { spreker: "verteller", tekst: "Maar achter het raam zit oma Toos. Zij ziet álles." },
      ],
      naar: "schemer",
    },
    gevolg_kabouter: {
      id: "gevolg_kabouter",
      regels: [
        { spreker: "verteller", tekst: "Kabouter Kees draagt nu een slof als hoedje." },
        { spreker: "brom", tekst: "Kees! Wat heb jij nou op je hoofd?" },
        {
          spreker: "brom",
          tekst: [{ als: { vlag: "streek_kabouter" }, tekst: "En waarom sta je nog steeds op je kop?" }],
        },
        { spreker: "brom", tekst: "Hm. Het staat je eigenlijk best goed." },
        { spreker: "verteller", tekst: "Meneer Brom grinnikt. Dat heb je nog nooit gehoord." },
      ],
      naar: "schemer",
    },
    gevolg_terug: {
      id: "gevolg_terug",
      regels: [
        {
          spreker: "verteller",
          tekst: [
            { als: { held: "tobber" }, tekst: "Je legt de slof voor de deur. Een beetje nat, dat wel." },
            { tekst: "Je legt de slof netjes voor de deur. Niemand ziet je." },
          ],
        },
        { spreker: "brom", tekst: "Mijn slof! Wie heeft die teruggebracht?" },
        { spreker: "verteller", tekst: "Meneer Brom kijkt rond. Dan glimlacht hij, heel even." },
      ],
      naar: "schemer",
    },

    // ── Schemer en eindes ───────────────────────────────────────
    schemer: {
      id: "schemer",
      regels: [
        { spreker: "verteller", tekst: "De zon zakt achter de daken." },
        { spreker: "verteller", tekst: "Iedereen komt naar buiten, naar het pleintje." },
      ],
      naar: [
        { als: { vlag: "brom_vriend" }, naar: "einde_held" },
        { als: { vlag: "slof_kabouter", hartMin: 5 }, naar: "einde_held" },
        { naar: "einde_betrapt" },
      ],
    },
    einde_held: {
      id: "einde_held",
      einde: "stille_held",
      regels: [
        {
          spreker: "brom",
          tekst: [
            { als: { vlag: "brom_vriend" }, tekst: "Iemand heeft vandaag mijn slof teruggebracht." },
            { tekst: "Iemand gaf Kees een hoedje. Ik heb in jaren niet zo gelachen." },
          ],
        },
        { spreker: "brom", tekst: "Ik weet niet wie het was. Maar dank je wel, hoor." },
        {
          spreker: "verteller",
          tekst: [
            { als: { held: "moos" }, tekst: "Snoes geeft jou een kopje. Zij weet het wel." },
            { tekst: "Snoes kijkt jou aan. Snoes weet het wel." },
          ],
        },
        { spreker: "brom", tekst: "Wie wil er limonade? Ik trakteer!" },
      ],
    },
    einde_betrapt: {
      id: "einde_betrapt",
      einde: "betrapt_toos",
      regels: [
        { spreker: "toos", tekst: "Zo, grappenmaker. Ik heb alles gezien, hoor." },
        {
          spreker: "toos",
          tekst: [
            { als: { vlag: "brom_geplaagd" }, tekst: "Die slof ligt in het vogelhuisje. Toch?" },
            { tekst: "Die slof op Kees? Dat was jij." },
          ],
        },
        {
          spreker: "toos",
          tekst: [{ als: { vlag: "betrapt_toos" }, tekst: "En verstoppen kun je nog steeds niet." }],
        },
        { spreker: "toos", tekst: "Weet je wat jouw straf is?" },
        { spreker: "toos", tekst: "Taart eten! Met de hele straat." },
        {
          spreker: "brom",
          tekst: [
            { als: { vlag: "brom_geplaagd" }, tekst: "Mag ik dan wél mijn slof terug?" },
            { tekst: "Kees mag ook een stukje." },
          ],
        },
      ],
    },
  },
};
