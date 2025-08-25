import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const textAreaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textAreaId} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          {...props}
          id={textAreaId}
          ref={ref}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'resize-vertical',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />
        
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export { TextArea }