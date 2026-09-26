# Verhaalbijbel: Kattenkwaad in de Kriebelstraat

> Status: **concept, wacht op goedkeuring van Nannet** (toon en personages).

## De belofte
Eén zonnige zaterdag in de Kriebelstraat. Jij bent de ondeugendste bewoner van de straat, en vandaag wil je
de grootste grap ooit uithalen. Maar wat voor grappenmaker word jij?

## Toon
- **Stout, ondeugend, nooit onaardig.** Denk aan *Pippi Langkous* en *Dikkie Dik* met een vleugje *Dennis de
  Bengel*.
- De buren zijn geen slachtoffers maar tegenspelers. Ze zijn gevat, pakken je terug en lachen uiteindelijk
  mee.
- Korte zinnen. Alles wordt voorgelezen. Grapjes met klank ("Ding-dong! … Niemand?").

## De gouden regels
1. **Onschuldig en omkeerbaar.** Er gaat niets echt kapot en niemand raakt gewond.
2. **Nooit pesten of vernederen.** Geen streken tegen zwakke of verdrietige mensen, en nooit dieren als slachtoffer.
3. **De buren zijn gevat.** Een gevolg is grappig, nooit een straf.
4. **Te ver is een keuze, geen game-over.** Goedmaken opent nieuwe routes.
5. **Niets wat in het echt gevaarlijk is:** niet de straat op rennen, geen vuur, niet klimmen op daken.

## Speelbare helden (kies er één)
| Held | Wie | Speciale streek |
|---|---|---|
| **Pim** | Kind met een pet vol elastiekjes | Belletje lellen en met een scheetkussen het snelst wegrennen |
| **Moos** | Rode kat met één witte sok | Door kattenluikjes glippen en dingen van tafel tikken (niets breekbaars!) |
| **Tobber** | Vrolijke, rommelige hond | Dingen "lenen" en begraven (sokken, tennisballen) en keihard blij blaffen |

## De buren
| Buur | Karakter | Zwakke plek (voor een streek) | Hoe ze terugpakken |
|---|---|---|---|
| **Meneer Brom** | Mopperkont met een geheim zacht hart. Heeft een kat, Snoes | Zijn tuinkabouter Kees | Hij zet een waterpistool klaar achter de heg |
| **Oma Toos** | Gevat, snel en ziet álles | Haar deurbel speelt een liedje | Ze wacht je op met een "taart" van gebakken lucht |
| **Fiep & Floor** | Tweeling, even ondeugend als jij | Hun geheime club-hut | Ze halen een tegengrap uit, of worden je vrienden |
| **Bakker Bol** | Vrolijk en vergeetachtig | Zijn fiets met bel | Hij "vergeet" jouw koek, maar vindt hem later terug |
| **Postbode Pieter** | Altijd haast | Zijn pet | Hij bezorgt een raadselbrief bij jou |
| **Mevrouw Van Pluim** | Deftig, met een hoed vol veren | Haar prachtige tuinhek | Ze blijkt vroeger zelf de grootste grappenmaker te zijn geweest (geheim!) |

## Structuur: één dag, drie dagdelen
**Ochtend: "Wie ben jij?"**
- Je verkent de straat. Twee streken zijn beschikbaar: belletje lellen bij oma Toos en de kabouter van meneer Brom
  omdraaien.
- **Splitsmoment 1:** Snoes, de kat van meneer Brom, zit vast in de boom en meneer Brom is ten einde raad.
  - *"Bel nu snel aan en ren!"* → Ondeugd +2, vlag `brom_geplaagd`
  - *"Help Snoes uit de boom"* (Moos klimt zelf, Pim en Tobber halen de ladder van bakker Bol) →
    Buurthart +2, vlag `brom_vriend`

**Middag: "De tweeling"**
- Fiep & Floor dagen je uit: wie haalt de beste grap uit?
- Nieuwe streken, afhankelijk van je meters. Bij veel Ondeugd kun je de pet van postbode Pieter aan een vlieger
  hangen. Bij veel Buurthart helpt bakker Bol je met een nep-taart.
- **Splitsmoment 2:**
  - *"Word lid van hun club"* → vlag `club`
  - *"Haal een grap uit met de tweeling"* → vlag `tweeling_geplaagd`
  - *"Verklap hun plan aan oma Toos"* → vlag `verklapt`, Buurthart +1, Ondeugd −1

**Schemer: "De Allergrootste Grap"**
- Het plan van de dag komt samen. Wat buren weten en hoe ze reageren hangt af van je vlaggen.
- **Splitsmoment 3:** de grote finale-grap (welke dat is hangt af van je route) óf alles goedmaken.
- Geheim: wie bij mevrouw Van Pluim het hek piept (hoge Ondeugd én `brom_vriend`) ontdekt haar oude
  grappenboek.

## Eindes
| Einde | Voorwaarde (concept) | Wat er gebeurt |
|---|---|---|
| 🎉 **Het Grote Straatfeest** | Buurthart ≥ 7 | De hele straat viert feest, en je grappen waren het gesprek van de dag |
| 😼 **De Legendarische Grappenmaker** | Ondeugd ≥ 7 én Buurthart ≥ 5 | Iedereen is ingemaakt en iedereen lacht. Je krijgt een gouden scheetkussen |
| 🥧 **Betrapt door Oma Toos** | Ondeugd ≥ 7 en Buurthart < 5 | Oma Toos was je steeds een stapje voor. Straf? Taart eten met de hele straat! |
| 🦸 **De Stille Held** | `brom_vriend` en weinig Ondeugd | Niemand weet dat jij het was, behalve Snoes |
| 🕵️ **De Geheime Club** | `club` en de finale samen met de tweeling | Jullie worden de geheime grappenclub van de straat |
| 🎩 **Het Verborgen Einde** | Het grappenboek van mevrouw Van Pluim gevonden | Zij wordt jouw leermeester. Wordt vervolgd… |

## Voorbeeldtekst (toonproef)
> *Ding-dong!* Je drukt op de bel van oma Toos.
> Snel! Waar verstop je je?
> **[Achter de vuilnisbak]** · **[In de rozenstruik]** · **[Blijf gewoon staan]**
>
> *(Blijf gewoon staan)* De deur gaat open. Oma Toos kijkt je aan.
> "Jij bent óf heel dapper… óf heel slecht in belletje lellen."
