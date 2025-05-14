import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, PlusCircle, Trash, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlannedLitter } from '@/types/breeding';
import { format, addDays, isWithinDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PopoverClose } from '@radix-ui/react-popover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPrimitive } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export interface PlannedLitterCardProps {
  plannedLitter: PlannedLitter;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onEditMatingDate?: (litterId: string, dateIndex: number, newDate: Date) => void;
  onDeleteMatingDate?: (litterId: string, dateIndex: number) => void;
  onDeleteLitter: (litterId: string) => void;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
}

const PlannedLitterCard: React.FC<PlannedLitterCardProps> = ({
  plannedLitter,
  onAddMatingDate,
  onEditMatingDate,
  onDeleteMatingDate,
  onDeleteLitter,
  calendarOpen,
  onCalendarOpenChange
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleAddMatingDate = (date: Date) => {
    onAddMatingDate(plannedLitter.id, date);
  };

  return (
    <Card className="relative overflow-hidden bg-white border-amber-100 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{plannedLitter.name}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sire</p>
            <p className="text-sm">{plannedLitter.maleName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dam</p>
            <p className="text-sm">{plannedLitter.femaleName}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">Expected Heat Date</p>
          <p className="text-sm">{format(new Date(plannedLitter.expectedHeatDate), 'PPP')}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">Gestation Period</p>
          <p className="text-sm">~63 days from mating</p>
        </div>

        {plannedLitter.matingDates && plannedLitter.matingDates.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">Mating Dates</p>
            <ul className="list-disc pl-4">
              {plannedLitter.matingDates.map((mating, index) => (
                <li key={mating.id} className="text-sm">
                  {format(new Date(mating.matingDate), 'PPP')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Add Mating Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <CalendarPrimitive
              mode="single"
              captionLayout="dropdown"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  handleAddMatingDate(date);
                }
                onCalendarOpenChange(false);
              }}
              disabled={(date) =>
                date > addDays(new Date(), 0) ||
                date < new Date(plannedLitter.expectedHeatDate) ||
                isWithinDays(date, new Date(plannedLitter.expectedHeatDate), 14)
              }
              className="border-0 rounded-md overflow-hidden"
            />
            <PopoverClose className="absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-secondary">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </PopoverClose>
          </PopoverContent>
        </Popover>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the litter and remove all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteLitter(plannedLitter.id)}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default PlannedLitterCard;
