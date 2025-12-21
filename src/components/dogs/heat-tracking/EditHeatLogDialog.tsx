import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import {
  ProgesteroneUnit,
  getStoredUnit,
  setStoredUnit,
  convertToNgForStorage,
  convertFromNgForDisplay,
  getValidationRange,
  getUnitLabel
} from '@/utils/progesteroneUnits';

type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface EditHeatLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatLog: HeatLog;
  onSuccess: () => void;
}

const HEAT_PHASES = [
  { value: 'proestrus', label: 'Proestrus' },
  { value: 'estrus', label: 'Estrus' },
  { value: 'metestrus', label: 'Metestrus' },
  { value: 'anestrus', label: 'Anestrus' }
];

const EditHeatLogDialog: React.FC<EditHeatLogDialogProps> = ({ 
  open, 
  onOpenChange, 
  heatLog,
  onSuccess 
}) => {
  const { t } = useTranslation('dogs');
  const [date, setDate] = useState<Date>();
  const [temperature, setTemperature] = useState('');
  const [progesteroneValue, setProgesteroneValue] = useState('');
  const [progesteroneUnit, setProgesteroneUnit] = useState<ProgesteroneUnit>(() => getStoredUnit());
  const [phase, setPhase] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with existing data when dialog opens
  useEffect(() => {
    if (open && heatLog) {
      setDate(parseISO(heatLog.date));
      setTemperature(heatLog.temperature ? heatLog.temperature.toString() : '');
      // Convert stored ng/ml value to user's preferred unit for display
      const unit = getStoredUnit();
      setProgesteroneUnit(unit);
      if (heatLog.progesterone_value !== null && heatLog.progesterone_value !== undefined) {
        const displayValue = convertFromNgForDisplay(heatLog.progesterone_value, unit);
        setProgesteroneValue(displayValue.toString());
      } else {
        setProgesteroneValue('');
      }
      setPhase(heatLog.phase || '');
      setObservations(heatLog.observations || '');
      setNotes(heatLog.notes || '');
    }
  }, [open, heatLog]);

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: t('heatTracking.editLog.validation.dateRequired'),
        description: t('heatTracking.editLog.validation.dateRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    // Validate date is not in the future
    if (date > new Date()) {
      toast({
        title: t('heatTracking.editLog.validation.invalidDate'),
        description: t('heatTracking.editLog.validation.futureDate'),
        variant: 'destructive',
      });
      return;
    }

    // Validate temperature if provided
    const tempValue = temperature ? parseFloat(temperature) : undefined;
    if (temperature && (isNaN(tempValue!) || tempValue! < 30 || tempValue! > 45)) {
      toast({
        title: t('heatTracking.editLog.validation.invalidTemperature'),
        description: t('heatTracking.editLog.validation.invalidTemperatureDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Handle progesterone conversion if value is provided
      let progesteroneForStorage: number | undefined = undefined;
      if (progesteroneValue) {
        const progesteroneInput = parseFloat(progesteroneValue);
        const validationRange = getValidationRange(progesteroneUnit);
        if (!isNaN(progesteroneInput) && progesteroneInput >= validationRange.min && progesteroneInput <= validationRange.max) {
          progesteroneForStorage = convertToNgForStorage(progesteroneInput, progesteroneUnit);
          setStoredUnit(progesteroneUnit);
        }
      }

      const updatedLog = await HeatService.updateHeatLog(heatLog.id, {
        date: date.toISOString(),
        temperature: tempValue,
        progesterone_value: progesteroneForStorage,
        phase: phase || undefined,
        observations: observations || undefined,
        notes: notes || undefined
      });

      if (updatedLog) {
        toast({
          title: t('heatTracking.editLog.success.title'),
          description: t('heatTracking.editLog.success.description'),
        });
        onSuccess();
      } else {
        throw new Error('Failed to update heat log');
      }
    } catch (error) {
      console.error('Error updating heat log:', error);
      toast({
        title: t('heatTracking.editLog.error.title'),
        description: t('heatTracking.editLog.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('heatTracking.editLog.title')}</DialogTitle>
          <DialogDescription>
            {t('heatTracking.editLog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t('heatTracking.editLog.date')} *</Label>
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
                  {date ? format(date, "PPP") : <span>{t('heatTracking.editLog.pickDate')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">{t('heatTracking.editLog.temperature')}</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="30"
              max="45"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={t('heatTracking.editLog.temperaturePlaceholder')}
            />
          </div>

          {/* Progesterone field with unit selector */}
          <div className="space-y-2">
            <Label htmlFor="progesterone">{t('heatTracking.logging.progesteroneValue', { defaultValue: 'Progesterone Value' })}</Label>
            <div className="flex gap-2">
              <Input
                id="progesterone"
                type="number"
                step="0.1"
                min="0"
                max={getValidationRange(progesteroneUnit).max}
                value={progesteroneValue}
                onChange={(e) => setProgesteroneValue(e.target.value)}
                placeholder={progesteroneUnit === 'nmol' ? '8.0' : '2.5'}
                className="flex-1"
              />
              <Select 
                value={progesteroneUnit} 
                onValueChange={(value: ProgesteroneUnit) => {
                  // Convert current value when switching units
                  if (progesteroneValue) {
                    const currentValue = parseFloat(progesteroneValue);
                    if (!isNaN(currentValue)) {
                      if (value === 'nmol' && progesteroneUnit === 'ng') {
                        setProgesteroneValue((currentValue * 3.18).toFixed(1));
                      } else if (value === 'ng' && progesteroneUnit === 'nmol') {
                        setProgesteroneValue((currentValue / 3.18).toFixed(1));
                      }
                    }
                  }
                  setProgesteroneUnit(value);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ng">ng/ml</SelectItem>
                  <SelectItem value="nmol">nmol/L</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">{t('heatTracking.editLog.phase')}</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger>
                <SelectValue placeholder={t('heatTracking.editLog.selectPhase')} />
              </SelectTrigger>
              <SelectContent>
                {HEAT_PHASES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {t(`heatTracking.phases.${p.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">{t('heatTracking.editLog.observations')}</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder={t('heatTracking.editLog.observationsPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('heatTracking.editLog.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('heatTracking.editLog.notesPlaceholder')}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('heatTracking.editLog.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !date}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('heatTracking.editLog.updateEntry')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHeatLogDialog;