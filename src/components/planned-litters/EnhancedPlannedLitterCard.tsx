import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Trash2, 
  ClipboardCheck, 
  PenLine, 
  Eye,
  Plus,
  Image as ImageIcon 
} from 'lucide-react';
import BreedingTimeline from './BreedingTimeline';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterDetailsDialog from './PlannedLitterDetailsDialog';
import PreBreedingChecklist from './PreBreedingChecklist';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { useDogs } from '@/context/dogs/useDogs';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface EnhancedPlannedLitterCardProps {
  litter: PlannedLitter;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onEditMatingDate?: (litterId: string, dateIndex: number, newDate: Date) => void;
  onDeleteMatingDate?: (litterId: string, dateIndex: number) => void;
  onDeleteLitter: (litterId: string) => void;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
}

const EnhancedPlannedLitterCard: React.FC<EnhancedPlannedLitterCardProps> = ({
  litter,
  onAddMatingDate,
  onEditMatingDate,
  onDeleteMatingDate,
  onDeleteLitter,
  calendarOpen,
  onCalendarOpenChange
}) => {
  const { t } = useTranslation('plannedLitters');
  const { dogs } = useDogs();
  const [showChecklist, setShowChecklist] = useState(false);
  const [editingDateIndex, setEditingDateIndex] = useState<number | null>(null);
  
  const handleEditMatingDate = (date: Date | undefined) => {
    if (date && editingDateIndex !== null && onEditMatingDate) {
      onEditMatingDate(litter.id, editingDateIndex, date);
      setEditingDateIndex(null);
    }
  };

  // Get dog details
  const femaleDog = dogs.find(d => d.id === litter.femaleId);
  const maleDog = litter.externalMale ? null : dogs.find(d => d.id === litter.maleId);

  // Format mating dates for display
  const formattedMatingDates = litter.matingDates && litter.matingDates.length > 0 
    ? litter.matingDates.map(dateStr => typeof dateStr === 'string' ? new Date(dateStr) : dateStr)
    : [];

  const DogAvatar: React.FC<{ dog: any; name: string; gender: 'male' | 'female'; externalImageUrl?: string }> = ({ dog, name, gender, externalImageUrl }) => {
    // For external males, use the provided image URL, otherwise use dog's image
    const imageUrl = externalImageUrl || dog?.image;
    
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <Badge 
            className={`absolute -top-1 -right-1 text-xs px-1 py-0 h-4 ${
              gender === 'male' ? 'bg-blue-500' : 'bg-rose-400'
            }`}
          >
            {gender === 'male' ? '♂' : '♀'}
          </Badge>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{gender === 'male' ? 'Sire' : 'Dam'}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="dog-card overflow-hidden">
      <CardHeader className="pb-4">        
        <div className="space-y-4">
          {/* Parent Dogs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DogAvatar 
              dog={femaleDog} 
              name={litter.femaleName} 
              gender="female" 
            />
            <DogAvatar 
              dog={maleDog} 
              name={litter.maleName || ''} 
              gender="male"
              externalImageUrl={litter.externalMale ? litter.externalMaleImageUrl : undefined}
            />
          </div>
          
          {/* Breeding Timeline */}
          <BreedingTimeline 
            expectedHeatDate={litter.expectedHeatDate}
            matingDates={litter.matingDates}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Notes */}
        {litter.notes && (
          <p className="text-sm text-muted-foreground">{litter.notes}</p>
        )}
        
        {/* Mating Dates */}
        {formattedMatingDates.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t('dialogs.litterDetails.matingDates')}:</h4>
            <div className="space-y-2">
              {formattedMatingDates.map((date, index) => (
                <div key={index} className="flex items-center justify-between py-1.5 px-2 bg-secondary/30 rounded-lg text-sm">
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
                    <span className="font-medium">{date.toLocaleDateString()}</span>
                  )}
                  
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setEditingDateIndex(index)}
                          >
                            <PenLine className="h-3 w-3" />
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
                            className="h-6 w-6 text-destructive"
                            onClick={() => onDeleteMatingDate && onDeleteMatingDate(litter.id, index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('buttons.deleteDate')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Icons Row */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Plus className="h-4 w-4" />
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('buttons.addMatingDate')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9"
                    onClick={() => setShowChecklist(true)}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('buttons.breedingChecklist')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-destructive"
                  onClick={() => onDeleteLitter(litter.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('buttons.deleteLitter')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>

      {/* Breeding Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <PreBreedingChecklist litter={litter} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EnhancedPlannedLitterCard;