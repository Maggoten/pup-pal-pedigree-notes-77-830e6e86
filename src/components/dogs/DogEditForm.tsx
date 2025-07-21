
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dog } from '@/context/DogsContext';
import DogFormFields, { dogFormSchema, DogFormValues } from './DogFormFields';
import DogImageField from './DogImageField';
import HeatRecordsField from './heat-records/HeatRecordsField';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DogEditFormProps {
  dog: Dog;
  onCancel: () => void;
  onSave: (values: DogFormValues) => void;
  isLoading?: boolean;
}

const DogEditForm: React.FC<DogEditFormProps> = ({ dog, onCancel, onSave, isLoading = false }) => {
  const { t } = useTranslation('dogs');
  
  // Transform date strings to Date objects for form - FIXED: Better error handling
  const transformHeatHistory = dog.heatHistory && Array.isArray(dog.heatHistory)
    ? dog.heatHistory
        .filter(heat => heat && heat.date) // Filter out invalid entries
        .map(heat => {
          try {
            const date = new Date(heat.date);
            // Set to noon to avoid timezone issues
            date.setHours(12, 0, 0, 0);
            return { date };
          } catch (error) {
            console.error('Error converting heat date:', heat.date, error);
            return null;
          }
        })
        .filter(Boolean) // Remove failed conversions
    : [];
  
  console.log('[DogEditForm] Transformed heat history:', transformHeatHistory);

  const form = useForm<DogFormValues>({
    resolver: zodResolver(dogFormSchema),
    defaultValues: {
      name: dog.name,
      breed: dog.breed,
      dateOfBirth: new Date(dog.dateOfBirth),
      gender: dog.gender,
      color: dog.color,
      registrationNumber: dog.registrationNumber || '',
      dewormingDate: dog.dewormingDate ? new Date(dog.dewormingDate) : undefined,
      vaccinationDate: dog.vaccinationDate ? new Date(dog.vaccinationDate) : undefined,
      sterilizationDate: dog.sterilizationDate ? new Date(dog.sterilizationDate) : undefined,
      notes: dog.notes || '',
      image: dog.image || '',
      heatHistory: transformHeatHistory,
      heatInterval: dog.heatInterval,
    },
  });
  
  const handleSubmit = (values: DogFormValues) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <DogImageField 
            form={form} 
            handleImageChange={(imageBase64: string) => form.setValue('image', imageBase64)} 
            disabled={isLoading}
          />
          <div className="space-y-6">
            <DogFormFields form={form} disabled={isLoading} />
            
            {form.watch('gender') === 'female' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">{t('form.breeding.title')}</h3>
                <HeatRecordsField form={form} disabled={isLoading} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('form.actions.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t('form.actions.saving') : t('form.actions.saveChanges')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DogEditForm;
