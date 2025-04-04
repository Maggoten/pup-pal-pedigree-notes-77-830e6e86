
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, ChevronDown } from 'lucide-react';

interface YearFilterDropdownProps {
  years: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

const YearFilterDropdown: React.FC<YearFilterDropdownProps> = ({
  years,
  selectedYear,
  onYearChange
}) => {
  const handleYearSelect = (year: number | null) => {
    onYearChange(year);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {selectedYear ? `${selectedYear}` : "All Years"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-2">
          <div className="font-medium text-sm px-2 py-1.5">Filter by Year</div>
          <Button 
            variant={selectedYear === null ? "default" : "ghost"} 
            className="w-full justify-start text-left mb-1"
            onClick={() => handleYearSelect(null)}
          >
            All Years
          </Button>
          <div className="grid grid-cols-2 gap-1">
            {years.map(year => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "ghost"}
                className="justify-start text-left"
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default YearFilterDropdown;
