
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';
import { CalendarEvent, AddEventFormValues } from '../types';

interface CalendarContextProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  weeks: Date[][];
  handleNextMonth: () => void;
  handlePrevMonth: () => void;
  handleEventClick: (event: CalendarEvent) => void;
}

export const CalendarContext = createContext<CalendarContextProps | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children,
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate all days in current month
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Handle month navigation
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Organize days into weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  const dayOfWeek = startDate.getDay();
  const daysToAddBefore = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Add days from previous month
  for (let i = daysToAddBefore; i > 0; i--) {
    currentWeek.push(addDays(startDate, -i));
  }
  
  // Add all days of current month
  allDaysInMonth.forEach((day, index) => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7 || index === allDaysInMonth.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Add days from next month if needed
  if (currentWeek.length > 0 && currentWeek.length < 7) {
    const daysToAddAfter = 7 - currentWeek.length;
    for (let i = 1; i <= daysToAddAfter; i++) {
      currentWeek.push(addDays(endDate, i));
    }
    weeks.push(currentWeek);
  }
  
  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
    
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  const value = {
    currentDate,
    setCurrentDate,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedEvent,
    setSelectedEvent,
    isLoading,
    setIsLoading,
    weeks,
    handleNextMonth,
    handlePrevMonth,
    handleEventClick,
  };
  
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  
  if (context === undefined) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  
  return context;
};
