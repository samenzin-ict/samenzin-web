import 'server-only'

import type { EmailBlock, EmailContent } from './types'

/**
 * The shell every message is rendered into, and its plain-text twin.
 *
 * Deliberately plain. Email clients strip stylesheets, ignore custom fonts and
 * disagree about everything else, so this is a single centred table with inline
 * styles and no images. A message that arrives readable in Outlook, Gmail and
 * Apple Mail is worth more than one that is pretty in one of them.
 *
 * Every message is sent as HTML *and* text. The text part is not a courtesy:
 * a screen reader, a text-only client and a spam filter all prefer it, and a
 * message with no text part scores worse on delivery.
 */

/*
 * The palette, copied from src/styles/brand.css.
 *
 * That file says to change a colour there and nowhere else, and this is the one
 * place that cannot honour it: an email cannot read a CSS custom property, and
 * the stylesheet is not bundled into the serverless function that sends the
 * mail. So these four are mirrored here instead of hardcoded at each use, which
 * keeps it to one place to update. Recorded in PROGRESS.md.
 */
const COLOUR = {
  forest: '#0b3b36',
  gray: '#555555',
  cream: '#f7f4ed',
  line: '#e4ded2',
  white: '#ffffff',
} as const

/*
 * Anything interpolated into the HTML is escaped. Every one of these templates
 * carries something a stranger typed — a name, a motivation, a subject — and an
 * unescaped apostrophe or angle bracket would at best break the layout.
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Only http(s) links survive. A `javascript:` or `data:` href in a message is
 * the classic way an injected string becomes an attack on whoever opens it.
 */
const safeUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '#'
  } catch {
    return '#'
  }
}

const renderBlock = (block: EmailBlock): string => {
  switch (block.type) {
    case 'heading':
      return `<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${COLOUR.forest};font-weight:normal;">${escapeHtml(block.text)}</h1>`

    case 'paragraph':
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLOUR.forest};">${escapeHtml(block.text)}</p>`

    case 'quote':
      return `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid ${COLOUR.line};background:${COLOUR.cream};font-size:15px;line-height:1.6;color:${COLOUR.gray};white-space:pre-wrap;">${escapeHtml(block.text)}</blockquote>`

    case 'facts':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;width:100%;font-size:15px;line-height:1.6;color:${COLOUR.forest};">${block.items
        .map(
          (item) =>
            `<tr><th scope="row" align="left" style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;white-space:nowrap;">${escapeHtml(item.label)}</th><td style="padding:4px 0;vertical-align:top;">${escapeHtml(item.value)}</td></tr>`,
        )
        .join('')}</table>`

    case 'button': {
      const url = safeUrl(block.url)

      /*
       * A table, not a styled anchor: Outlook on Windows ignores padding on an
       * inline element, which turns the button into bare underlined text.
       */
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td bgcolor="${COLOUR.forest}" style="border-radius:4px;"><a href="${url}" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:bold;color:${COLOUR.white};text-decoration:none;">${escapeHtml(block.label)}</a></td></tr></table>`
    }
  }
}

/** The HTML part. */
export const renderEmailHtml = (content: EmailContent): string => {
  const year = new Date().getFullYear()
  const site = safeUrl(content.siteUrl)

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(content.preview)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOUR.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preview)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLOUR.cream};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:${COLOUR.white};border:1px solid ${COLOUR.line};border-radius:6px;">
<tr><td style="padding:32px 24px;">
${content.blocks.map(renderBlock).join('\n')}
</td></tr>
</table>
<p style="max-width:560px;margin:16px 0 0;font-size:13px;line-height:1.6;color:${COLOUR.gray};text-align:center;">
${escapeHtml(content.organisation)} &middot; <a href="${site}" style="color:${COLOUR.gray};">${escapeHtml(content.siteUrl.replace(/^https?:\/\//, ''))}</a><br>
&copy; ${year}
</p>
</td></tr>
</table>
</body>
</html>`
}

/** The plain-text part, built from the same blocks so the two cannot diverge. */
export const renderEmailText = (content: EmailContent): string => {
  const body = content.blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `${block.text}\n${'='.repeat(Math.min(block.text.length, 60))}`
        case 'paragraph':
          return block.text
        case 'quote':
          return block.text
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
        case 'facts':
          return block.items.map((item) => `${item.label}: ${item.value}`).join('\n')
        case 'button':
          return `${block.label}:\n${block.url}`
      }
    })
    .join('\n\n')

  return `${body}\n\n—\n${content.organisation}\n${content.siteUrl}\n`
}
