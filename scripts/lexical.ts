/**
 * Building Lexical editor state for the loader scripts.
 *
 * The texts the board writes arrive as Word files and are converted to a
 * simple list of paragraphs, headings and bullet lists. Payload stores rich
 * text as Lexical's own serialised state, so something has to put those into
 * its shape. This is that something, in one place rather than once per loader,
 * because two copies would drift and the second one to drift would produce a
 * page that renders almost right.
 *
 * Built as plain objects rather than through Lexical's own types: Payload's
 * field expects an index signature that the exported SerializedEditorState does
 * not carry, and casting to it only moves the problem.
 */

export type TextBlock =
  | { type: 'p' | 'h2' | 'h3'; text: string }
  | { type: 'ul'; items: string[] }

/** Lexical's shape for a run of plain text. */
const textNode = (text: string) => ({
  type: 'text',
  text,
  mode: 'normal',
  style: '',
  detail: 0,
  format: 0,
  version: 1,
})

const container = (type: string, children: unknown[], extra: Record<string, unknown> = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

const node = (block: TextBlock) => {
  if (block.type === 'ul') {
    return container(
      'list',
      block.items.map((item, index) => container('listitem', [textNode(item)], { value: index + 1 })),
      { listType: 'bullet', start: 1, tag: 'ul' },
    )
  }

  if (block.type === 'h2' || block.type === 'h3') {
    return container('heading', [textNode(block.text)], { tag: block.type })
  }

  return container('paragraph', [textNode(block.text)], { textFormat: 0, textStyle: '' })
}

/** A list of blocks as Lexical's editor state. */
export const toLexical = (blocks: TextBlock[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: blocks.map(node),
  },
})

/** The common case: a few paragraphs, nothing else. */
export const paragraphsToLexical = (texts: string[]) =>
  toLexical(texts.map((text) => ({ type: 'p' as const, text })))
