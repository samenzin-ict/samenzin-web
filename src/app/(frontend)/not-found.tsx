import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'

/**
 * The 404 page, required for phase 1 (ROADMAP.md).
 *
 * Wording comes from the locale file, not from this component, so it can be
 * translated when a second locale is added.
 */
export default function NotFound() {
  const messages = getMessages()

  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-prose space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.notFoundTitle}</h1>
        <p>{messages.notFoundBody}</p>
        <Button asChild>
          <Link href="/">{messages.notFoundAction}</Link>
        </Button>
      </div>
    </Container>
  )
}
