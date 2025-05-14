
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday, parseISO } from 'date-fns';
import { PlannedLitter, MatingDate } from '@/types/breeding';
import { Calendar, Dog, Edit, Trash2, CalendarPlus } from 'lucide-react';

// Helper function to format a date from MatingDate object or string
const formatMatingDate = (date: Date | MatingDate | string): string => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'MMM d, yyyy');
  } else if (date instanceof Date) {
    return format(date, 'MMM d, yyyy');
  } else {
    // Handle MatingDate object
    const dateStr = typeof date.matingDate === 'string' ? date.matingDate : date.matingDate.toISOString();
    return format(parseISO(dateStr), 'MMM d, yyyy');
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
    const dateStr = typeof date.matingDate === 'string' ? date.matingDate : date.matingDate.toISOString();
    return isToday(parseISO(dateStr));
  }
};

interface PlannedLitterDetailsDialogProps {
  plannedLitter: PlannedLitter;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddMatingDate?: () => void;
}

const PlannedLitterDetailsDialog: React.FC<PlannedLitterDetailsDialogProps> = ({ 
  plannedLitter,
  onClose,
  onEdit,
  onDelete,
  onAddMatingDate
}) => {
  const expectedHeatDate = typeof plannedLitter.expectedHeatDate === 'string' 
    ? parseISO(plannedLitter.expectedHeatDate) 
    : plannedLitter.expectedHeatDate;
  
  const formattedHeatDate = format(expectedHeatDate, 'MMMM d, yyyy');
  const isHeatToday = isToday(expectedHeatDate);
  
  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle className="text-xl">Planned Litter Details</DialogTitle>
        <DialogDescription>
          {plannedLitter.femaleName} × {plannedLitter.externalMale ? plannedLitter.externalMaleName : plannedLitter.maleName}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Expected heat date: <span className="font-medium">{formattedHeatDate}</span>
            {isHeatToday && <Badge variant="outline" className="ml-2 bg-amber-100">Today</Badge>}
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <Dog className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <div>
              <span className="text-muted-foreground">Dam:</span> <span className="font-medium">{plannedLitter.femaleName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sire:</span> <span className="font-medium">
                {plannedLitter.externalMale ? plannedLitter.externalMaleName : plannedLitter.maleName}
                {plannedLitter.externalMale && <Badge variant="outline" className="ml-2 text-xs">External</Badge>}
              </span>
            </div>
            {plannedLitter.externalMale && plannedLitter.externalMaleBreed && (
              <div className="mt-1">
                <span className="text-muted-foreground">External sire breed:</span> <span className="font-medium">{plannedLitter.externalMaleBreed}</span>
              </div>
            )}
            {plannedLitter.externalMale && plannedLitter.externalMaleRegistration && (
              <div>
                <span className="text-muted-foreground">Registration:</span> <span className="font-medium">{plannedLitter.externalMaleRegistration}</span>
              </div>
            )}
          </div>
        </div>
        
        {plannedLitter.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <h4 className="text-sm font-medium mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plannedLitter.notes}</p>
          </div>
        )}
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Mating Dates</h4>
            {onAddMatingDate && (
              <Button variant="ghost" size="sm" onClick={onAddMatingDate} className="h-8 px-2">
                <CalendarPlus className="h-4 w-4 mr-1" />
                Add Date
              </Button>
            )}
          </div>
          
          {plannedLitter.matingDates && plannedLitter.matingDates.length > 0 ? (
            <div className="space-y-2">
              {plannedLitter.matingDates.map((matingDate, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatMatingDate(matingDate)}
                    {checkIsToday(matingDate) && <Badge variant="outline" className="ml-2 bg-amber-100">Today</Badge>}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-md">
              No mating dates recorded yet
            </div>
          )}
        </div>
      </div>
      
      <DialogFooter className="gap-2 sm:gap-0">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="gap-1 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
        <Button variant="default" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PlannedLitterDetailsDialog;
