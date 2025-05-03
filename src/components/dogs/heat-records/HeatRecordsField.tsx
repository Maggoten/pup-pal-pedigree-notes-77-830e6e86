
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import HeatDateList from './HeatDateList';
import HeatIntervalField from './HeatIntervalField';

interface HeatRecordsFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const HeatRecordsField: React.FC<HeatRecordsFieldProps> = ({ form, disabled }) => {
  // Skip rendering for male dogs
  if (form.getValues('gender') === 'male') {
    return null;
  }
  
  // Get heat history from form or initialize empty array
  const heatHistory = form.watch('heatHistory') || [];
  
  // Add a new heat date record
  const addHeatDate = () => {
    // Create date at noon to avoid timezone issues
    const newDate = new Date();
    newDate.setHours(12, 0, 0, 0);
    
    const newHeatHistory = [...heatHistory, { date: newDate }];
    form.setValue('heatHistory', newHeatHistory, { shouldValidate: true });
  };
  
  // Remove a heat date record
  const removeHeatDate = (index: number) => {
    const newHeatHistory = [...heatHistory];
    newHeatHistory.splice(index, 1);
    form.setValue('heatHistory', newHeatHistory, { shouldValidate: true });
  };
  
  // Update a heat date
  const updateHeatDate = (index: number, date: Date) => {
    // Create date at noon to avoid timezone issues
    const newDate = new Date(date);
    newDate.setHours(12, 0, 0, 0);
    
    const newHeatHistory = [...heatHistory];
    newHeatHistory[index] = { date: newDate };
    form.setValue('heatHistory', newHeatHistory, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label>Heat Cycles History</Label>
        
        <div className="space-y-2">
          {heatHistory.length > 0 ? (
            <HeatDateList
              dates={heatHistory}
              onRemove={removeHeatDate}
              onUpdate={updateHeatDate}
              disabled={disabled}
            />
          ) : (
            <div className="text-sm text-muted-foreground">No heat cycles recorded</div>
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
            Add Heat Date
          </Button>
        </div>
      </div>
      
      <HeatIntervalField form={form} disabled={disabled} />
    </div>
  );
};

export default HeatRecordsField;
