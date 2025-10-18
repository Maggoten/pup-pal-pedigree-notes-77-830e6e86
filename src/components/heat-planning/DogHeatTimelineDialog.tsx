import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeatBadge } from './HeatBadge';
import { HeatPrediction } from '@/types/heatPlanning';
import { formatAge } from '@/utils/formatAge';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { toast } from '@/components/ui/use-toast';

interface DogHeatTimelineDialogProps {
  dogId: string | null;
  dogName: string;
  predictions: HeatPrediction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DogHeatTimelineDialog: React.FC<DogHeatTimelineDialogProps> = ({
  dogId,
  dogName,
  predictions,
  open,
  onOpenChange,
}) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const { addCustomReminder } = useBreedingReminders();
  const locale = i18n.language === 'sv' ? sv : enUS;

  // Sort predictions by date
  const sortedPredictions = [...predictions].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  const handleSetReminder = async (prediction: HeatPrediction) => {
    if (!dogId) return;

    const success = await addCustomReminder({
      title: t('heatPlanner.timeline.reminderTitle', { dogName }),
      description: t('heatPlanner.timeline.reminderDescription', {
        dogName,
        date: format(prediction.date, 'PPP', { locale })
      }),
      dueDate: prediction.date,
      priority: 'medium',
    });

    if (success) {
      toast({
        title: t('heatPlanner.timeline.reminderSet'),
        description: t('heatPlanner.timeline.reminderSetDescription', {
          date: format(prediction.date, 'PPP', { locale })
        }),
      });
    } else {
      toast({
        title: t('toasts.error.title'),
        description: t('heatPlanner.timeline.reminderFailed'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{t('heatPlanner.timeline.title')} - {dogName}</DialogTitle>
          <DialogDescription>
            {t('heatPlanner.timeline.subtitle', { count: sortedPredictions.length })}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {sortedPredictions.map((prediction) => {
              const monthsInterval = Math.round(prediction.interval / 30);
              
              return (
                <Card key={prediction.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[80px]">
                        <div className="font-bold text-lg">
                          {format(prediction.date, 'd MMM', { locale })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.year}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 flex-1">
                        <HeatBadge prediction={prediction} />
                        <div className="text-sm text-muted-foreground">
                          {t('heatPlanner.timeline.age')}: {formatAge(prediction.ageAtHeat)} {t('heatPlanner.tooltip.years')}
                        </div>
                        {monthsInterval > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {t('heatPlanner.timeline.interval', { months: monthsInterval })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetReminder(prediction)}
                      className="shrink-0 w-full sm:w-auto"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {t('heatPlanner.actions.setReminder')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
