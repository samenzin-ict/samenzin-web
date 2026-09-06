import Link from 'next/link'

import { Button } from '@/components/ui/button'

/**
 * Development placeholder. The public site is built in a later phase-1
 * session; see ROADMAP.md. Nothing here is user-facing content, so no CMS
 * strings are involved. It renders the three button variants so the design
 * tokens can be checked in a browser.
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl">samenzin-web</h1>
      <p className="mt-2">
        Development scaffold. The admin panel is at{' '}
        <Link className="text-accent underline" href="/admin">
          /admin
        </Link>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button variant="cta">Call to action</Button>
        <Button>Secondary</Button>
        <Button variant="outline">Tertiary</Button>
      </div>
    </main>
  )
}
