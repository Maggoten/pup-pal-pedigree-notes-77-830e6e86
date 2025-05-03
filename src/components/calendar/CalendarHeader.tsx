
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarHeaderProps {
  currentDate: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  onAddEvent: () => void;
  todayButton?: boolean;
  onTodayClick?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  handlePrevMonth,
  handleNextMonth,
  onAddEvent,
  todayButton = true,
  onTodayClick
}) => {
  // Get current month name and year
  const headerMonthYear = format(currentDate, 'MMMM yyyy');
  const isCurrentMonth = format(new Date(), 'MMMM yyyy') === headerMonthYear;
  
  // Default handler for today button if not provided
  const handleTodayClick = () => {
    if (onTodayClick) {
      onTodayClick();
    }
  };
  
  return (
    <CardHeader className="px-4 py-4 flex-row flex items-center justify-between space-y-0 pb-2 bg-warmbeige-50">
      <CardTitle className="font-bold text-darkgray-800 text-xl">{headerMonthYear}</CardTitle>
      
      <div className="flex items-center space-x-2">
        {todayButton && !isCurrentMonth && (
          <Button 
            variant="secondary" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleTodayClick}
          >
            <CalendarIcon className="h-4 w-4" />
            Today
          </Button>
        )}
        <div className="space-x-1">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onAddEvent}>
          <Plus className="h-4 w-4 mr-1" />
          <span>Add Event</span>
        </Button>
      </div>
    </CardHeader>
  );
};

export default CalendarHeader;
