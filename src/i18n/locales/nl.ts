/**
 * Dutch interface strings.
 *
 * These are the words the interface itself needs — labels for screen readers,
 * the skip link, the menu button. They are not content and a volunteer never
 * edits them, so they live here rather than in the CMS. Everything a visitor
 * reads as content comes from Payload.
 *
 * No Dutch string belongs in a component (CLAUDE.md rule 5). If a component
 * needs a word, add it here.
 */
export const nl = {
  skipToContent: 'Ga direct naar de inhoud',
  openMenu: 'Menu openen',
  closeMenu: 'Menu sluiten',
  mainNavigationLabel: 'Hoofdmenu',
  footerNavigationLabel: 'Links in de voettekst',
  socialNavigationLabel: 'Volg ons op sociale media',
  homeLinkLabel: 'Naar de homepagina',
  contactHeading: 'Contact',
  emptyHomeTitle: 'De website is nog niet ingericht',
  emptyHomeBody:
    'Er is nog geen pagina met het adres "home". Maak die aan in het beheerpaneel om deze homepagina te vullen.',
  emptyHomeAction: 'Naar het beheerpaneel',
  // The donation page. Shipped without a payment step until Mollie exists.
  donateTitle: 'Steun ons werk',
  donateUnavailableTitle: 'Doneren via de website is binnenkort mogelijk',
  donateUnavailableBody:
    'We ronden de laatste stappen af om online doneren mogelijk te maken. Wilt u nu al bijdragen? Neem dan contact met ons op, dan helpen we u graag verder.',
  donateUnavailableAction: 'Neem contact op',
  /*
   * Wording taken from docs/ANBI_guide.docx. The page may not promise that a
   * gift is deductible while the ANBI status is only applied for.
   */
  donateDescription: 'Gift aan Stichting Samenleving en Zingeving',
  donateAmountLabel: 'Bedrag',
  donateOtherAmount: 'Ander bedrag',
  donateFundLabel: 'Waar gaat uw gift naartoe?',
  donateFundGeneral: 'Algemeen',
  donateNameLabel: 'Naam',
  donateEmailLabel: 'E-mailadres',
  donateAnonymousLabel: 'Ik wil anoniem doneren',
  donateAnonymousHint:
    'Bij een anonieme gift bewaren wij uw naam en e-mailadres niet. U ontvangt dan ook geen donatiebevestiging.',
  donateSubmit: 'Doneer',
  donateSubmitting: 'Bezig met doorsturen…',
  donateErrorAmount: 'Vul een bedrag in van minimaal € 1.',
  donateErrorName: 'Vul uw naam in, of kies ervoor anoniem te doneren.',
  donateErrorEmail: 'Vul een geldig e-mailadres in, of kies ervoor anoniem te doneren.',
  donateErrorGeneric: 'Het doneren kon niet gestart worden. Probeer het later opnieuw.',
  donatePrivacyNotice:
    'Wij gebruiken uw naam en e-mailadres alleen om uw gift te bevestigen. Uw betaalgegevens komen nooit bij ons binnen; u betaalt bij Mollie.',
  donateThanksTitle: 'Bedankt voor uw gift',
  donateThanksBody:
    'Wij hebben uw betaling in goede orde ontvangen zodra de bank die aan ons heeft bevestigd. Duurt dat langer dan een dag, neem dan gerust contact met ons op.',
  donateThanksAction: 'Naar de homepagina',

  donateAnbiNote:
    'De stichting heeft de ANBI-status aangevraagd. Zolang deze niet is toegekend, kunnen wij niet garanderen dat uw gift aftrekbaar is voor de inkomstenbelasting. Contante giften zijn nooit aftrekbaar; doe uw gift daarom altijd per bank.',

  // The contact page and its form.
  contactFormHeading: 'Stuur ons een bericht',
  contactNameLabel: 'Naam',
  contactEmailLabel: 'E-mailadres',
  contactMessageLabel: 'Bericht',
  contactSubmit: 'Verstuur bericht',
  contactSubmitting: 'Bezig met versturen…',
  contactSuccess: 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.',
  contactErrorGeneric: 'Uw bericht kon niet worden verstuurd. Probeer het later opnieuw.',
  contactErrorTooMany:
    'U heeft kort achter elkaar meerdere berichten verstuurd. Wacht een paar minuten en probeer het opnieuw.',
  contactErrorName: 'Vul uw naam in.',
  contactErrorEmail: 'Vul een geldig e-mailadres in.',
  contactErrorMessage: 'Vul uw bericht in.',
  contactRequired: 'verplicht',
  contactPrivacyNotice:
    'Wij gebruiken uw naam en e-mailadres alleen om op uw bericht te reageren. Lees hoe wij met uw gegevens omgaan in onze privacyverklaring.',
  contactPrivacyLink: 'privacyverklaring',
  contactErrorSummary: 'Uw bericht is niet verstuurd:',
  contactOpeningHours: 'Openingstijden',
  contactAddresses: 'Adressen',

  // The ANBI page. These are the headings the Belastingdienst expects to see,
  // so they are interface labels rather than something an editor rewords.
  anbiTitle: 'ANBI-gegevens en beleid',
  anbiIntro:
    'Op deze pagina publiceren wij de gegevens die de Belastingdienst van een algemeen nut beogende instelling verlangt.',
  anbiOrganisationHeading: 'Gegevens van de stichting',
  anbiStatutoryName: 'Statutaire naam',
  anbiKvk: 'KVK-nummer',
  anbiRsin: 'RSIN / fiscaal nummer',
  anbiFoundedOn: 'Opgericht',
  anbiSeat: 'Statutaire zetel',
  anbiOperatingArea: 'Werkgebied',
  anbiAddress: 'Postadres',
  anbiEmail: 'E-mailadres',
  anbiPhone: 'Telefoon',
  anbiIban: 'Bankrekening',
  anbiFiscalYear: 'Boekjaar',
  anbiGranted: 'ANBI-status toegekend per',
  anbiObjective: 'Doelstelling',
  anbiMission: 'Missie in het kort',
  anbiPolicyHeading: 'Hoofdlijnen van het beleidsplan',
  anbiPolicyActivities: 'Wat wij doen',
  anbiPolicyIncome: 'Hoe wij onze inkomsten werven',
  anbiPolicyAssets: 'Hoe wij ons vermogen beheren en besteden',
  anbiBoard: 'Bestuur',
  anbiBoardRole: 'Functie',
  anbiBoardName: 'Naam',
  anbiRemuneration: 'Beloningsbeleid',
  anbiActivityReport: 'Activiteitenverslag',
  anbiFinancialStatement: 'Financiële verantwoording',
  anbiAnnualReports: 'Verslagen en financiële verantwoording',
  anbiDocuments: 'Documenten',
  anbiFinancialYear: 'Boekjaar',
  anbiSupport: 'Steun ons',
  anbiLastUpdated: 'Laatst bijgewerkt',
  anbiFooterLink: 'ANBI',
  anbiStatusNoticeTitle: 'Let op: de ANBI-status is aangevraagd en nog niet toegekend',

  // Projecten (ROADMAP 2.2)
  projectsTitle: 'Projecten',
  projectsIntro: 'Onze initiatieven',
  projectsEmpty: 'Er zijn nog geen projecten gepubliceerd.',
  projectsReadMore: 'Lees meer',
  projectFundingRaised: 'opgehaald',
  projectFundingOf: 'van',
  projectFundingLabel: 'Voortgang van het inzamelingsdoel',
  projectDonate: 'Doneer aan dit project',
  projectBackToOverview: 'Alle projecten',

  // Nieuws & artikelen (ROADMAP 2.3)
  articlesTitle: 'Nieuws & artikelen',
  articlesIntro: 'Verhalen en berichten over ons werk',
  articlesEmpty: 'Er zijn nog geen artikelen gepubliceerd.',
  articlesBy: 'Door',
  articlesRelated: 'Meer lezen',
  articlesTopics: 'Onderwerpen',
  articlesBackToOverview: 'Alle artikelen',

  // Agenda (ROADMAP 2.4)
  eventsTitle: 'Agenda',
  eventsIntro: 'Overzicht van onze activiteiten en evenementen',
  eventsUpcoming: 'Aankomend',
  eventsPast: 'Afgelopen',
  eventsPeriodLabel: 'Periode',
  eventsFilterCity: 'Stad',
  eventsFilterTheme: 'Thema',
  eventsFilterAudience: 'Doelgroep',
  eventsFilterAll: 'Alle',
  eventsFilterApply: 'Filteren',
  eventsFilterReset: 'Filters wissen',
  eventsFilterLegend: 'Filter de agenda',
  eventsEmptyUpcoming: 'Er staan op dit moment geen activiteiten gepland.',
  eventsEmptyPast: 'Er zijn nog geen afgelopen activiteiten.',
  eventsEmptyFiltered: 'Geen activiteiten gevonden met deze filters.',
  eventsFree: 'Gratis',
  eventsRegister: 'Aanmelden',
  eventsDate: 'Datum',
  eventsTime: 'Tijd',
  eventsLocation: 'Locatie',
  eventsCapacity: 'Capaciteit',
  eventsPeople: 'personen',
  eventsPrice: 'Prijs',
  eventsSpotsLeft: 'plaatsen beschikbaar',
  eventsBackToOverview: 'Terug naar de agenda',

  previewBannerTitle: 'U bekijkt een voorbeeld',
  previewBannerBody:
    'Deze pagina is nog niet gepubliceerd, of u ziet een versie die afwijkt van de gepubliceerde. Bezoekers zien dit niet.',
  previewBannerExit: 'Voorbeeld verlaten',

  errorTitle: 'Er is iets misgegaan',
  errorBody:
    'Door een storing kon deze pagina niet geladen worden. Probeer het opnieuw. Blijft het misgaan, neem dan contact met ons op.',
  errorRetry: 'Probeer opnieuw',
  errorHome: 'Naar de homepagina',

  notFoundTitle: 'Deze pagina bestaat niet',
  notFoundBody:
    'De pagina die u zoekt is verplaatst of bestaat niet meer. Ga terug naar de homepagina om verder te zoeken.',
  notFoundAction: 'Naar de homepagina',
} as const

export type Messages = typeof nl
