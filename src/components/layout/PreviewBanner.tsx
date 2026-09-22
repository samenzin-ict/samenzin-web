import { draftMode } from 'next/headers'

import { getMessages } from '@/i18n'

/**
 * Tells an editor that what they are looking at is not what visitors see.
 *
 * Draft mode is a cookie that outlives the page it was opened for, so without
 * something visible an editor can wander the site believing it is live. The
 * exit link is part of the point, not decoration.
 *
 * Renders nothing when draft mode is off, which is every visitor, always.
 */
export async function PreviewBanner() {
  const { isEnabled } = await draftMode()

  if (!isEnabled) return null

  const messages = getMessages()

  return (
    <div className="bg-cta text-cta-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm">
          <span className="font-semibold">{messages.previewBannerTitle}</span>{' '}
          {messages.previewBannerBody}
        </p>

        {/*
          A plain anchor, deliberately.
          
          next/link prefetches what it points at, and this target is a route
          handler whose whole job is to switch draft mode off. Prefetching it
          would end the preview merely because the banner rendered. The lint
          rule treats every internal href as a page, which this is not.
          
          It also keeps working if the page failed to hydrate.
        */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/preview/exit"
          className="shrink-0 text-sm font-semibold underline underline-offset-4"
        >
          {messages.previewBannerExit}
        </a>
      </div>
    </div>
  )
}
