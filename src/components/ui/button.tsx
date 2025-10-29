import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-soft'

const variants: Record<string, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-white text-brand-600 border border-brand-100 hover:bg-brand-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', asChild = false, ...props }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(base, variants[variant], className)} {...props} />
})
Button.displayName = 'Button'

