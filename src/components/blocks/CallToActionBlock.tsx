import { BlockLinks, type BlockLinkData } from '@/components/blocks/BlockLink'
import { Container } from '@/components/layout/Container'

/**
 * A band asking the visitor to do something, modelled on the gold call to
 * action in the design system.
 *
 * The heading is an h2: the page already has its h1, and a jump from h1 to h3
 * would break the outline.
 */
export function CallToActionBlock({
  heading,
  text,
  links,
}: {
  heading: string
  text?: string | null
  links?: BlockLinkData[] | null
}) {
  return (
    <Container className="py-10 md:py-14">
      <div className="rounded-lg bg-cta px-6 py-10 text-cta-foreground md:px-10">
        <div className="max-w-prose space-y-4">
          <h2 className="font-heading text-2xl text-cta-foreground md:text-3xl">{heading}</h2>
          {text ? <p className="text-base">{text}</p> : null}
          <BlockLinks links={links} onCta />
        </div>
      </div>
    </Container>
  )
}
