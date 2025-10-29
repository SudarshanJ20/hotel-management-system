import { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('card', className)}>{children}</div>
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>
}

export function CardContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('space-y-3', className)}>{children}</div>
}
