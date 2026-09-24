'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Container } from '@/components/layout/Container'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * The tabs of Mijn omgeving.
 *
 * aria-current marks the open tab for a screen reader, so the underline is not
 * the only thing that says where you are.
 */
export function PortalNav({ messages }: { messages: Messages }) {
  const pathname = usePathname()

  const items = [
    { href: '/mijn', label: messages.portalNavOverview },
    { href: '/mijn/gegevens', label: messages.portalNavDetails },
  ]

  return (
    <Container>
      <nav aria-label={messages.portalTitle}>
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => {
            const isCurrent = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center border-b-2 px-3 text-sm',
                    isCurrent
                      ? 'border-accent font-semibold text-primary'
                      : 'border-transparent hover:border-border',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </Container>
  )
}
