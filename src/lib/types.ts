export type Amenity = {
  id: string
  name: string
  icon?: string
}

export type Room = {
  id: string
  name: string
  description?: string
  pricePerNight: number
  capacity: number
  images?: string[]
}

export type Hotel = {
  id: string
  name: string
  description?: string
  city?: string
  country?: string
  address?: string
  rating?: number
  images?: string[]
  amenities?: Amenity[]
  rooms?: Room[]
}

export type Booking = {
  id: string
  hotelId: string
  userId: string
  roomId?: string
  startDate: string
  endDate: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export type BookingPayload = {
  hotelId: string
  roomId?: string
  startDate: string
  endDate: string
  guests?: number
  specialRequests?: string
}

export type User = {
  id: string
  name: string
  email: string
  role?: 'user' | 'admin'
}

export type AdminStats = {
  totalBookings: number
  revenue: number
  occupancy: number // 0-100
}
