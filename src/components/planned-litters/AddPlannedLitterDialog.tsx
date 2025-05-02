
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dog } from '@/context/DogsContext';
import { plannedLitterFormSchema, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import PlannedLitterForm from './form/PlannedLitterForm';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const form = useForm<PlannedLitterFormValues>({
    resolver: zodResolver(plannedLitterFormSchema),
    defaultValues: {
      maleId: "",
      femaleId: "",
      notes: "",
      externalMale: false,
      externalMaleName: "",
      externalMaleBreed: "",
      externalMaleRegistration: ""
    }
  });

  const handleSubmit = async (values: PlannedLitterFormValues) => {
    try {
      console.log('Handling form submission with values:', values);
      await onSubmit(values);
      
      // Reset form after successful submission
      form.reset();
      
      toast({
        title: "Success",
        description: "Planned litter has been added successfully.",
      });
    } catch (error) {
      console.error('Error submitting planned litter:', error);
      toast({
        title: "Error",
        description: "Failed to add planned litter. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <DialogHeader>
        <DialogTitle>Add Planned Litter</DialogTitle>
        <DialogDescription>
          Plan a future breeding between dogs
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-2">
        <PlannedLitterForm 
          form={form}
          males={males}
          females={females}
          onSubmit={handleSubmit}
        />
      </div>
    </DialogContent>
  );
};

export default AddPlannedLitterDialog;
