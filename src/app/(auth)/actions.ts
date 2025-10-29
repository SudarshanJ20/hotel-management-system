'use server'

import { cookies } from 'next/headers'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'

const AUTH_COOKIE = 'access_token'

type AuthResult = { success: true } | { success: false; error: string }

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  try {
    const res = await api.post('/auth/login', { email, password })
    setAuthCookie(res.data?.token, res.data?.expiresIn)
    return { success: true }
  } catch (error) {
    return { success: false, error: extractErrorMessage(error) }
  }
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get('name') || '')
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  try {
    const res = await api.post('/auth/register', { name, email, password })
    setAuthCookie(res.data?.token, res.data?.expiresIn)
    return { success: true }
  } catch (error) {
    return { success: false, error: extractErrorMessage(error) }
  }
}

function setAuthCookie(token?: string, expiresIn?: number) {
  if (!token) return

  const cookieStore = cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: expiresIn ?? 60 * 60 * 24 * 7,
  })
}

function extractErrorMessage(error: unknown) {
  const fallback = 'We hit a snag. Please try again.'
  if (!error) return fallback

  const axiosError = error as AxiosError<{ message?: string }>
  const responseMessage = axiosError.response?.data?.message
  if (responseMessage) return responseMessage

  if (axiosError.message) return axiosError.message
  return fallback
}