import Link from 'next/link'
import { FC } from 'react'
import { motion } from 'framer-motion'
import { Hotel } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type HotelCardProps = {
  hotel: Hotel
}

export const HotelCard: FC<HotelCardProps> = ({ hotel }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      <Card className="overflow-hidden">
        <div className="aspect-[16/9] bg-gradient-to-br from-soft-blue via-soft-purple to-soft-pink" />
        <CardHeader className="p-4 pb-1">
          <CardTitle>{hotel.name}</CardTitle>
          {hotel.city && <p className="text-sm text-slate-600">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</p>}
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Button asChild variant="secondary" className="mt-3">
            <Link href={`/hotels/${hotel.id}`}>View details</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
