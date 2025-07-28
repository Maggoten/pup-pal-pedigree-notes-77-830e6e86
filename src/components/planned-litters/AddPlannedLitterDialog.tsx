
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dog } from '@/context/DogsContext';
import { plannedLitterFormSchema, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import PlannedLitterForm from './form/PlannedLitterForm';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('plannedLitters');
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
      externalMaleRegistration: "",
      expectedHeatDate: new Date()
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
        description: t('toasts.success.litterAdded'),
      });
    } catch (error) {
      console.error('Error submitting planned litter:', error);
      toast({
        title: "Error",
        description: t('toasts.error.failedToAddLitter'),
        variant: "destructive"
      });
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <DialogHeader>
        <DialogTitle>{t('forms.plannedLitter.title')}</DialogTitle>
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
