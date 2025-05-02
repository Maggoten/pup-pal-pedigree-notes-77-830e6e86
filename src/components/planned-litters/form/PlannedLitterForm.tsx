
import React, { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { Dog } from '@/context/DogsContext';
import DamSelector from './DamSelector';
import ExternalSireToggle from './ExternalSireToggle';
import InternalSireSelector from './InternalSireSelector';
import ExternalSireFields from './ExternalSireFields';
import HeatDatePicker from './HeatDatePicker';
import NotesField from './NotesField';
import { addDays, parseISO } from 'date-fns';

interface PlannedLitterFormProps {
  form: UseFormReturn<PlannedLitterFormValues>;
  males: Dog[];
  females: Dog[];
  onSubmit: (values: PlannedLitterFormValues) => void;
}

const PlannedLitterForm: React.FC<PlannedLitterFormProps> = ({
  form,
  males,
  females,
  onSubmit
}) => {
  const isExternalMale = form.watch("externalMale");
  const selectedFemaleId = form.watch("femaleId");
  
  // Calculate next expected heat date when female dog is selected
  useEffect(() => {
    if (selectedFemaleId) {
      const selectedFemale = females.find(female => female.id === selectedFemaleId);
      
      if (selectedFemale?.heatHistory?.length) {
        // Sort heat dates (newest first)
        const sortedHeatDates = [...selectedFemale.heatHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Get the most recent heat date
        const lastHeatDate = parseISO(sortedHeatDates[0].date);
        
        // Use the dog's heat interval if available, otherwise default to 180 days (6 months)
        const intervalDays = selectedFemale.heatInterval || 180;
        
        // Calculate next heat date
        const nextHeatDate = addDays(lastHeatDate, intervalDays);
        
        // Set the calculated heat date in the form
        form.setValue("expectedHeatDate", nextHeatDate);
      }
    }
  }, [selectedFemaleId, females, form]);
  
  const handleSubmit = (values: PlannedLitterFormValues) => {
    // Find the selected female to get the name
    const selectedFemale = females.find(female => female.id === values.femaleId);
    if (!selectedFemale) {
      console.error('Selected female not found');
      return;
    }

    // If it's not an external male, find the selected male to get the name
    let maleName = values.externalMaleName;
    if (!isExternalMale && values.maleId) {
      const selectedMale = males.find(male => male.id === values.maleId);
      maleName = selectedMale?.name;
    }

    // Add female name to the form values
    const enrichedValues = {
      ...values,
      femaleName: selectedFemale.name,
      maleName: maleName || ''
    };

    console.log('Submitting form with values:', enrichedValues);
    onSubmit(enrichedValues);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DamSelector form={form} females={females} />
        
        <ExternalSireToggle form={form} />
        
        {!isExternalMale ? (
          <InternalSireSelector form={form} males={males} />
        ) : (
          <ExternalSireFields form={form} />
        )}
        
        <HeatDatePicker form={form} />
        
        <NotesField form={form} />
        
        <DialogFooter className="mt-6">
          <Button type="submit">Add Litter</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PlannedLitterForm;
