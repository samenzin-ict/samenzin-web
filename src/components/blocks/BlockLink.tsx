import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BlockLinkStyle = 'cta' | 'primary' | 'outline'

export type BlockLinkData = {
  label: string
  url: string
  style: BlockLinkStyle
  id?: string | null
}

/*
 * The editor picks a role for a button; the design tokens supply the colour.
 * "primary" in the CMS is the navy button, which is the Button
 * component's default variant.
 */
const variantForStyle = {
  cta: 'cta',
  primary: 'default',
  outline: 'outline',
} as const

/**
 * The buttons belonging to a block, or nothing when there are none.
 *
 * `onCta` is set by blocks that sit on the ochre band. An ochre button on an ochre
 * background is invisible, and an editor choosing "oproep tot actie" there has
 * no way to know that, so the choice is remapped to the navy button
 * rather than left to produce an unusable page.
 */
export function BlockLinks({
  links,
  onCta = false,
  onDark = false,
  raised = false,
}: {
  links?: BlockLinkData[] | null
  onCta?: boolean
  /*
   * Set by blocks sitting on the deep green. The outline button is white
   * filled by default, which on a dark ground reads as a solid block rather
   * than the light outline the mockup draws, so it becomes a ghost outline
   * instead.
   */
  onDark?: boolean
  /*
   * Set when the buttons sit directly on a photograph. A shadow lifts them
   * off it, so they read as buttons rather than as part of the picture.
   */
  raised?: boolean
}) {
  if (!links || links.length === 0) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {links.map((link) => (
        <Button
          key={link.id ?? link.url}
          asChild
          variant={variantForStyle[onCta && link.style === 'cta' ? 'primary' : link.style]}
          className={cn(
            onDark &&
              link.style === 'outline' &&
              'border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10',
            raised && 'shadow-md',
          )}
        >
          <Link href={link.url}>{link.label}</Link>
        </Button>
      ))}
    </div>
  )
}
