/*
 * A field no person can see, positioned off screen and hidden from screen
 * readers. Automated submitters fill in every input they find, so a value here
 * is a reliable sign of a bot.
 *
 * This is why there is no CAPTCHA: reCAPTCHA and hCaptcha are third-party
 * trackers, which CLAUDE.md rule 4 rules out and which would force a cookie
 * banner. A honeypot costs nothing and sends no visitor data anywhere.
 *
 * It lives in its own module rather than in actions.ts because a 'use server'
 * file may only export async functions. Exporting this constant from there
 * left it undefined on the client, so the input rendered with no name, was
 * never submitted, and the check never fired.
 */
export const HONEYPOT_FIELD = 'website'
