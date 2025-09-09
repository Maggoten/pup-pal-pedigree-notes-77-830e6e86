import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface DeleteHeatCycleDialogProps {
  heatCycle: HeatCycle;
  onSuccess: () => void;
}

export const DeleteHeatCycleDialog: React.FC<DeleteHeatCycleDialogProps> = ({ 
  heatCycle, 
  onSuccess 
}) => {
  const { t } = useTranslation('dogs');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const success = await HeatService.deleteHeatCycle(heatCycle.id);
      
      if (success) {
        setOpen(false);
        toast({
          title: t('heatTracking.deleteSuccess.title'),
          description: t('heatTracking.deleteSuccess.description'),
        });
        // Add delay to prevent synthetic clicks
        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        throw new Error('Failed to delete heat cycle');
      }
    } catch (error) {
      console.error('Error deleting heat cycle:', error);
      toast({
        title: t('heatTracking.deleteError.title'),
        description: t('heatTracking.deleteError.description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'PPP');
  };

  const getDuration = () => {
    if (!heatCycle.end_date) return null;
    const start = parseISO(heatCycle.start_date);
    const end = parseISO(heatCycle.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('heatTracking.deleteDialog.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('heatTracking.deleteDialog.confirmationMessage')}
          </p>
          
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">{t('heatTracking.deleteDialog.startDate')}: </span>
              {formatDate(heatCycle.start_date)}
            </div>
            {heatCycle.end_date && (
              <div className="text-sm">
                <span className="font-medium">{t('heatTracking.deleteDialog.endDate')}: </span>
                {formatDate(heatCycle.end_date)}
              </div>
            )}
            {getDuration() && (
              <div className="text-sm">
                <span className="font-medium">{t('heatTracking.deleteDialog.duration')}: </span>
                {t('heatTracking.analytics.days', { days: getDuration() })}
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {t('heatTracking.deleteDialog.warningMessage')}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {t('form.actions.cancel')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? t('form.actions.deleting') : t('form.actions.delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteHeatCycleDialog;