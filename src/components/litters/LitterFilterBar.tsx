
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLitterFilter } from './LitterFilterProvider';
import { Badge } from '@/components/ui/badge';

interface LitterFilterBarProps {
  activeCount: number;
  archivedCount: number;
  totalCount: number;
}

const LitterFilterBar: React.FC<LitterFilterBarProps> = ({
  activeCount,
  archivedCount,
  totalCount
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter,
    setCurrentPage
  } = useLitterFilter();

  const handleFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const filterButtons = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'archived', label: 'Archived', count: archivedCount },
  ] as const;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Filter Buttons */}
      <div className="flex gap-1 sm:gap-2 flex-nowrap sm:flex-wrap">
        {filterButtons.map(({ key, label, count }) => (
          <Button
            key={key}
            variant={statusFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(key)}
            className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
          >
            <span>{label}</span>
            <Badge 
              variant="secondary" 
              className={`ml-0.5 sm:ml-1 text-xs px-1 sm:px-2 ${statusFilter === key ? 'bg-white/20 text-white' : 'bg-muted'}`}
            >
              {count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search litters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default LitterFilterBar;
