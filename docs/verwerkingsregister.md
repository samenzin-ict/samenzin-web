# Verwerkingsregister

Register van verwerkingen van Stichting Samenleving en Zingeving, zoals artikel 30 AVG
het vraagt. Het beschrijft welke persoonsgegevens de stichting verwerkt, waarvoor, op
welke grondslag, wie erbij kan, met wie ze gedeeld worden en hoe lang ze blijven.

Bijgewerkt: 4 november 2026. Hoort bij privacyverklaring versie 1.4.

Dit bestand bevat geen persoonsgegevens, alleen soorten gegevens. Echte namen en
adressen horen hier nooit in (CLAUDE.md, regel 2).

**Wanneer bijwerken.** Bij elke nieuwe collectie, elk nieuw formulier of elke nieuwe
dienstverlener die persoonsgegevens raakt, vóórdat die live gaat. Verandert een
bewaartermijn, pas dan ook de privacyverklaring aan (`docs/Privacyverklaring-samenzin.docx`,
geladen met `pnpm load:legal`) en de tabel "Retention" in `PROGRESS.md`.

## Verwerkingsverantwoordelijke

| | |
| --- | --- |
| Naam | Stichting Samenleving en Zingeving, Tilburg |
| Contact voor privacy | het algemene e-mailadres van de stichting (zie de privacyverklaring) |
| Functionaris gegevensbescherming | Geen; niet verplicht (zie privacyverklaring, hoofdstuk 1) |

## Voor alle verwerkingen via de website

**Dienstverleners** (ontvangers):

| Partij | Wat | Rol | Locatie |
| --- | --- | --- | --- |
| Vercel Inc. | Hosting en uitvoering van de website | Verwerker | Functies in Frankfurt; bedrijf in de VS |
| Neon (Databricks, Inc.) | Database | Verwerker | Frankfurt; bedrijf in de VS |
| Cloudflare, Inc. (R2) | Opslag van bestanden | Verwerker | Jurisdictie EU; bedrijf in de VS |
| Namecheap, Inc. (Private Email) | E-mail van en naar de stichting, ook de e-mails die de website verstuurt | Verwerker | VS |
| Mollie B.V. | Betalingen en machtigingen | Zelfstandig verwerkingsverantwoordelijke | Nederland |

**Doorgifte buiten de EER:** naar de VS via Vercel, Neon, Cloudflare en Namecheap, op
grond van de standaardcontractbepalingen van de Europese Commissie in hun
verwerkersovereenkomsten en, waar van toepassing, het EU-VS Data Privacy Framework.

**Beveiliging:**
- Alleen HTTPS.
- Persoonlijke accounts voor het beheergedeelte, met rollen.
- Toegangsregels in de code, `src/access/`.
- Geen trackers of analysediensten.
- Verwijderen en anonimiseren gebeurt automatisch door een dagelijkse taak,
  `src/lib/retention.ts`.

**Bewaartermijnen afdwingen:** elke rij met een einddatum krijgt een `deleteAfter`. De
dagelijkse taak verwijdert of anonimiseert de rij op die datum.

## Verwerkingen via de website

### 1. Websitebezoek (serverlogs)

| | |
| --- | --- |
| Doel | Website laten werken, misbruik herkennen |
| Betrokkenen | Bezoekers |
| Gegevens | IP-adres, tijdstip, opgevraagde pagina, browsertype |
| Grondslag | Gerechtvaardigd belang |
| Toegang | Beheerders van het Vercel-team |
| Bewaartermijn | Belofte: maximaal 6 maanden. Vercel bewaart runtimelogs korter |

### 2. Contactformulier

| | |
| --- | --- |
| Doel | Vragen beantwoorden |
| Betrokkenen | Wie het formulier invult |
| Gegevens | Naam, e-mailadres, bericht |
| Grondslag | Gerechtvaardigd belang of toestemming |
| Toegang | Alleen beheerders (rol admin). Het bestuur krijgt per e-mail alleen naam, e-mailadres en een link, niet het bericht; de afzender krijgt een kopie van het eigen bericht |
| Bewaartermijn | 12 maanden na binnenkomst, daarna automatisch verwijderd |
| Ook | Tegen misbruik telt de website verzoeken per afzender; het IP-adres wordt daarvoor alleen als onomkeerbare hash gebruikt, nooit bewaard (`src/lib/rate-limit.ts`). Dat geldt ook voor de andere formulieren en het inloggen |
| In de code | `src/collections/ContactSubmissions.ts` |

