import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

/*
 * Button variants follow the three styles in docs/design/01-design-system.png:
 *
 *   cta      gold filled    the primary action (Doneer, Steun ons werk)
 *   default  forest filled  the secondary action (Word vrijwilliger)
 *   outline  white outlined the tertiary action (Lees meer)
 *
 * Colours come from the semantic tokens in globals.css. No literal colour
 * belongs in this file.
 *
 * The default height is 44px, which is the minimum comfortable touch target
 * on a phone and matches the generous button height in the mockups.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-medium whitespace-nowrap transition-colors outline-none focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        cta: 'bg-cta text-cta-foreground hover:bg-cta-hover',
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'border border-primary bg-card text-primary hover:bg-muted',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
        ghost: 'text-primary hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
      },
      size: {
        default: 'h-11 px-6 py-2 has-[>svg]:px-4',
        sm: 'h-9 gap-1.5 rounded-md px-4 has-[>svg]:px-3',
        lg: 'h-12 rounded-md px-8 text-lg has-[>svg]:px-6',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
