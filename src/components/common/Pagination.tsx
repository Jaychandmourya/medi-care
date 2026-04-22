import { ChevronLeft, ChevronRight } from "lucide-react";
import { FormButton } from "./FormButton";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalItems: number;
  perPage?: number;
  itemName?: string;
}

export default function Pagination({
  page,
  setPage,
  totalItems,
  perPage = 10,
  itemName = "items",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const startItem = ((page - 1) * perPage) + 1;
  const endItem = Math.min(page * perPage, totalItems);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 backdrop-blur-sm bg-opacity-95">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1">
          Showing <span className="font-medium text-gray-900">{startItem}</span> to <span className="font-medium text-gray-900">{endItem}</span> of <span className="font-medium text-gray-900">{totalItems}</span> {itemName}
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <FormButton
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="h-10 w-10 sm:w-auto sm:px-4 p-0 sm:gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </FormButton>

          {/* Page Numbers - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <FormButton
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-10 w-10 p-0"
                >
                  {pageNum}
                </FormButton>
              );
            })}
          </div>

          {/* Compact page numbers for mobile/tablet */}
          <div className="flex items-center gap-1 md:hidden">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (page === 1) {
                pageNum = i + 1;
              } else if (page === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = page - 1 + i;
              }
              return (
                <FormButton
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-10 w-10 p-0 font-semibold"
                >
                  {pageNum}
                </FormButton>
              );
            })}
          </div>

          <FormButton
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-10 w-10 sm:w-auto sm:px-4 p-0 sm:gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </FormButton>
        </div>
      </div>
    </div>
  );
}
