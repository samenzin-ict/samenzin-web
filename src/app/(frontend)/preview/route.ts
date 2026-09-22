import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { PayloadRequest } from 'payload'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Turns Next's draft mode on, so an editor can look at an unpublished page on
 * the real site.
 *
 * Draft mode is a cookie, and a cookie that reveals unpublished content has to
 * be earned. Two things are checked before it is set:
 *
 *  - the secret, which proves the link came from the admin panel rather than
 *    being typed by someone who guessed the address;
 *  - a valid Payload session, which proves who is asking.
 *
 * The secret alone would not be enough. It travels in a URL, and URLs end up
 * in browser history, chat messages and server logs.
 *
 * Only relative paths are accepted. Without that check this route would
 * forward anyone anywhere, which is a phishing tool with our domain on it.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')
  const expectedSecret = process.env.PREVIEW_SECRET?.trim()

  if (!expectedSecret) {
    console.error('PREVIEW_SECRET is not set, so preview is switched off')
    return new Response('Preview is not configured', { status: 503 })
  }

  if (previewSecret !== expectedSecret) {
    return new Response('Niet toegestaan', { status: 403 })
  }

  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    // "//evil.example" is protocol-relative and would leave the site.
    return new Response('Ongeldig adres', { status: 400 })
  }

  const payload = await getPayloadClient()

  let user

  try {
    const result = await payload.auth({
      req: request as unknown as PayloadRequest,
      headers: request.headers,
    })
    user = result.user
  } catch (error) {
    console.error('Could not verify the session for preview', error)
    return new Response('Niet toegestaan', { status: 403 })
  }

  if (!user) {
    return new Response('Niet toegestaan', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
