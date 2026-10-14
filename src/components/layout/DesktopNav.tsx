'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

import type { NavItem, NavLink } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const isCurrent = (pathname: string, url: string) =>
  url === '/' ? pathname === '/' : pathname === url || pathname.startsWith(`${url}/`)

const itemClass =
  'inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-3 text-foreground hover:text-primary'

/**
 * One submenu: a button that opens a short list of links under it.
 *
 * The disclosure pattern, not an ARIA menu: these are ordinary links, and a
 * menu role would make a screen reader expect arrow-key behaviour that a list
 * of links does not have. The button says whether it is open; Escape closes
 * it and puts focus back on the button; so does clicking or tabbing away.
 *
 * It also opens on hover, because that is what a mouse user expects of a
 * menu bar, with a short delay on leaving so a diagonal move from the label
 * to the second link does not shut it.
 */
function Group({ label, links, pathname }: { label: string; links: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const root = useRef<HTMLLIElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointer = useRef<string>('')

  const active = links.some((link) => isCurrent(pathname, link.url))

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  // Navigating closes it, the same way the mobile menu does.
  const [openedOn, setOpenedOn] = useState(pathname)
  if (openedOn !== pathname) {
    setOpenedOn(pathname)
    setOpen(false)
  }

  const enter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setOpen(true)
  }
  const leave = () => {
    leaveTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <li
      ref={root}
      className="relative"
      onPointerEnter={(event) => event.pointerType === 'mouse' && enter()}
      onPointerLeave={(event) => event.pointerType === 'mouse' && leave()}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onPointerDown={(event) => {
          pointer.current = event.pointerType
        }}
        /*
         * A mouse has already opened it by hovering, so a click on the label
         * must not shut it again. Keyboard and touch toggle.
         */
        onClick={() => {
          // Read now: the updater below runs later, after the reset.
          const byMouse = pointer.current === 'mouse'
          pointer.current = ''
          setOpen((value) => (byMouse ? true : !value))
        }}
        className={cn(itemClass, active && 'font-semibold text-primary')}
      >
        {label}
        <ChevronDown aria-hidden className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        // pt-2 rather than a margin: the gap stays part of the hover area.
        className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2"
      >
        <ul className="min-w-52 rounded-xl bg-card p-2 shadow-lg ring-1 ring-black/5">
          {links.map((link) => {
            const current = isCurrent(pathname, link.url)

            return (
              <li key={link.id}>
                <Link
                  href={link.url}
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center rounded-lg px-3 text-foreground hover:bg-muted hover:text-primary',
                    current && 'font-semibold text-primary',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </li>
  )
}

/** The menu bar on a wide screen: links, and labels that open a submenu. */
export function DesktopNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname()

  if (items.length === 0) return null

  return (
    <nav aria-label={label} className="hidden flex-1 justify-center lg:flex">
      <ul className="flex items-center gap-1">
        {items.map((item) =>
          'children' in item ? (
            <Group key={item.id} label={item.label} links={item.children} pathname={pathname} />
          ) : (
            <li key={item.id}>
              <Link
                href={item.url}
                aria-current={isCurrent(pathname, item.url) ? 'page' : undefined}
                className={cn(itemClass, isCurrent(pathname, item.url) && 'font-semibold text-primary')}
              >
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
