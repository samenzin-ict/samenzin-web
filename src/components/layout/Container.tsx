import { cn } from '@/lib/utils'

/**
 * Horizontal rhythm for the whole site. One place to change the maximum width
 * and the gutters, so pages cannot drift apart from each other.
 *
 * Mobile first: the gutter starts small and grows with the viewport.
 */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}
