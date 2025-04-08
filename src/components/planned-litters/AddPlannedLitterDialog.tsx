
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dog } from '@/context/DogsContext';
import { plannedLitterFormSchema, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import PlannedLitterForm from './form/PlannedLitterForm';

interface AddPlannedLitterDialogProps {
  males: Dog[];
  females: Dog[];
  onSubmit: (values: PlannedLitterFormValues) => void;
}

const AddPlannedLitterDialog: React.FC<AddPlannedLitterDialogProps> = ({
  males,
  females,
  onSubmit
}) => {
  const form = useForm<PlannedLitterFormValues>({
    resolver: zodResolver(plannedLitterFormSchema),
    defaultValues: {
      maleId: "",
      femaleId: "",
      notes: "",
      externalMale: false,
      externalMaleBreed: "",
      externalMaleRegistration: ""
    }
  });
  
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add Planned Litter</DialogTitle>
        <DialogDescription>
          Plan a future breeding between dogs
        </DialogDescription>
      </DialogHeader>
      
      <PlannedLitterForm 
        form={form}
        males={males}
        females={females}
        onSubmit={onSubmit}
      />
    </DialogContent>
  );
};

export default AddPlannedLitterDialog;
