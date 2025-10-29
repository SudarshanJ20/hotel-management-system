'use client'
import { useState } from 'react'
import { DateRange, DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

type Props = {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
}

export function DateRangePicker({ value, onChange }: Props) {
  const [range, setRange] = useState<DateRange | undefined>(value)
  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={(r) => {
        setRange(r)
        onChange?.(r)
      }}
      className="rounded-xl bg-white p-2 shadow-soft"
    />
  )
}
