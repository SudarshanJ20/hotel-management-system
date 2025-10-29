'use client'
import { ChangeEvent, FormEvent, useState, useTransition } from 'react'
import type { DateRange } from 'react-day-picker'
import { BookingsAPI } from '@/lib/api'
import { DateRangePicker } from './DateRangePicker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  hotelId: string
  roomId?: string
}

export function BookingForm({ hotelId, roomId }: Props) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  const [loading, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!range?.from || !range?.to) {
      setMessage('Please select a date range')
      return
    }
    const { from: fromDate, to: toDate } = range as Required<DateRange>
    setMessage(null)
    startTransition(async () => {
      try {
        await BookingsAPI.create({
          hotelId,
          roomId,
          startDate: fromDate.toISOString(),
          endDate: toDate.toISOString(),
          guests,
          specialRequests: notes,
        })
        setMessage('Booking created successfully!')
      } catch (error: any) {
        setMessage(error?.response?.data?.message || 'Failed to create booking')
      }
    })
  }

  function handleGuestsChange(event: ChangeEvent<HTMLInputElement>) {
    const value = parseInt(event.target.value || '1', 10)
    setGuests(Number.isNaN(value) ? 1 : Math.max(1, value))
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Book your stay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Select dates</Label>
            <DateRangePicker value={range} onChange={setRange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="guests">Guests</Label>
            <Input id="guests" type="number" min={1} value={guests} onChange={handleGuestsChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Special requests</Label>
            <Textarea id="notes" value={notes} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Booking…' : 'Book now'}
            </Button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
