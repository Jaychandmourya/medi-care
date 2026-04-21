import { useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface SearchPaginationProps {
  currentPage: number
  totalPages: number
  resultCount: number
  onPageChange: (page: number) => void
  loading?: boolean
  limit?: number
}

export default function SearchPagination({
  currentPage,
  totalPages,
  resultCount,
  onPageChange,
  loading = false,
  limit = 10
}: SearchPaginationProps) {

  const startItem = useMemo(() => (currentPage - 1) * limit + 1, [currentPage, limit])
  const endItem = useMemo(() => Math.min(currentPage * limit, resultCount), [currentPage, limit, resultCount])

  const handlePrevious = useCallback(() => onPageChange(currentPage - 1), [onPageChange, currentPage])
  const handleNext = useCallback(() => onPageChange(currentPage + 1), [onPageChange, currentPage])
  const handlePageClick = useCallback((page: number) => onPageChange(page), [onPageChange])

  const visiblePages = useMemo(() => {
    const delta = 2 // Number of pages to show on each side of current page
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }, [currentPage, totalPages])

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* Results count */}
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{resultCount}</span> results
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-sm text-gray-500">...</span>
              ) : (
                <Button
                  onClick={() => handlePageClick(page as number)}
                  disabled={loading}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className={`min-w-10 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Next button */}
        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
