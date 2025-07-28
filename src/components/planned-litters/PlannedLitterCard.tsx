
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trash2, ClipboardCheck, PenLine } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { parseISO } from 'date-fns';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterDetailsDialog from './PlannedLitterDetailsDialog';
import PreBreedingChecklist from './PreBreedingChecklist';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface PlannedLitterCardProps {
  litter: PlannedLitter;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onEditMatingDate?: (litterId: string, dateIndex: number, newDate: Date) => void;
  onDeleteMatingDate?: (litterId: string, dateIndex: number) => void;
  onDeleteLitter: (litterId: string) => void;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
}

const PlannedLitterCard: React.FC<PlannedLitterCardProps> = ({
  litter,
  onAddMatingDate,
  onEditMatingDate,
  onDeleteMatingDate,
  onDeleteLitter,
  calendarOpen,
  onCalendarOpenChange
}) => {
  const { t } = useTranslation('plannedLitters');
  const [showChecklist, setShowChecklist] = useState(false);
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
    <Card className="flex flex-col h-full">
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
          {t('labels.expectedHeat')}: {new Date(litter.expectedHeatDate).toLocaleDateString()}
        </CardDescription>
        {litter.externalMale && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {t('labels.externalSire')}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm">{litter.notes}</p>
        
        {formattedMatingDates.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">{t('dialogs.litterDetails.matingDates')}:</h4>
            <ul className="mt-1 space-y-1">
              {formattedMatingDates.map((date, index) => (
                <li key={index} className="flex items-center justify-between py-1 text-sm">
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
                           <p>{t('buttons.editDate')}</p>
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
                           <p>{t('buttons.deleteDate')}</p>
                         </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 mt-auto pt-4">
        <div className="grid grid-cols-1 gap-2 w-full">
          <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t('buttons.addMatingDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
            {t('buttons.breedingChecklist')}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                {t('buttons.viewDetails')}
              </Button>
            </DialogTrigger>
            <PlannedLitterDetailsDialog 
              litter={litter} 
              onAddMatingDate={onAddMatingDate}
              onEditMatingDate={onEditMatingDate}
              onDeleteMatingDate={onDeleteMatingDate}
            />
          </Dialog>
        </div>
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
