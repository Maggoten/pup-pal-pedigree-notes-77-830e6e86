
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: number;
  currentYear: number;
  handlePreviousYear: () => void;
  handleNextYear: () => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ 
  selectedYear,
  currentYear,
  handlePreviousYear,
  handleNextYear
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full" 
        onClick={handlePreviousYear}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-medium">{selectedYear}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full" 
        onClick={handleNextYear}
        disabled={selectedYear >= currentYear}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default YearSelector;
