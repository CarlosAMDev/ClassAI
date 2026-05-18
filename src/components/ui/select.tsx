import * as React from 'react'

import { cn } from '#/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Select.displayName = 'Select'

export { Select }