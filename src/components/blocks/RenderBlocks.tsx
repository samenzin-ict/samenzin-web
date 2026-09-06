import { CallToActionBlock } from '@/components/blocks/CallToActionBlock'
import { HeroBlock } from '@/components/blocks/HeroBlock'
import { RichTextBlock } from '@/components/blocks/RichTextBlock'
import type { Page } from '@/payload-types'

type Block = NonNullable<Page['body']>[number]

/**
 * Turns the blocks an editor assembled in the CMS into the page.
 *
 * The switch is exhaustive over blockType. Adding a block to
 * src/blocks/ without adding it here is a compile error rather than a gap that
 * silently renders nothing, because the default branch assigns the remaining
 * union member to never.
 */
function RenderBlock({ block }: { block: Block }) {
  switch (block.blockType) {
    case 'hero':
      return (
        <HeroBlock
          heading={block.heading}
          intro={block.intro}
          links={block.links}
          image={block.image}
          stats={block.stats}
        />
      )

    case 'richText':
      return <RichTextBlock content={block.content} />

    case 'callToAction':
      return <CallToActionBlock heading={block.heading} text={block.text} links={block.links} />

    default: {
      const unhandled: never = block
      /*
       * Unreachable while the switch is exhaustive. Kept so a block added to
       * the CMS without a component here fails the build instead of rendering
       * a blank space on a live page.
       */
      void unhandled
      return null
    }
  }
}

export function RenderBlocks({ blocks }: { blocks?: Page['body'] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id ?? `${block.blockType}`} block={block} />
      ))}
    </>
  )
}
