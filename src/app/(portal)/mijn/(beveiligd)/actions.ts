'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { getMessages } from '@/i18n'
import { clearMemberSession, getMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export type TaskToggleState = { status: 'idle' | 'error'; error?: string }

export type DetailsFormState = { status: 'idle' | 'success' | 'error'; error?: string }
export type PasswordFormState = { status: 'idle' | 'success' | 'error'; error?: string }

/** Passwords are not trimmed: a leading or trailing space is a real character. */
const readText = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const readSecret = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

const MIN_PASSWORD_LENGTH = 12

/** Signs the member out and revokes the session server-side. */
export async function logout(): Promise<void> {
  const payload = await getPayloadClient()

  await clearMemberSession(payload)

  redirect('/mijn/inloggen')
}

/**
 * Saves the contact details a member maintains themselves.
 *
 * The update is restricted to the four contact fields. Name, e-mail, status
 * and "lid sinds" are not in the list, so a crafted form post cannot reach
 * them even though the member is allowed to update their own document.
 */
export async function saveDetails(
  _previous: DetailsFormState,
  formData: FormData,
): Promise<DetailsFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const payload = await getPayloadClient()

  try {
    await payload.update({
      collection: 'members',
      id: member.id,
      overrideAccess: true,
      data: {
        phone: readText(formData, 'phone').slice(0, 40) || null,
        street: readText(formData, 'street').slice(0, 200) || null,
        postalCode: readText(formData, 'postalCode').slice(0, 20) || null,
        city: readText(formData, 'city').slice(0, 100) || null,
      },
    })
  } catch (error) {
    console.error('Saving member details failed', error)
    return { status: 'error', error: messages.portalDetailsError }
  }

  revalidatePath('/mijn/gegevens')

  return { status: 'success' }
}

/**
 * Changes a member's password.
 *
 * The current password is verified by logging in with it rather than by
 * comparing hashes by hand, so the check uses exactly the same code path as a
 * real login. Without it, anyone who got hold of an unlocked browser could
 * change the password and lock the member out of their own account.
 */
export async function changePassword(
  _previous: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const current = readSecret(formData, 'currentPassword')
  const next = readSecret(formData, 'newPassword')
  const repeat = readSecret(formData, 'repeatPassword')

  if (next.length < MIN_PASSWORD_LENGTH) {
    return { status: 'error', error: messages.portalPasswordTooShort }
  }

  if (next !== repeat) {
    return { status: 'error', error: messages.portalPasswordMismatch }
  }

  const payload = await getPayloadClient()

  try {
    await payload.login({ collection: 'members', data: { email: member.email, password: current } })
  } catch {
    return { status: 'error', error: messages.portalPasswordWrongCurrent }
  }

  try {
    await payload.update({
      collection: 'members',
      id: member.id,
      overrideAccess: true,
      data: { password: next },
    })
  } catch (error) {
    console.error('Changing member password failed', error)
    return { status: 'error', error: messages.portalPasswordError }
  }

  return { status: 'success' }
}

/**
 * Ticks a task off, or puts it back. The one thing a member may change about a
 * task; every other field is administrator-only at field level.
 *
 * Ownership is left to the access rule: the member is handed to Payload with
 * overrideAccess false, so the same constraint that hides another member's
 * tasks is what refuses to update one.
 */
export async function toggleTask(
  _previous: TaskToggleState,
  formData: FormData,
): Promise<TaskToggleState> {
  const messages = getMessages()
  const member = await getMember()

  if (!member) redirect('/mijn/inloggen')

  const id = Number(readText(formData, 'id'))
  const done = readText(formData, 'done') === 'true'

  if (!Number.isFinite(id) || id <= 0) {
    return { status: 'error', error: messages.portalTasksError }
  }

  const payload = await getPayloadClient()

  try {
    await payload.update({
      collection: 'member-tasks',
      id,
      overrideAccess: false,
      user: member,
      data: { done },
    })
  } catch (error) {
    console.error('Toggling a task failed', error)
    return { status: 'error', error: messages.portalTasksError }
  }

  revalidatePath('/mijn')
  revalidatePath('/mijn/taken')

  return { status: 'idle' }
}
