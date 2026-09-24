'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  MAX_HOURS_PER_ENTRY,
  MIN_HOURS_PER_ENTRY,
} from '@/collections/VolunteerHours'
import { COMMISSION_OPTIONS, type CommissionValue } from '@/fields/commissions'
import { getMessages } from '@/i18n'
import { getMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export type HoursFormState = {
  status: 'idle' | 'success' | 'deleted' | 'error'
  errors?: Partial<Record<'date' | 'hours' | 'activity' | 'form', string>>
  values?: { date: string; hours: string; activity: string; commission: string }
}

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const isCommission = (value: string): value is CommissionValue =>
  COMMISSION_OPTIONS.some((option) => option.value === value)

/**
 * Accepts a comma as the decimal separator as well as a point. Dutch keyboards
 * and Dutch habits produce "1,5"; rejecting it would be a papercut on every
 * single entry.
 */
const parseHours = (raw: string): number => Number(raw.replace(',', '.'))

/** Registers hours for the signed-in member. ROADMAP 3.5. */
export async function addHours(
  _previous: HoursFormState,
  formData: FormData,
): Promise<HoursFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const values = {
    date: readField(formData, 'date'),
    hours: readField(formData, 'hours'),
    activity: readField(formData, 'activity'),
    commission: readField(formData, 'commission'),
  }

  const errors: HoursFormState['errors'] = {}

  const day = new Date(values.date)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  if (!values.date || Number.isNaN(day.getTime()) || day > endOfToday) {
    errors.date = messages.portalHoursErrorDate
  }

  const hours = parseHours(values.hours)

  if (
    !Number.isFinite(hours) ||
    hours < MIN_HOURS_PER_ENTRY ||
    hours > MAX_HOURS_PER_ENTRY
  ) {
    errors.hours = messages.portalHoursErrorHours
  }

  if (!values.activity) {
    errors.activity = messages.portalHoursErrorActivity
  }

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'volunteer-hours',
      /*
       * The collection is closed to members on create, so this is the one way
       * in. The member id comes from the session and never from the form.
       */
      overrideAccess: true,
      data: {
        member: member.id,
        date: day.toISOString(),
        hours,
        activity: values.activity.slice(0, 200),
        commission: isCommission(values.commission) ? values.commission : null,
      },
    })
  } catch (error) {
    console.error('Registering volunteer hours failed', error)
    return { status: 'error', errors: { form: messages.portalHoursErrorGeneric }, values }
  }

  revalidatePath('/mijn/uren')
  revalidatePath('/mijn')

  return { status: 'success' }
}

/**
 * Deletes one of the member's own entries.
 *
 * Ownership is enforced by handing Payload the member and asking it not to
 * override access, so the same rule that hides another member's hours is what
 * refuses to delete them. Checking the owner here by hand would be a second
 * copy of that rule, free to drift.
 */
export async function deleteHours(
  _previous: HoursFormState,
  formData: FormData,
): Promise<HoursFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const id = Number(readField(formData, 'id'))

  if (!Number.isFinite(id) || id <= 0) {
    return { status: 'error', errors: { form: messages.portalHoursErrorDelete } }
  }

  const payload = await getPayloadClient()

  try {
    await payload.delete({
      collection: 'volunteer-hours',
      id,
      overrideAccess: false,
      user: member,
    })
  } catch (error) {
    console.error('Deleting volunteer hours failed', error)
    return { status: 'error', errors: { form: messages.portalHoursErrorDelete } }
  }

  revalidatePath('/mijn/uren')
  revalidatePath('/mijn')

  return { status: 'deleted' }
}
