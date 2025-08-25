import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}