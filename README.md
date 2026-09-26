# Kattenkwaad in de Kriebelstraat

Een kinderspel (6–9 jaar) voor tablet en telefoon waarin **kattenkwaad en belletje lellen** het doel zijn:
stout en ondeugend, maar nooit onaardig. Je loopt rond in een top-down straatje en je keuzes veranderen het
verhaal, zoals in *Bandersnatch* en *Fable*.

- **Ontwerp:** [docs/ontwerp.md](docs/ontwerp.md)
- **Verhaal, toon en personages:** [docs/verhaalbijbel.md](docs/verhaalbijbel.md)
- **Het team (Claude-subagents):** [.claude/agents/](.claude/agents/). Dat zijn de verhaalregisseur, de
  speelontwerper, de lief-stout-bewaker, de tekenaar, de game-bouwer en de speeltester.

## Fasering
1. Fase 0, team en fundament ✅
2. **Fase 1, speelbaar prototype** ✅ ← *nu*: één straat, 2 buren, belletje lellen, één splitsmoment, 2 eindes
3. Fase 2, het hele verhaal (3 dagdelen, 6 eindes, plakboek)
4. Fase 3, afwerking (tekeningen, geluid, voorlezen, PWA)

## Spelen en ontwikkelen

```bash
npm install
npm run dev        # speel op http://localhost:5173 (ook vanaf een tablet in hetzelfde netwerk)
npm test           # verhaalmotor, route-verkenner, toonregels en kaart
npm run typecheck
npm run e2e        # bouwt en speelt twee routes echt in Chromium (tablet en telefoon), met screenshots
npm run build      # statische site in dist/, als app op het beginscherm te zetten
```

Techniek: Vite, TypeScript, Phaser 4 en een statische PWA, zonder account of server.

- `src/verhaal/verhaal.ts`: **het verhaal als data** (scènes, keuzes, vlaggen, eindes). Hier schrijf je nieuwe
  stukken.
- `src/verhaal/verhaalmotor.ts`: voert het verhaal uit (pure functies, getest).
- `src/verhaal/verkenner.ts`: de route-verkenner die alle keuzes afloopt.
- `src/engine/`: de straat (kaart, looproutes, tekeningen, Phaser-scène).
- `src/ui.ts`: dialogen, splitsmomenten, het minispel belletje lellen, eindes en het plakboek.
