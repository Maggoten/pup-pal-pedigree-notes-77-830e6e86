import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, PlusCircle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { PlannedLitter, MatingDate } from '@/types/breeding';

// Helper function to format a date from MatingDate object or string
const formatMatingDate = (date: Date | MatingDate | string): string => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'MMM d, yyyy');
  } else if (date instanceof Date) {
    return format(date, 'MMM d, yyyy');
  } else {
    // Handle MatingDate object
    return format(parseISO(date.matingDate as string), 'MMM d, yyyy');
  }
};

// Helper function to check if a date is today
const checkIsToday = (date: Date | MatingDate | string): boolean => {
  if (typeof date === 'string') {
    return isToday(parseISO(date));
  } else if (date instanceof Date) {
    return isToday(date);
  } else {
    // Handle MatingDate object
    return isToday(parseISO(date.matingDate as string));
  }
};

interface PlannedLitterCardProps {
  plannedLitter: PlannedLitter;
  onSelect: () => void;
}

const PlannedLitterCard: React.FC<PlannedLitterCardProps> = ({ plannedLitter, onSelect }) => {
  const hasMatingDates = plannedLitter.matingDates && plannedLitter.matingDates.length > 0;

  return (
    <Card onClick={onSelect} className="cursor-pointer">
      <div className="flex items-center justify-between space-x-4 p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{plannedLitter.femaleName}'s litter</h3>
          <p className="text-xs text-muted-foreground">
            Sire: {plannedLitter.maleName || (plannedLitter.externalMaleName ? `External - ${plannedLitter.externalMaleName}` : 'Unknown')}
          </p>
          {hasMatingDates ? (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              {plannedLitter.matingDates.slice(0, 3).map((matingDate, index) => (
                <span
                  key={index}
                  className={`text-xs ${checkIsToday(matingDate) ? 'font-medium text-blue-500' : ''}`}
                >
                  {formatMatingDate(matingDate)}
                  {index < plannedLitter.matingDates.length - 1 && ', '}
                </span>
              ))}
              {plannedLitter.matingDates.length > 3 && <span className="text-xs">, ...</span>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No mating dates added</p>
          )}
        </div>
        <PlusCircle className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
};

export default PlannedLitterCard;
