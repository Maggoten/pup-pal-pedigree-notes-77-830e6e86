
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, PenLine, Trash2 } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { PlannedLitter } from '@/types/breeding';
import { parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlannedLitterDetailsDialogProps {
  litter: PlannedLitter;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onDeleteMatingDate?: (litterId: string, dateIndex: number) => void;
  onEditMatingDate?: (litterId: string, dateIndex: number, newDate: Date) => void;
}

const PlannedLitterDetailsDialog: React.FC<PlannedLitterDetailsDialogProps> = ({
  litter,
  onAddMatingDate,
  onDeleteMatingDate,
  onEditMatingDate
}) => {
  const [editingDateIndex, setEditingDateIndex] = useState<number | null>(null);
  
  const handleEditMatingDate = (date: Date | undefined) => {
    if (date && editingDateIndex !== null && onEditMatingDate) {
      onEditMatingDate(litter.id, editingDateIndex, date);
      setEditingDateIndex(null);
    }
  };

  // Format mating dates for display
  const formattedMatingDates = litter.matingDates && litter.matingDates.length > 0 
    ? litter.matingDates.map(dateStr => typeof dateStr === 'string' ? new Date(dateStr) : dateStr)
    : [];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Litter Details</DialogTitle>
        <DialogDescription>
          {litter.maleName} × {litter.femaleName}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Expected Heat</h3>
          <p>{new Date(litter.expectedHeatDate).toLocaleDateString()}</p>
        </div>
        
        {litter.externalMale && litter.externalMaleBreed && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">External Sire Breed</h3>
            <p>{litter.externalMaleBreed}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
          <p>{litter.notes || 'No notes'}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Mating Dates</h3>
          
          {formattedMatingDates.length > 0 ? (
            <ul className="space-y-1">
              {formattedMatingDates.map((date, index) => (
                <li key={index} className="flex items-center justify-between py-1">
                  {editingDateIndex === index ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          {date.toLocaleDateString()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={handleEditMatingDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span>{date.toLocaleDateString()}</span>
                  )}
                  
                  <div className="flex space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => setEditingDateIndex(index)}
                          >
                            <PenLine className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => onDeleteMatingDate && onDeleteMatingDate(litter.id, index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No mating dates recorded</p>
          )}
          
          <div className="mt-4">
            <h4 className="text-sm font-medium">Add Mating Date:</h4>
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Select Date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    onSelect={(date) => date && onAddMatingDate(litter.id, date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default PlannedLitterDetailsDialog;
