'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getMessages } from '@/i18n'
import {
  countEventRegistrations,
  getEventRegistration,
  hasStarted,
  placesLeft,
} from '@/lib/enrolment'
import { getMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export type RegistrationFormState = {
  status: 'idle' | 'registered' | 'cancelled' | 'error'
  error?: string
}

const readId = (formData: FormData, key: string): number => {
  const value = formData.get(key)
  return Number(typeof value === 'string' ? value : NaN)
}

/**
 * Registers the signed-in member for an event.
 *
 * Two things are checked here that no access rule can express: whether the
 * event has already started, and whether it is full. Both depend on counting
 * other members' rows, which the member is not allowed to read, so they cannot
 * be a query constraint on their own documents.
 *
 * Checked again here even though the page already hid the button, because the
 * page was rendered at some point in the past and the last place may have gone
 * since.
 */
export async function registerForEvent(
  _previous: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const eventId = readId(formData, 'event')
  const slug = String(formData.get('slug') ?? '')

  if (!Number.isFinite(eventId) || eventId <= 0) {
    return { status: 'error', error: messages.eventsRegisterError }
  }

  const payload = await getPayloadClient()

  try {
    const existing = await getEventRegistration(payload, member, eventId)

    if (existing) return { status: 'registered' }

    const event = await payload.findByID({
      collection: 'events',
      id: eventId,
      depth: 0,
      overrideAccess: false,
    })

    if (hasStarted(event)) {
      return { status: 'error', error: messages.eventsRegisterClosed }
    }

    const registered = await countEventRegistrations(payload, eventId)

    if (placesLeft(event, registered).isFull) {
      return { status: 'error', error: messages.eventsRegisterFull }
    }

    await payload.create({
      collection: 'event-registrations',
      overrideAccess: false,
      user: member,
      data: { member: member.id, event: eventId, attended: false },
    })
  } catch (error) {
    console.error('Registering for an event failed', error)
    return { status: 'error', error: messages.eventsRegisterError }
  }

  if (slug) revalidatePath(`/agenda/${slug}`)
  revalidatePath('/mijn/evenementen')
  revalidatePath('/mijn')

  return { status: 'registered' }
}

/**
 * Cancels the member's registration, which frees the place.
 *
 * Refused by the access rule once somebody has been ticked as having
 * attended. Nothing here re-checks that; the rule is the only copy.
 */
export async function cancelRegistration(
  _previous: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const registrationId = readId(formData, 'registration')
  const slug = String(formData.get('slug') ?? '')

  if (!Number.isFinite(registrationId) || registrationId <= 0) {
    return { status: 'error', error: messages.eventsCancelError }
  }

  const payload = await getPayloadClient()

  try {
    await payload.delete({
      collection: 'event-registrations',
      id: registrationId,
      overrideAccess: false,
      user: member,
    })
  } catch (error) {
    console.error('Cancelling an event registration failed', error)
    return { status: 'error', error: messages.eventsCancelError }
  }

  if (slug) revalidatePath(`/agenda/${slug}`)
  revalidatePath('/mijn/evenementen')
  revalidatePath('/mijn')

  return { status: 'cancelled' }
}
