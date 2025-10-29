'use server'

import { cookies } from 'next/headers'
import { api } from './api'

const AUTH_COOKIE = 'access_token'

export async function getSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value
    if (!token) return null
    const res = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error) {
    return null
  }
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete(AUTH_COOKIE)
}
