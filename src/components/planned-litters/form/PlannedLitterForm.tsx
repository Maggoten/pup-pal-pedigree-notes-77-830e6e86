
import React from 'react';
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
