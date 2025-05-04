
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';

interface RemindersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const RemindersPagination: React.FC<RemindersPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Don't render pagination if there's only 1 page or no pages
  if (totalPages <= 1) return null;
  
  // Helper function to render page numbers
  const renderPageNumbers = () => {
    // For 7 or fewer pages, show all page numbers
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <PaginationItem key={page}>
          <PaginationLink
            isActive={page === currentPage}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page);
            }}
            href="#"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ));
    }
    
    // For more than 7 pages, show first, last, and pages around current
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          isActive={1 === currentPage}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(1);
          }}
          href="#"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(i);
            }}
            href="#"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={totalPages === currentPage}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(totalPages);
            }}
            href="#"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {renderPageNumbers()}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default RemindersPagination;