### 3. Eenmalige giften

| | |
| --- | --- |
| Doel | Gift afhandelen en boeken, bevestiging sturen, fiscale administratie |
| Betrokkenen | Gevers |
| Gegevens | Naam en e-mailadres (niet bij een anonieme gift), bedrag, datum, project, Mollie-betaalkenmerk |
| Niet bewaard | Rekeningnummer: dat ziet alleen Mollie |
| Grondslag | Uitvoering van de gift; wettelijke bewaarplicht voor de boeking |
| Toegang | Alleen beheerders |
| Bewaartermijn | Naam en e-mailadres tot 1 januari, 7 jaar na het jaar van de gift; daarna weggehaald. Bedrag, datum en kenmerk blijven voor de boekhouding |
| In de code | `src/collections/Donations.ts` |

### 4. Doorlopende giften (machtigingen voor automatische incasso)

| | |
| --- | --- |
| Doel | Machtiging bevestigen, gever vóór elke afschrijving informeren (verplichte vooraankondiging), laten stoppen, afschrijvingen boeken |
| Betrokkenen | Gevers met een maandelijkse of periodieke gift |
| Gegevens | Naam, e-mailadres, bedrag, termijn, project, data van afschrijvingen, Mollie-kenmerken van klant, machtiging en abonnement |
| Niet bewaard | Rekeningnummer en de machtiging zelf: die bewaart Mollie. Het BSN komt niet op de website, niet bij Mollie en niet in e-mail |
| Grondslag | Uitvoering van de overeenkomst met de gever; wettelijke bewaarplicht voor de boekingen |
| Toegang | Alleen beheerders |
| Bewaartermijn | Naam en e-mailadres 14 maanden na de laatste afschrijving, daarna weggehaald (een onterechte afschrijving kan 13 maanden worden teruggevraagd). Bedragen en kenmerken 7 jaar |
| In de code | `src/collections/RecurringDonations.ts`, `src/lib/donations.ts` |

### 5. Periodieke gift: de papieren overeenkomst

| | |
| --- | --- |
| Doel | Giftenaftrek voor de gever; administratie van de stichting |
| Betrokkenen | Gever en diens echtgenoot of geregistreerd partner |
| Gegevens | Naam, adres, geboortedatum, geboorteplaats, BSN, bedrag, looptijd, handtekeningen |
| Grondslag | Wettelijke verplichting; het BSN alleen omdat de belastingwet het vereist |
| Toegang | Penningmeester en voorzitter. Op papier, per post of afgegeven, nooit per e-mail |
| Bewaartermijn | Looptijd van de overeenkomst en daarna 7 jaar |
| Waar | Fysiek archief van de stichting, niet in de website |

### 6. Vrijwilligersaanmeldingen

| | |
| --- | --- |
| Doel | Aanmelding beoordelen en contact opnemen |
| Betrokkenen | Mensen die zich als vrijwilliger aanmelden |
| Gegevens | Naam, e-mailadres, telefoonnummer, woonplaats, interesses, vaardigheden, taalniveau, beschikbaarheid, bericht, VOG-status (alleen dát en wanneer, geen kopie) |
| Grondslag | Toestemming; voorbereiding van de vrijwilligersovereenkomst |
| Toegang | Beheerders en de commissie vrijwilligers |
| Bewaartermijn | 6 maanden na binnenkomst, daarna automatisch verwijderd |
| In de code | `src/collections/VolunteerApplications.ts` |

### 7. Lidmaatschapsaanvragen

| | |
| --- | --- |
| Doel | Aanvraag beoordelen |
| Betrokkenen | Aanvragers |
| Gegevens | Naam, e-mailadres, motivatie, notities van de beoordeling |
| Grondslag | Voorbereiding van de overeenkomst |
| Toegang | Alleen beheerders |
| Bewaartermijn | Afgewezen of zonder besluit: 6 maanden, daarna automatisch verwijderd. Goedgekeurd: bewaard als bewijs dat het lidmaatschap is toegekend, ook na het einde ervan (privacyverklaring 3.5) |
| In de code | `src/collections/MembershipApplications.ts` |

### 8. Leden en hun account (Mijn omgeving)

| | |
| --- | --- |
| Doel | Ledenadministratie, toegang tot de ledenomgeving |
| Betrokkenen | Leden |
| Gegevens | Naam, e-mailadres, wachtwoord (alleen versleuteld), telefoonnummer, adres, status, rol, commissie, lid sinds |
| Grondslag | Uitvoering van de overeenkomst met het lid |
| Toegang | Beheerders; het lid ziet en wijzigt de eigen gegevens |
| Bewaartermijn | 2 jaar nadat de status "beëindigd" is geworden, daarna automatisch verwijderd, samen met 9 en 10 |
| In de code | `src/collections/Members.ts`, `src/collections/Users.ts` |

