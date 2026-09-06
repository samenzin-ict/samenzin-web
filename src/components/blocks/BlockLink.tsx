import Link from 'next/link'

import { Button } from '@/components/ui/button'

type BlockLinkStyle = 'cta' | 'primary' | 'outline'

export type BlockLinkData = {
  label: string
  url: string
  style: BlockLinkStyle
  id?: string | null
}

/*
 * The editor picks a role for a button; the design tokens supply the colour.
 * "primary" in the CMS is the forest-green button, which is the Button
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
 * `onCta` is set by blocks that sit on the gold band. A gold button on a gold
 * background is invisible, and an editor choosing "oproep tot actie" there has
 * no way to know that, so the choice is remapped to the forest-green button
 * rather than left to produce an unusable page.
 */
export function BlockLinks({
  links,
  onCta = false,
}: {
  links?: BlockLinkData[] | null
  onCta?: boolean
}) {
  if (!links || links.length === 0) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {links.map((link) => (
        <Button
          key={link.id ?? link.url}
          asChild
          variant={variantForStyle[onCta && link.style === 'cta' ? 'primary' : link.style]}
        >
          <Link href={link.url}>{link.label}</Link>
        </Button>
      ))}
    </div>
  )
}
