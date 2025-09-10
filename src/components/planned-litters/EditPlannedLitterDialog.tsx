import React, { useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dog } from '@/context/DogsContext';
import { plannedLitterFormSchema, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterForm from './form/PlannedLitterForm';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface EditPlannedLitterDialogProps {
  litter: PlannedLitter;
  males: Dog[];
  females: Dog[];
  onSubmit: (litterId: string, values: PlannedLitterFormValues) => void;
}

// Helper function to convert PlannedLitter to PlannedLitterFormValues
const convertLitterToFormValues = (litter: PlannedLitter): PlannedLitterFormValues => {
  return {
    femaleId: litter.femaleId,
    femaleName: litter.femaleName,
    maleId: litter.externalMale ? undefined : litter.maleId,
    maleName: litter.externalMale ? undefined : litter.maleName,
    externalMale: litter.externalMale || false,
    externalMaleName: litter.externalMale ? (litter.maleName || null) : null,
    externalMaleBreed: litter.externalMaleBreed || null,
    externalMaleRegistration: litter.externalMaleRegistration || null,
    externalMaleImageUrl: litter.externalMaleImageUrl || null,
    expectedHeatDate: new Date(litter.expectedHeatDate),
    notes: litter.notes || ''
  };
};

const EditPlannedLitterDialog: React.FC<EditPlannedLitterDialogProps> = ({
  litter,
  males,
  females,
  onSubmit
}) => {
  const { t } = useTranslation('plannedLitters');
  const { toast } = useToast();
  
  const form = useForm<PlannedLitterFormValues>({
    resolver: zodResolver(plannedLitterFormSchema),
    defaultValues: convertLitterToFormValues(litter)
  });

  // Update form when litter changes
  useEffect(() => {
    form.reset(convertLitterToFormValues(litter));
  }, [litter, form]);

  const handleSubmit = async (values: PlannedLitterFormValues) => {
    try {
      console.log('Handling edit form submission with values:', values);
      await onSubmit(litter.id, values);
      
      toast({
        title: t('toasts.success.title'),
        description: t('toasts.success.litterUpdated'),
      });
    } catch (error) {
      console.error('Error updating planned litter:', error);
      toast({
        title: t('toasts.error.title'),
        description: t('toasts.error.failedToUpdateLitter'),
        variant: "destructive"
      });
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <DialogHeader>
        <DialogTitle>{t('forms.plannedLitter.editTitle')}</DialogTitle>
        <DialogDescription>
          {t('forms.plannedLitter.editDescription')}
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

export default EditPlannedLitterDialog;