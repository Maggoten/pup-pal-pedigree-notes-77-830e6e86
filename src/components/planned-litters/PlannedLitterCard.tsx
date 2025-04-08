
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trash2, ClipboardCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterDetailsDialog from './PlannedLitterDetailsDialog';
import PreBreedingChecklist from './PreBreedingChecklist';

interface PlannedLitterCardProps {
  litter: PlannedLitter;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onDeleteLitter: (litterId: string) => void;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
}

const PlannedLitterCard: React.FC<PlannedLitterCardProps> = ({
  litter,
  onAddMatingDate,
  onDeleteLitter,
  calendarOpen,
  onCalendarOpenChange
}) => {
  const [showChecklist, setShowChecklist] = useState(false);

  return (
    <Card>
      <CardHeader className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={() => onDeleteLitter(litter.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
        <CardTitle>{litter.maleName} × {litter.femaleName}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Expected heat: {new Date(litter.expectedHeatDate).toLocaleDateString()}
        </CardDescription>
        {litter.externalMale && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            External Sire
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm">{litter.notes}</p>
        
        {litter.matingDates && litter.matingDates.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">Mating Dates:</h4>
            <ul className="mt-1 space-y-1">
              {litter.matingDates.map((date, index) => (
                <li key={index} className="text-sm">
                  {new Date(date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-1 gap-2">
          <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Add Mating Date
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
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowChecklist(true)}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Breeding Checklist
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </DialogTrigger>
          <PlannedLitterDetailsDialog 
            litter={litter} 
            onAddMatingDate={onAddMatingDate}
          />
        </Dialog>
      </CardFooter>

      {/* Breeding Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <PreBreedingChecklist litter={litter} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PlannedLitterCard;
