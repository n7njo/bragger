import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  label?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  maxTags?: number
}

export function TagInput({
  value,
  onChange,
  label,
  error,
  placeholder = 'Type and press Enter to add tags...',
  disabled = false,
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputId = `tag-input-${Math.random().toString(36).substr(2, 9)}`

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(value.length - 1)
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    
    if (trimmedValue && 
        !value.includes(trimmedValue) && 
        value.length < maxTags) {
      onChange([...value, trimmedValue])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange(newTags)
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'min-h-[42px] w-full rounded-md border border-gray-300 px-3 py-2',
          'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
          'flex flex-wrap items-center gap-1',
          error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500',
          disabled && 'bg-gray-50'
        )}
      >
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        
        {!disabled && value.length < maxTags && (
          <input
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm"
            disabled={disabled}
          />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      <p className="text-sm text-gray-500">
        {value.length}/{maxTags} tags
      </p>
    </div>
  )
}