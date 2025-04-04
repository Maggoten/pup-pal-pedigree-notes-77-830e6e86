
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { PlannedLitter } from '@/types/breeding';

interface PlannedLitterDetailsDialogProps {
  litter: PlannedLitter;
  onAddMatingDate: (litterId: string, date: Date) => void;
}

const PlannedLitterDetailsDialog: React.FC<PlannedLitterDetailsDialogProps> = ({
  litter,
  onAddMatingDate
}) => {
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
          
          {litter.matingDates && litter.matingDates.length > 0 ? (
            <ul className="space-y-1">
              {litter.matingDates.map((date, index) => (
                <li key={index}>{new Date(date).toLocaleDateString()}</li>
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
