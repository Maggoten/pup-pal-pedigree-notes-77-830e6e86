import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Loader2, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface HeatLoggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatCycle: HeatCycle;
  onSuccess: () => void;
}

const HEAT_PHASES = [
  { value: 'proestrus', key: 'proestrus' },
  { value: 'estrus', key: 'estrus' },
  { value: 'metestrus', key: 'metestrus' },
  { value: 'anestrus', key: 'anestrus' }
];

const HeatLoggingDialog: React.FC<HeatLoggingDialogProps> = ({
  open,
  onOpenChange,
  heatCycle,
  onSuccess
}) => {
  const { t } = useTranslation('dogs');
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [temperature, setTemperature] = useState('');
  const [phase, setPhase] = useState('');
  const [observations, setObservations] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: t('heatTracking.logging.validation.dateRequired'),
        variant: 'destructive'
      });
      return;
    }

    // Validate that date is not in the future
    if (date > new Date()) {
      toast({
        title: t('heatTracking.logging.validation.futureDate'),
        variant: 'destructive'
      });
      return;
    }

    // Validate that date is not before heat cycle start
    const cycleStart = new Date(heatCycle.start_date);
    if (date < cycleStart) {
      toast({
        title: t('heatTracking.logging.validation.beforeCycleStart'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const temp = temperature ? parseFloat(temperature) : undefined;
      
      if (temperature && (isNaN(temp!) || temp! < 35 || temp! > 45)) {
        toast({
          title: t('heatTracking.logging.validation.invalidTemperature'),
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const result = await HeatService.createHeatLog(
        heatCycle.id,
        date,
        temp,
        phase || undefined,
        observations || undefined,
        notes || undefined
      );
      
      if (result) {
        toast({
          title: t('heatTracking.logging.success.added'),
          description: t('heatTracking.logging.success.addedDescription')
        });
        onSuccess();
        onOpenChange(false);
        // Reset form
        setDate(new Date());
        setTemperature('');
        setPhase('');
        setObservations('');
        setNotes('');
      } else {
        toast({
          title: t('heatTracking.logging.error.failed'),
          description: t('heatTracking.logging.error.failedDescription'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating heat log:', error);
      toast({
        title: t('heatTracking.logging.error.failed'),
        description: t('heatTracking.logging.error.failedDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            {t('heatTracking.logging.title')}
          </DialogTitle>
          <DialogDescription>
            {t('heatTracking.logging.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('heatTracking.logging.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : t('heatTracking.logging.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date > new Date() || date < new Date(heatCycle.start_date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">{t('heatTracking.logging.temperature')}</Label>
              <div className="relative">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="35"
                  max="45"
                  placeholder="38.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                  °C
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('heatTracking.logging.phase')}</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger>
                <SelectValue placeholder={t('heatTracking.logging.selectPhase')} />
              </SelectTrigger>
              <SelectContent>
                {HEAT_PHASES.map((phaseOption) => (
                  <SelectItem key={phaseOption.value} value={phaseOption.value}>
                    {t(`heatTracking.phases.${phaseOption.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">{t('heatTracking.logging.observations')}</Label>
            <Textarea
              id="observations"
              placeholder={t('heatTracking.logging.observationsPlaceholder')}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('heatTracking.logging.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('heatTracking.logging.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!date || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('heatTracking.logging.addEntry')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HeatLoggingDialog;