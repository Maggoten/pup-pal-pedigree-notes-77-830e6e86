import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import HeatDateList from './HeatDateList';
import HeatIntervalField from './HeatIntervalField';
import SterilizationDateField from './SterilizationDateField';
import { useTranslation } from 'react-i18next';

interface HeatRecordsFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const HeatRecordsField: React.FC<HeatRecordsFieldProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  // Skip rendering for male dogs
  if (form.getValues('gender') === 'male') {
    return null;
  }
  
  // Get heat history from form or initialize empty array
  const heatHistory = form.watch('heatHistory') || [];
  
  // Add a new heat date record with better validation
  const addHeatDate = () => {
    try {
      // Create date at noon to avoid timezone issues
      const newDate = new Date();
      newDate.setHours(12, 0, 0, 0);
      
      const newHeatHistory = [...heatHistory, { date: newDate }];
      form.setValue('heatHistory', newHeatHistory, { shouldValidate: true, shouldDirty: true });
      console.log('[HeatRecordsField] Added new heat date:', newDate, 'Total entries:', newHeatHistory.length);
    } catch (error) {
      console.error('[HeatRecordsField] Error adding heat date:', error);
    }
  };
  
  // Remove a heat date record with logging
  const removeHeatDate = (index: number) => {
    try {
      const newHeatHistory = [...heatHistory];
      const removedDate = newHeatHistory[index];
      newHeatHistory.splice(index, 1);
      form.setValue('heatHistory', newHeatHistory, { shouldValidate: true, shouldDirty: true });
      console.log('[HeatRecordsField] Removed heat date at index', index, ':', removedDate, 'Remaining entries:', newHeatHistory.length);
    } catch (error) {
      console.error('[HeatRecordsField] Error removing heat date:', error);
    }
  };
  
  // Update a heat date with validation
  const updateHeatDate = (index: number, date: Date) => {
    try {
      // Create date at noon to avoid timezone issues
      const newDate = new Date(date);
      newDate.setHours(12, 0, 0, 0);
      
      const newHeatHistory = [...heatHistory];
      newHeatHistory[index] = { date: newDate };
      form.setValue('heatHistory', newHeatHistory, { shouldValidate: true, shouldDirty: true });
      console.log(`[HeatRecordsField] Updated heat date at index ${index}:`, newDate, 'Total entries:', newHeatHistory.length);
    } catch (error) {
      console.error('[HeatRecordsField] Error updating heat date:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <Label>{t('form.breeding.heatHistory.label')}</Label>
          
          <div className="space-y-2">
            {heatHistory.length > 0 ? (
              <HeatDateList
                dates={heatHistory}
                onRemove={removeHeatDate}
                onUpdate={updateHeatDate}
                disabled={disabled}
              />
            ) : (
              <div className="text-sm text-muted-foreground">{t('form.breeding.heatHistory.noRecords')}</div>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeatDate}
              className="mt-2"
              disabled={disabled}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('form.breeding.heatHistory.addDate')}
            </Button>
          </div>
        </div>
        
        <HeatIntervalField form={form} disabled={disabled} />
      </div>
      
      <SterilizationDateField form={form} disabled={disabled} />
    </div>
  );
};

export default HeatRecordsField;
