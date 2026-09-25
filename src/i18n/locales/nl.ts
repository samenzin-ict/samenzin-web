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

  // Vrijwilligers (ROADMAP 2.6)
  volunteerTitle: 'Vrijwilliger worden',
  volunteerIntro:
    'Wilt u meehelpen? Laat hieronder uw gegevens achter, dan nemen wij contact met u op.',
  volunteerNameLabel: 'Naam',
  volunteerEmailLabel: 'E-mailadres',
  volunteerInterestLabel: 'Waar wilt u bij helpen?',
  volunteerInterestAny: 'Geen voorkeur',
  volunteerMessageLabel: 'Vertel kort iets over uzelf',
  volunteerSubmit: 'Aanmelden',
  volunteerSubmitting: 'Bezig met versturen…',
  volunteerSuccess:
    'Bedankt voor uw aanmelding. Wij nemen zo snel mogelijk contact met u op.',
  volunteerErrorName: 'Vul uw naam in.',
  volunteerErrorEmail: 'Vul een geldig e-mailadres in.',
  volunteerErrorGeneric: 'Uw aanmelding kon niet worden verstuurd. Probeer het later opnieuw.',
  volunteerErrorTooMany:
    'U heeft kort achter elkaar meerdere aanmeldingen verstuurd. Wacht een paar minuten en probeer het opnieuw.',
  volunteerPrivacyNotice:
    'Wij gebruiken uw gegevens alleen om contact met u op te nemen over vrijwilligerswerk, en bewaren ze niet langer dan zes maanden. Lees hoe wij met uw gegevens omgaan in onze',
  volunteerPrivacyLink: 'privacyverklaring',
  volunteerRequired: 'verplicht',

  // Word vrijwilliger, de vier stappen van docs/design/07
  volunteerStepDetails: 'Gegevens',
  volunteerStepInterests: 'Interesses',
  volunteerStepAvailability: 'Beschikbaarheid',
  volunteerStepConfirm: 'Bevestiging',
  volunteerStepsLabel: 'Stappen van het aanmeldformulier',
  volunteerStepOf: 'Stap %s van 4',
  volunteerIntakeNotice: 'Na je aanmelding nodigen we je uit voor een kort intake-gesprek.',
  volunteerNext: 'Volgende stap',
  volunteerBack: 'Vorige stap',
  volunteerPhoneLabel: 'Telefoonnummer',
  volunteerInterestsLabel: 'Interesses',
  volunteerInterestsHint: 'Kies waar u aan mee wilt helpen. Meerdere antwoorden mogelijk.',
  volunteerSkillsLabel: 'Vaardigheden',
  volunteerSkillsHint: 'Waar bent u goed in? Meerdere antwoorden mogelijk.',
  volunteerLanguageLabel: 'Taalniveau Nederlands',
  volunteerLanguagePlaceholder: 'Selecteer niveau',
  volunteerCityLabel: 'Locatie',
  volunteerCityPlaceholder: 'Stad',
  volunteerAvailabilityLabel: 'Beschikbaarheid',
  volunteerAvailabilityHint:
    'Kruis de dagdelen aan waarop u meestal kunt. U zit hier niet aan vast.',
  volunteerAvailabilityNone: 'Nog geen dagdelen aangekruist.',
  volunteerConfirmTitle: 'Klopt alles?',
  volunteerConfirmIntro: 'Controleer uw antwoorden en verstuur de aanmelding.',
  volunteerConfirmEdit: 'Wijzigen',
  volunteerConfirmSubmit: 'Aanmelding versturen',
  volunteerConfirmNothing: 'Niets ingevuld',
  volunteerErrorPhone: 'Vul een geldig telefoonnummer in, of laat het veld leeg.',
  volunteerErrorInterests: 'Kies ten minste één interesse.',
  volunteerErrorStart: 'Begin bij de eerste stap.',
  volunteerErrorExpired:
    'Uw aanmelding is verlopen omdat er te veel tijd tussen zat. Vul het formulier opnieuw in.',


  // Lid worden (ROADMAP 3.1)
  membershipTitle: 'Lid worden',
  membershipIntro:
    'Wilt u lid worden van onze stichting? Laat hieronder uw gegevens achter. Het bestuur bekijkt elke aanvraag en neemt daarna contact met u op.',
  membershipNameLabel: 'Naam',
  membershipEmailLabel: 'E-mailadres',
  membershipMotivationLabel: 'Waarom wilt u lid worden?',
  membershipSubmit: 'Aanvraag versturen',
  membershipSubmitting: 'Bezig met versturen…',
  membershipSuccess:
    'Bedankt voor uw aanvraag. Het bestuur bekijkt uw aanvraag en neemt daarna contact met u op. U bent nog geen lid.',
  membershipErrorName: 'Vul uw naam in.',
  membershipErrorEmail: 'Vul een geldig e-mailadres in.',
  membershipErrorGeneric: 'Uw aanvraag kon niet worden verstuurd. Probeer het later opnieuw.',
  membershipErrorTooMany:
    'U heeft kort achter elkaar meerdere aanvragen verstuurd. Wacht een paar minuten en probeer het opnieuw.',
  membershipPrivacyNotice:
    'Wij gebruiken uw gegevens alleen om uw aanvraag te beoordelen en contact met u op te nemen. Wordt u geen lid, dan verwijderen wij ze binnen zes maanden. Lees hoe wij met uw gegevens omgaan in onze',
  membershipPrivacyLink: 'privacyverklaring',
  membershipRequired: 'verplicht',
  membershipNoPaymentNotice:
    'Wij vragen in dit formulier niet om uw adres, geboortedatum of bankgegevens. Die zijn pas nodig als uw aanvraag is goedgekeurd.',

  // Cursussen (ROADMAP 3.4, de openbare catalogus)
  coursesTitle: 'Cursussen',
  coursesIntro: 'Ons aanbod van cursussen en trainingen',
  coursesEmpty: 'Er zijn op dit moment geen cursussen gepubliceerd.',
  coursesLevel: 'Niveau',
  coursesDuration: 'Duur',
  coursesStarts: 'Start',
  coursesStartsRolling: 'Doorlopend',
  coursesPrice: 'Deelname',
  coursesRegister: 'Aanmelden',
  coursesBackToOverview: 'Alle cursussen',

  // Mijn omgeving (ROADMAP 3.2)
  portalTitle: 'Mijn omgeving',
  portalGreeting: 'Hoi',
  portalNavOverview: 'Overzicht',
  portalNavDetails: 'Mijn gegevens',
  portalLogout: 'Uitloggen',
  portalMemberSince: 'Lid sinds',
  portalLoginTitle: 'Inloggen',
  portalLoginIntro:
    'Log in op Mijn omgeving. Heeft u nog geen inloggegevens? Neem dan contact met ons op.',
  portalLoginEmailLabel: 'E-mailadres',
  portalLoginPasswordLabel: 'Wachtwoord',
  portalLoginSubmit: 'Inloggen',
  portalLoginSubmitting: 'Bezig met inloggen\u2026',
  portalLoginFailed: 'Het e-mailadres of wachtwoord klopt niet.',
  portalLoginLocked:
    'Dit account is tijdelijk geblokkeerd na te veel mislukte pogingen. Probeer het over een kwartier opnieuw.',
  portalLoginTooMany:
    'U heeft kort achter elkaar te vaak geprobeerd in te loggen. Wacht een paar minuten en probeer het opnieuw.',
  portalLoginNoAccount:
    'Wachtwoord vergeten? Neem contact met ons op; wij kunnen een nieuw wachtwoord voor u instellen.',
  portalOverviewIntro:
    'Hier vindt u uw uren, uw lidmaatschap en uw gegevens. In een volgende fase komen hier ook uw taken, cursussen en evenementen bij.',
  portalDetailsTitle: 'Mijn gegevens',
  portalDetailsIntro: 'Controleer uw contactgegevens en pas ze aan als er iets verandert.',
  portalDetailsNameLabel: 'Naam',
  portalDetailsEmailLabel: 'E-mailadres',
  portalDetailsEmailFixed: 'Neem contact met ons op als uw e-mailadres moet wijzigen.',
  portalDetailsPhoneLabel: 'Telefoonnummer',
  portalDetailsStreetLabel: 'Straat en huisnummer',
  portalDetailsPostalCodeLabel: 'Postcode',
  portalDetailsCityLabel: 'Plaats',
  portalDetailsSave: 'Gegevens opslaan',
  portalDetailsSaving: 'Bezig met opslaan\u2026',
  portalDetailsSaved: 'Uw gegevens zijn opgeslagen.',
  portalDetailsError: 'Uw gegevens konden niet worden opgeslagen. Probeer het later opnieuw.',
  portalPasswordTitle: 'Wachtwoord wijzigen',
  portalPasswordCurrentLabel: 'Huidig wachtwoord',
  portalPasswordNewLabel: 'Nieuw wachtwoord',
  portalPasswordRepeatLabel: 'Herhaal het nieuwe wachtwoord',
  portalPasswordHint: 'Gebruik minimaal 12 tekens.',
  portalPasswordSubmit: 'Wachtwoord wijzigen',
  portalPasswordSubmitting: 'Bezig met wijzigen\u2026',
  portalPasswordSaved: 'Uw wachtwoord is gewijzigd.',
  portalPasswordWrongCurrent: 'Uw huidige wachtwoord klopt niet.',
  portalPasswordTooShort: 'Gebruik minimaal 12 tekens.',
  portalPasswordMismatch: 'De twee nieuwe wachtwoorden zijn niet gelijk.',
  portalPasswordError: 'Uw wachtwoord kon niet worden gewijzigd. Probeer het later opnieuw.',
  portalStatusEnded:
    'Uw lidmaatschap is beëindigd. Neem contact met ons op als dat niet klopt.',
  portalRequired: 'verplicht',
  portalNavHours: 'Mijn uren',
  portalHoursTitle: 'Mijn uren',
  portalHoursIntro:
    'Houd hier bij hoeveel tijd u als vrijwilliger heeft besteed. U kunt uw eigen invoer altijd aanpassen of verwijderen.',
  portalHoursAddTitle: 'Uren toevoegen',
  portalHoursDateLabel: 'Datum',
  portalHoursHoursLabel: 'Aantal uren',
  portalHoursActivityLabel: 'Wat heeft u gedaan?',
  portalHoursCommissionLabel: 'Voor welke commissie?',
  portalHoursCommissionNone: 'Geen specifieke commissie',
  portalHoursSubmit: 'Uren opslaan',
  portalHoursSubmitting: 'Bezig met opslaan\u2026',
  portalHoursSaved: 'Uw uren zijn opgeslagen.',
  portalHoursDeleted: 'De invoer is verwijderd.',
  portalHoursDelete: 'Verwijderen',
  portalHoursDeleteLabel: 'Verwijder de uren van',
  portalHoursEmpty: 'U heeft nog geen uren ingevoerd.',
  portalHoursTotalThisYear: 'Totaal dit jaar',
  portalHoursTotalAll: 'Totaal sinds het begin',
  portalHoursUnit: 'uur',
  portalHoursErrorDate: 'Vul een datum in die niet in de toekomst ligt.',
  portalHoursErrorHours: 'Vul een aantal uren in tussen 0,25 en 24.',
  portalHoursErrorActivity: 'Vul kort in wat u heeft gedaan.',
  portalHoursErrorGeneric: 'Uw uren konden niet worden opgeslagen. Probeer het later opnieuw.',
  portalHoursErrorDelete: 'De invoer kon niet worden verwijderd. Probeer het later opnieuw.',
  portalHoursTableDate: 'Datum',
  portalHoursTableHours: 'Uren',
  portalHoursTableActivity: 'Activiteit',
  portalHoursTableCommission: 'Commissie',
  portalHoursTableActions: 'Acties',


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
