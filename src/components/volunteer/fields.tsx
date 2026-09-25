'use client'

import { cn } from '@/lib/utils'

/** The shared look of every input in the volunteer form. */
export const inputClass = (invalid = false) =>
  cn(
    'min-h-11 w-full rounded-md border bg-card px-3 py-2 text-foreground',
    invalid ? 'border-destructive' : 'border-input',
  )

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}

/**
 * A checkbox that looks like the pills in the Vaardigheden row of the mockup.
 *
 * It is a real checkbox, visually hidden rather than replaced, so it keeps its
 * keyboard behaviour and its announced checked state. peer-checked colours the
 * label and peer-focus-visible draws the focus ring the input itself would.
 */
export function PillCheckbox({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string
  value: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="inline-flex cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        className={cn(
          'flex min-h-11 items-center rounded-full border border-input bg-card px-4 text-sm',
          'peer-checked:border-cta peer-checked:bg-cta peer-checked:font-medium peer-checked:text-cta-foreground',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
        )}
      >
        {label}
      </span>
    </label>
  )
}

/** An ordinary checkbox with its label, used for the Interesses column. */
export function LabelledCheckbox({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string
  value: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-5 shrink-0 accent-[var(--primary)]"
      />
      <span>{label}</span>
    </label>
  )
}
