import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HeatPrediction } from '@/types/heatPlanning';
import { HeatService } from '@/services/HeatService';
import { formatAge } from '@/utils/formatAge';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Calendar, Loader2, Heart } from 'lucide-react';
import AddPlannedLitterDialog from '@/components/planned-litters/AddPlannedLitterDialog';
import { useDogs } from '@/hooks/dogs';
import { usePlannedLitters } from '@/components/planned-litters/hooks/usePlannedLitters';

interface HeatActionDialogProps {
  prediction: HeatPrediction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHeatConfirmed?: () => void;
}

export const HeatActionDialog: React.FC<HeatActionDialogProps> = ({
  prediction,
  open,
  onOpenChange,
  onHeatConfirmed,
}) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const { toast } = useToast();
  const locale = i18n.language === 'sv' ? sv : enUS;
  const [notes, setNotes] = useState(prediction?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showPlannedLitterDialog, setShowPlannedLitterDialog] = useState(false);
  
  const { dogs } = useDogs();
  const { males, females, handleAddPlannedLitter } = usePlannedLitters();

  if (!prediction) return null;

  const handleConfirmHeat = async () => {
    setIsLoading(true);
    try {
      const result = await HeatService.createHeatCycle(
        prediction.dogId,
        prediction.date,
        notes
      );

      if (result) {
        toast({
          title: t('toasts.success.title'),
          description: t('heatPlanner.actions.heatConfirmed'),
        });
        onHeatConfirmed?.();
        onOpenChange(false);
      } else {
        throw new Error('Failed to confirm heat');
      }
    } catch (error) {
      console.error('Error confirming heat:', error);
      toast({
        variant: 'destructive',
        title: t('toasts.error.title'),
        description: t('toasts.error.failedToConfirmHeat'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanLitter = () => {
    onOpenChange(false);
    setTimeout(() => {
      setShowPlannedLitterDialog(true);
    }, 100);
  };

  const canConfirm = prediction.status === 'predicted' || prediction.status === 'overdue';

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {prediction.dogName} - {t(`heatPlanner.status.${prediction.status}`)}
          </DialogTitle>
          <DialogDescription>
            {format(prediction.date, 'PPP', { locale })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Heat Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{t('heatPlanner.status.status')}:</span>
              <span className="text-muted-foreground">
                {t(`heatPlanner.status.${prediction.status}`)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{t('heatPlanner.dialog.age')}:</span>
              <span className="text-muted-foreground">
                {formatAge(prediction.ageAtHeat)} {t('heatPlanner.tooltip.years')}
              </span>
            </div>
            {prediction.interval > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{t('heatPlanner.dialog.interval')}:</span>
                <span className="text-muted-foreground">
                  ~{Math.round(prediction.interval / 30)} {t('heatPlanner.tooltip.months')}
                </span>
              </div>
            )}
            {prediction.hasPlannedLitter && (
              <div className="flex items-center gap-2 text-sm text-rose-600">
                <Calendar className="h-4 w-4" />
                <span>{t('heatPlanner.status.planned')}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('heatPlanner.dialog.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('heatPlanner.dialog.notesPlaceholder')}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant="secondary"
            onClick={handlePlanLitter}
            disabled={isLoading}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            {t('heatPlanner.actions.planLitter')}
          </Button>
          {canConfirm && (
            <Button
              onClick={handleConfirmHeat}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {t('heatPlanner.actions.confirmHeat')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Planned Litter Dialog */}
    <Dialog open={showPlannedLitterDialog} onOpenChange={setShowPlannedLitterDialog}>
      <AddPlannedLitterDialog
        males={males}
        females={females}
        onSubmit={(values) => {
          handleAddPlannedLitter(values);
          setShowPlannedLitterDialog(false);
        }}
        prefilledFemaleId={prediction.dogId}
        prefilledHeatDate={prediction.date}
      />
    </Dialog>
    </>
  );
};