### 9. Urenregistratie en taken

| | |
| --- | --- |
| Doel | Inzet van vrijwilligers bijhouden en verdelen |
| Betrokkenen | Leden |
| Gegevens | Wie, datum, uren, activiteit, commissie; toegewezen taken |
| Grondslag | Uitvoering van de overeenkomst |
| Toegang | Het lid zelf; beheerders en de betreffende commissie |
| Bewaartermijn | Zolang het lid bestaat; verdwijnt met het lid (8) |
| In de code | `src/collections/VolunteerHours.ts`, `src/collections/MemberTasks.ts` |

### 10. Inschrijvingen voor cursussen en bijeenkomsten

| | |
| --- | --- |
| Doel | Deelname regelen, voortgang en aanwezigheid bijhouden |
| Betrokkenen | Leden die zich zelf inschrijven |
| Gegevens | Wie, welke cursus of bijeenkomst, voortgang, aanwezigheid, afronding |
| Grondslag | Uitvoering van de inschrijving |
| Toegang | Het lid zelf; beheerders en de betreffende commissie |
| Bewaartermijn | Bijeenkomsten: 1 jaar na de bijeenkomst (het einde, of zonder eindtijd het begin), daarna automatisch verwijderd (privacyverklaring 3.9). Cursussen: voortgang en afronding horen bij de ledenomgeving en verdwijnen met het lid (8; privacyverklaring 3.10) |
| In de code | `src/collections/CourseEnrolments.ts`, `src/collections/EventRegistrations.ts` |

### 11. Beheeraccounts

| | |
| --- | --- |
| Doel | Toegang tot het beheergedeelte |
| Betrokkenen | Bestuursleden en vrijwilligers met een beheerrol |
| Gegevens | Naam, e-mailadres, wachtwoord (alleen versleuteld), rol, commissies |
| Grondslag | Gerechtvaardigd belang (een beveiligd beheer) |
| Toegang | Beheerders; ieder ziet het eigen account |
| Bewaartermijn | Tot het account wordt verwijderd; zie open punten |
| In de code | `src/collections/Users.ts` |

### 12. E-mail die de website verstuurt

| | |
| --- | --- |
| Doel | Bevestigingen, vooraankondigingen, wachtwoordlinks, meldingen aan het bestuur |
| Gegevens | Naam en e-mailadres van de ontvanger, inhoud van het bericht |
| Ontvanger | Namecheap (Private Email), via SMTP; verzonden berichten staan in de mailbox van de stichting |
| Bewaartermijn | Zoals de mailbox; geen aparte regel |
| In de code | `src/lib/email/` |

## Verwerkingen buiten de website

Deze staan in de privacyverklaring, maar de website doet er niets mee. Het bestuur houdt
ze bij; de website-ontwikkelaar kan ze niet controleren.

| Verwerking | Gegevens | Bewaartermijn (privacyverklaring) |
| --- | --- | --- |
| Taalmaatje | Naam, contact, taalniveau, koppeling, evaluatie | Traject + 2 jaar |
| Ondersteunde studenten | Naam, contact, opleiding, financiële situatie, toekenning, betalingen | Dossier 2 jaar na afloop; betalingen 7 jaar |
| Nieuwsbrief | Naam, e-mailadres | Tot afmelding |
| Foto's en video | Beeld van herkenbare personen, toestemming | Tot intrekking |
| Sollicitanten | Brief, cv, gespreksgegevens | 4 weken na de procedure |
| VOG | Dát hij is overgelegd, datum, kenmerk | Duur van de inzet |

## Open punten

- **Goedgekeurde lidmaatschapsaanvragen** worden zonder einddatum bewaard. Dat staat
  sinds versie 1.4 in de privacyverklaring, maar de AVG vraagt een termijn. Overweeg
  ze te verwijderen een vast aantal jaren na het einde van het lidmaatschap.
- **Beheeraccounts** hebben geen bewaartermijn. Spreek af dat een account wordt verwijderd
  zodra iemand stopt.
- **Verwerkersovereenkomsten**: controleer dat die met Vercel, Neon, Cloudflare en
  Namecheap zijn geaccepteerd. Meestal zitten ze in de voorwaarden (DPA).
