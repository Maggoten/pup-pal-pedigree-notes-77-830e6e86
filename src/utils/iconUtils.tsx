
import React from 'react';
import { PawPrint, CalendarClock, Scale } from 'lucide-react';

// Create factory functions for all icons we need
export const createPawPrintIcon = (color: string) => {
  return React.createElement(PawPrint, { className: `h-5 w-5 text-${color}` });
};

export const createCalendarClockIcon = (color: string) => {
  return React.createElement(CalendarClock, { className: `h-5 w-5 text-${color}` });
};

export const createScaleIcon = (color: string) => {
  return React.createElement(Scale, { className: `h-5 w-5 text-${color}` });
};
