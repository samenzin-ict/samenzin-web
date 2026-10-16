'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'

import type { Messages } from '@/i18n'
import type { NavItem, NavLink } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/**
 * The navigation for small screens.
 *
 * A client component because it holds open/closed state; the header around it
 * stays a server component so the content still arrives with the page.
 *
 * Keyboard and screen reader behaviour, all of it required rather than
 * decorative: the button reports its state with aria-expanded and points at
 * the panel it controls, Escape closes the panel and returns focus to the
 * button that opened it, and the page behind the panel cannot be scrolled
 * while it is open.
 *
 * A submenu of the desktop bar is a collapsible item here too, with a chevron
 * that turns, and its links indented under it. Shown open with only a small
 * label above them, the sub-links looked like ordinary items and the grouping
 * was lost. A group opens by itself when the current page is in it.
 */
export function MobileMenu({
  items,
  messages,
}: {
  items: NavItem[]
  messages: Messages
}) {
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  /*
   * The panel remembers which page it was opened on rather than holding a
   * plain boolean. Navigating to another page then closes it on its own,
   * because the remembered path no longer matches the current one. Deriving it
   * this way avoids an effect that would set state after every navigation.
   */
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null)
  const isOpen = openedOnPath === pathname

  const close = () => setOpenedOnPath(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      close()
      buttonRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    // Stop the page behind the panel from scrolling under the finger.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (items.length === 0) return null

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpenedOnPath(isOpen ? null : pathname)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? messages.closeMenu : messages.openMenu}
        className="inline-flex size-11 items-center justify-center rounded-md text-primary"
      >
        {isOpen ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        // Scrolls on its own: the page behind it is locked while it is open.
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-card shadow-lg"
      >
        <nav aria-label={messages.mainNavigationLabel}>
          <ul className="flex flex-col py-2">
            {items.map((item) =>
              'children' in item ? (
                <MobileGroup key={item.id} label={item.label} links={item.children} pathname={pathname} />
              ) : (
                <li key={item.id}>
                  <MenuLink link={item} pathname={pathname} />
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </div>
  )
}

function MobileGroup({
  label,
  links,
  pathname,
}: {
  label: string
  links: NavLink[]
  pathname: string
}) {
  const listId = useId()
  const [open, setOpen] = useState(() => links.some((link) => link.url === pathname))

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left text-base text-foreground"
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn('size-5 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      <ul id={listId} hidden={!open} className="mx-4 mb-2 border-l-2 border-accent/30 bg-muted/40">
        {links.map((link) => (
          <li key={link.id}>
            <MenuLink link={link} pathname={pathname} nested />
          </li>
        ))}
      </ul>
    </li>
  )
}

function MenuLink({ link, pathname, nested = false }: { link: NavLink; pathname: string; nested?: boolean }) {
  const isCurrent = pathname === link.url

  return (
    <Link
      href={link.url}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center px-4 py-3 text-base text-foreground',
        nested && 'py-2.5 pl-5 text-[0.9375rem]',
        isCurrent && 'font-semibold text-primary',
      )}
    >
      {link.label}
    </Link>
  )
}
