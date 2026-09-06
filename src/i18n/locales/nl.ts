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
  donateAnbiNote:
    'Wij hebben ANBI-status in aanvraag. Zodra deze is toegekend, is uw gift fiscaal aftrekbaar.',

  // The contact page and its form.
  contactFormHeading: 'Stuur ons een bericht',
  contactNameLabel: 'Naam',
  contactEmailLabel: 'E-mailadres',
  contactMessageLabel: 'Bericht',
  contactSubmit: 'Verstuur bericht',
  contactSubmitting: 'Bezig met versturen…',
  contactSuccess: 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.',
  contactErrorGeneric: 'Uw bericht kon niet worden verstuurd. Probeer het later opnieuw.',
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
  anbiTitle: 'ANBI-gegevens',
  anbiIntro:
    'Op deze pagina publiceren wij de gegevens die de Belastingdienst van een algemeen nut beogende instelling verlangt.',
  anbiStatutoryName: 'Statutaire naam',
  anbiRsin: 'RSIN',
  anbiKvk: 'KVK-nummer',
  anbiContact: 'Contactgegevens',
  anbiEmail: 'E-mailadres',
  anbiPhone: 'Telefoonnummer',
  anbiAddress: 'Postadres',
  anbiObjective: 'Doelstelling',
  anbiPolicyPlan: 'Beleidsplan',
  anbiPolicyPlanDocument: 'Download het beleidsplan',
  anbiRemuneration: 'Beloningsbeleid',
  anbiBoard: 'Bestuurssamenstelling',
  anbiAnnualReports: 'Verslagen en financiële verantwoording',
  anbiActivityReport: 'Verslag van de activiteiten',
  anbiFinancialStatement: 'Financiële verantwoording',
  anbiDocuments: 'Documenten',
  anbiFinancialYear: 'Boekjaar',

  notFoundTitle: 'Deze pagina bestaat niet',
  notFoundBody:
    'De pagina die u zoekt is verplaatst of bestaat niet meer. Ga terug naar de homepagina om verder te zoeken.',
  notFoundAction: 'Naar de homepagina',
} as const

export type Messages = typeof nl
