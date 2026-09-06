import type { Access } from 'payload'

/**
 * Everyone, signed in or not. Only for content that is meant to be on the
 * public website, such as pages and the images they use.
 *
 * Never use this on anything holding personal data.
 */
export const isPublic: Access = () => true
