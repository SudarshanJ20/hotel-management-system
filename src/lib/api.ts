import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Example requests
export const HotelsAPI = {
  async list(params?: { q?: string; city?: string }) {
    const res = await api.get('/hotels', { params })
    return res.data
  },
  async getById(id: string) {
    const res = await api.get(`/hotels/${id}`)
    return res.data
  },
}

export const BookingsAPI = {
  async create(payload: any) {
    const res = await api.post('/bookings', payload)
    return res.data
  },
  async myBookings() {
    const res = await api.get('/bookings/me')
    return res.data
  },
}

export const AuthAPI = {
  async login(payload: { email: string; password: string }) {
    const res = await api.post('/auth/login', payload)
    return res.data
  },
  async register(payload: { name: string; email: string; password: string }) {
    const res = await api.post('/auth/register', payload)
    return res.data
  },
  async me() {
    const res = await api.get('/auth/me')
    return res.data
  },
  async logout() {
    const res = await api.post('/auth/logout')
    return res.data
  },
}
