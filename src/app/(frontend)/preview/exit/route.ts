import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Leaves draft mode.
 *
 * Needed because the cookie otherwise stays set for the rest of the session,
 * and an editor who forgets would keep seeing unpublished content while
 * believing they were looking at the live site.
 *
 * No secret and no session required: switching this off is always safe.
 */
export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const safePath = path && path.startsWith('/') && !path.startsWith('//') ? path : '/'

  redirect(safePath)
}
