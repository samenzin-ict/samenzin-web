import Image from 'next/image'

import logo from '@/assets/brand/logo.png'
import mark from '@/assets/brand/mark.png'

/*
 * The house-style logo in the admin panel, in place of Payload's own. Wired
 * up in payload.config.ts under admin.components.graphics.
 *
 * Both are decorative: Payload puts them inside a link or next to a heading
 * that already names the page.
 */

/** The full logo, on the login screen. */
export function AdminLogo() {
  return <Image src={logo} alt="" priority sizes="280px" style={{ width: 280, height: 'auto' }} />
}

/** The symbol on its own, at the top of the navigation. */
export function AdminIcon() {
  return <Image src={mark} alt="" sizes="28px" style={{ width: 28, height: 28 }} />
}
