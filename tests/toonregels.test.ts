/** Speeltester + lief-stout-bewaker: taal geschikt voor 6–9 jaar. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { verhaal } from "../src/verhaal/verhaal.ts";
import type { Tekst } from "../src/verhaal/types.ts";

const MAX_WOORDEN_PER_ZIN = 15;
const MAX_KEUZES = 3;
const VERBODEN = ["dom", "stom", "sukkel", "idioot", "haat", "dood", "vuur", "lucifer", "aansteker", "kapotmaken", "slaan", "schoppen", "lelijk", "dik", "achterlijk"];

function alleTeksten(): { waar: string; tekst: string }[] {
  const uit: { waar: string; tekst: string }[] = [];
  const voeg = (waar: string, t: Tekst) =>
    typeof t === "string" ? uit.push({ waar, tekst: t }) : t.forEach((v) => uit.push({ waar, tekst: v.tekst }));
  for (const s of Object.values(verhaal.scenes)) {
    s.regels.forEach((r) => voeg(s.id, r.tekst));
    s.keuzes?.forEach((k) => voeg(`${s.id} (keuze)`, k.tekst));
  }
  verhaal.missies.forEach((m) => voeg("missie", m.tekst));
  return uit;
}

test(`zinnen hebben hooguit ${MAX_WOORDEN_PER_ZIN} woorden`, () => {
  const te_lang = alleTeksten().flatMap(({ waar, tekst }) =>
    tekst
      .split(/[.!?]+/)
      .filter((zin) => zin.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w)).length > MAX_WOORDEN_PER_ZIN)
      .map((zin) => `${waar}: ${zin.trim()}`),
  );
  assert.deepEqual(te_lang, []);
});

test(`hooguit ${MAX_KEUZES} keuzes per scherm`, () => {
  for (const s of Object.values(verhaal.scenes)) assert.ok((s.keuzes?.length ?? 0) <= MAX_KEUZES, s.id);
});

test("keuzes beginnen met een werkwoord (hoofdletter, geen vraag)", () => {
  for (const { waar, tekst } of alleTeksten().filter((t) => t.waar.endsWith("(keuze)")))
    assert.match(tekst, /^\p{Lu}[^?]*$/u, waar);
});

test("geen verboden woorden", () => {
  const fout = alleTeksten().filter(({ tekst }) =>
    VERBODEN.some((w) => new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, "iu").test(tekst)),
  );
  assert.deepEqual(fout, []);
});
