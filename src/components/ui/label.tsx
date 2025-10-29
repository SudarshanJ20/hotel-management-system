import { LabelHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('block text-sm font-medium text-slate-600', className)} {...props} />
  )
)
Label.displayName = 'Label'
