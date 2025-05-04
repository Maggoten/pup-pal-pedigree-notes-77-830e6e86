
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: number;
  onChange: (year: number) => void;
  startYear: number;
  endYear: number;
}

const YearSelector: React.FC<YearSelectorProps> = ({ 
  selectedYear,
  onChange,
  startYear,
  endYear
}) => {
  const handlePreviousYear = () => {
    if (selectedYear > startYear) {
      onChange(selectedYear - 1);
    }
  };

  const handleNextYear = () => {
    if (selectedYear < endYear) {
      onChange(selectedYear + 1);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full" 
        onClick={handlePreviousYear}
        disabled={selectedYear <= startYear}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-medium">{selectedYear}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full" 
        onClick={handleNextYear}
        disabled={selectedYear >= endYear}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default YearSelector;
