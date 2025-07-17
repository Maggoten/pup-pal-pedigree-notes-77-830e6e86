
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCcw } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarHeaderProps {
  currentDate: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  onAddEvent: () => void;
  todayButton?: boolean;
  onTodayClick?: () => void;
  onSyncCalendar?: () => void;
  isSyncing?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  handlePrevMonth,
  handleNextMonth,
  onAddEvent,
  todayButton = true,
  onTodayClick,
  onSyncCalendar,
  isSyncing = false
}) => {
  const isMobile = useIsMobile();
  
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
    <CardHeader className="px-4 py-4 flex-col space-y-0 pb-2 bg-warmbeige-100 border-b border-warmbeige-200">
      {isMobile ? (
        // Mobile layout: Two rows
        <div className="w-full space-y-3">
          {/* First row: Previous button | Month title | Next button */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" className="bg-white hover:bg-warmbeige-100" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CardTitle className="font-bold text-darkgray-800 text-xl">{headerMonthYear}</CardTitle>
            
            <Button variant="outline" size="icon" className="bg-white hover:bg-warmbeige-100" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Second row: Today button (if needed) and Add Event button */}
          <div className="flex items-center justify-center gap-2">
            {todayButton && !isCurrentMonth && (
              <Button 
                variant="secondary" 
                size="sm"
                className="flex items-center gap-1 bg-warmbeige-200 hover:bg-warmbeige-300 text-darkgray-800"
                onClick={handleTodayClick}
              >
                <CalendarIcon className="h-4 w-4" />
                Today
              </Button>
            )}
            <Button variant="outline" size="sm" className="bg-white hover:bg-warmbeige-100" onClick={onAddEvent}>
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Event</span>
            </Button>
          </div>
        </div>
      ) : (
        // Desktop layout: Arrows on sides of month title
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="bg-white hover:bg-warmbeige-100" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-bold text-darkgray-800 text-xl">{headerMonthYear}</CardTitle>
            <Button variant="outline" size="icon" className="bg-white hover:bg-warmbeige-100" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {todayButton && !isCurrentMonth && (
              <Button 
                variant="secondary" 
                size="sm"
                className="flex items-center gap-1 bg-warmbeige-200 hover:bg-warmbeige-300 text-darkgray-800"
                onClick={handleTodayClick}
              >
                <CalendarIcon className="h-4 w-4" />
                Today
              </Button>
            )}
            {onSyncCalendar && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-warmbeige-100"
                onClick={onSyncCalendar}
                disabled={isSyncing}
              >
                <RefreshCcw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
              </Button>
            )}
            <Button variant="outline" size="sm" className="bg-white hover:bg-warmbeige-100" onClick={onAddEvent}>
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Event</span>
            </Button>
          </div>
        </div>
      )}
    </CardHeader>
  );
};

export default CalendarHeader;
