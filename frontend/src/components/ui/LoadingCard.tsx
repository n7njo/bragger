export function LoadingCard() {
  return (
    <div className="card animate-pulse">
      <div className="mb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
      
      <div className="flex gap-1">
        <div className="h-5 bg-gray-200 rounded w-12"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-14"></div>
      </div>
    </div>
  )
}

interface LoadingGridProps {
  count?: number;
}

export function LoadingGrid({ count = 6 }: LoadingGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}