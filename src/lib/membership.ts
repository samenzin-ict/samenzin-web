/**
 * Whether the site takes applications for membership.
 *
 * Closed since 2026-10-14: the board decided that membership is not requested
 * through the website. With this false, /lid-worden answers 404, the form's
 * action refuses whatever is posted to it, and the sitemap leaves the page out.
 *
 * The form, the action and the MembershipApplications collection are kept, so
 * opening it again is this one line plus a link in the menu — not a rebuild.
 */
export const MEMBERSHIP_APPLICATIONS_OPEN = false
