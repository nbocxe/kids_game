# Kattenkwaad in de Kriebelstraat

Een kinderspel (6–9 jaar) voor tablet en telefoon waarin **kattenkwaad en belletje lellen** het doel zijn:
stout en ondeugend, maar nooit onaardig. Je loopt rond in een top-down straatje en je keuzes veranderen het
verhaal, zoals in *Bandersnatch* en *Fable*.

- **Ontwerp:** [docs/ontwerp.md](docs/ontwerp.md)
- **Verhaal, toon en personages:** [docs/verhaalbijbel.md](docs/verhaalbijbel.md)
- **Het team (Claude-subagents):** [.claude/agents/](.claude/agents/). Dat zijn de verhaalregisseur, de
  speelontwerper, de lief-stout-bewaker, de tekenaar, de game-bouwer en de speeltester.

## Fasering
1. **Fase 0, team en fundament** ← *nu*
2. Fase 1, speelbaar prototype (één straat, 2 buren, belletje lellen, één splitsmoment, 2 eindes)
3. Fase 2, het hele verhaal (3 dagdelen, 6 eindes, plakboek)
4. Fase 3, afwerking (tekeningen, geluid, voorlezen, PWA)

Techniek (vanaf fase 1): Vite, TypeScript, Phaser 3 en een statische PWA, zonder account of server.
