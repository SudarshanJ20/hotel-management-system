import { HotelsAPI } from '@/lib/api'
import { BookingForm } from '@/components/BookingForm'
import { Hotel } from '@/lib/types'

async function fetchHotel(id: string): Promise<Hotel | null> {
  try {
    const data = await HotelsAPI.getById(id)
    return data
  } catch (e) {
    return null
  }
}

export default async function HotelDetail({ params }: { params: { id: string } }) {
  const hotel = await fetchHotel(params.id)
  if (!hotel) return <div className="text-slate-700">Hotel not found.</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card h-60" />
        <div className="card p-4">
          <h1 className="text-2xl font-semibold">{hotel.name}</h1>
          {hotel.description && <p className="text-slate-600 mt-2">{hotel.description}</p>}
        </div>
        {hotel.amenities?.length ? (
          <div className="card p-4">
            <h2 className="font-medium mb-2">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <span key={a.id} className="px-3 py-1 rounded-full bg-soft-blue text-slate-700 text-sm shadow-soft">{a.name}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <BookingForm hotelId={hotel.id} />
      </div>
    </div>
  )
}
