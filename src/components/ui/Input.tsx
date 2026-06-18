import React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs tracking-label uppercase text-text-secondary font-elegant font-semibold mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-surface-2 border rounded-md px-4 py-3 text-sm text-white font-desc placeholder:text-text-muted',
            'transition-colors duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
            error ? 'border-error' : 'border-border',
            className,
          )}
          {...rest}
        />
        {error && (
          <p className="mt-1.5 text-xs text-error font-desc">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
