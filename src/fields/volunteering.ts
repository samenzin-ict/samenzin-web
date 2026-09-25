/**
 * The choices on the volunteer intake form.
 *
 * Taken from docs/design/07-vrijwilliger-aanmeldformulier.png, which is the
 * only place that says what the form collects. One list per question, shared
 * between the collection, the form and the confirmation step, so the three
 * cannot drift apart.
 *
 * Adding an option means adding a line here and a migration, because these are
 * enums in the database.
 */

export const INTEREST_OPTIONS = [
  { label: 'Taalmaatje', value: 'taalmaatje' },
  { label: 'Onderwijs', value: 'onderwijs' },
  { label: 'Evenementen', value: 'evenementen' },
  { label: 'Fondsenwerving', value: 'fondsenwerving' },
  { label: 'Media', value: 'media' },
  { label: 'Dames-activiteiten', value: 'dames-activiteiten' },
] as const

export const SKILL_OPTIONS = [
  { label: 'Ontwerp', value: 'ontwerp' },
  { label: 'Sociale media', value: 'sociale-media' },
  { label: 'Teksten schrijven', value: 'teksten-schrijven' },
  { label: 'Taalcoaching', value: 'taalcoaching' },
  { label: 'Evenementenbeheer', value: 'evenementenbeheer' },
] as const

/**
 * Dutch language level, on the European scale the rest of the sector uses.
 * "Moedertaal" is there because plenty of volunteers are native speakers and
 * would otherwise have to pick a level that does not describe them.
 */
export const LANGUAGE_LEVEL_OPTIONS = [
  { label: 'A1 — beginner', value: 'a1' },
  { label: 'A2 — basis', value: 'a2' },
  { label: 'B1 — gevorderd', value: 'b1' },
  { label: 'B2 — zelfstandig', value: 'b2' },
  { label: 'C1 — vergevorderd', value: 'c1' },
  { label: 'C2 — near-native', value: 'c2' },
  { label: 'Moedertaal', value: 'moedertaal' },
] as const

/** The three cities the mockup's Locatie dropdown offers. */
export const CITY_OPTIONS = [
  { label: 'Tilburg', value: 'tilburg' },
  { label: 'Schiedam', value: 'schiedam' },
  { label: 'Rotterdam', value: 'rotterdam' },
] as const

export const AVAILABILITY_DAYS = [
  { label: 'Ma', value: 'ma', full: 'maandag' },
  { label: 'Di', value: 'di', full: 'dinsdag' },
  { label: 'Wo', value: 'wo', full: 'woensdag' },
  { label: 'Do', value: 'do', full: 'donderdag' },
  { label: 'Vr', value: 'vr', full: 'vrijdag' },
  { label: 'Za', value: 'za', full: 'zaterdag' },
  { label: 'Zo', value: 'zo', full: 'zondag' },
] as const

export const AVAILABILITY_PARTS = [
  { label: 'Ochtend', value: 'ochtend' },
  { label: 'Middag', value: 'middag' },
  { label: 'Avond', value: 'avond' },
] as const

/**
 * The grid flattened into single values, because that is what a checkbox grid
 * posts and what a coordinator filters on. "wo-avond" reads well enough in the
 * admin panel that it needs no decoding.
 */
export const AVAILABILITY_OPTIONS = AVAILABILITY_DAYS.flatMap((day) =>
  AVAILABILITY_PARTS.map((part) => ({
    label: `${day.full} ${part.label.toLowerCase()}`,
    value: `${day.value}-${part.value}`,
  })),
)

/**
 * Built from the two lists rather than written out, so the grid and the
 * database enum cannot disagree. Payload generates the same union.
 */
export type AvailabilityValue =
  `${(typeof AVAILABILITY_DAYS)[number]['value']}-${(typeof AVAILABILITY_PARTS)[number]['value']}`

export type InterestValue = (typeof INTEREST_OPTIONS)[number]['value']
export type SkillValue = (typeof SKILL_OPTIONS)[number]['value']
export type LanguageLevelValue = (typeof LANGUAGE_LEVEL_OPTIONS)[number]['value']
export type CityValue = (typeof CITY_OPTIONS)[number]['value']

const valueSet = (options: readonly { value: string }[]) =>
  new Set(options.map((option) => option.value))

const interestValues = valueSet(INTEREST_OPTIONS)
const skillValues = valueSet(SKILL_OPTIONS)
const languageValues = valueSet(LANGUAGE_LEVEL_OPTIONS)
const cityValues = valueSet(CITY_OPTIONS)
const availabilityValues = valueSet(AVAILABILITY_OPTIONS)

/*
 * Guards, so nothing a visitor posts reaches the database unchecked. A select
 * in a browser only offers what it is given, but a form post is not a browser.
 */
export const isInterest = (v: string): v is InterestValue => interestValues.has(v)
export const isSkill = (v: string): v is SkillValue => skillValues.has(v)
export const isLanguageLevel = (v: string): v is LanguageLevelValue => languageValues.has(v)
export const isCity = (v: string): v is CityValue => cityValues.has(v)
export const isAvailability = (v: string): v is AvailabilityValue => availabilityValues.has(v)

export const labelFor = (options: readonly { label: string; value: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value
