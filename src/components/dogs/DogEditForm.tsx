
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dog } from '@/context/DogsContext';
import DogFormFields, { dogFormSchema, DogFormValues } from './DogFormFields';
import DogImageField from './DogImageField';
import HeatRecordsField from './HeatRecordsField';
import { Loader2 } from 'lucide-react';

interface DogEditFormProps {
  dog: Dog;
  onCancel: () => void;
  onSave: (values: DogFormValues) => void;
  isLoading?: boolean;
}

const DogEditForm: React.FC<DogEditFormProps> = ({ dog, onCancel, onSave, isLoading = false }) => {
  // Transform date strings to Date objects for form
  const transformHeatHistory = dog.heatHistory 
    ? dog.heatHistory.map(heat => ({ date: new Date(heat.date) }))
    : [];
    
  // Get the birth year from the dateOfBirth
  const birthDate = new Date(dog.dateOfBirth);
  const birthYear = birthDate.getFullYear();

  const form = useForm<DogFormValues>({
    resolver: zodResolver(dogFormSchema),
    defaultValues: {
      name: dog.name,
      breed: dog.breed,
      dateOfBirth: new Date(dog.dateOfBirth),
      birthYear: birthYear,
      gender: dog.gender,
      color: dog.color,
      registrationNumber: dog.registrationNumber || '',
      dewormingDate: dog.dewormingDate ? new Date(dog.dewormingDate) : undefined,
      vaccinationDate: dog.vaccinationDate ? new Date(dog.vaccinationDate) : undefined,
      notes: dog.notes || '',
      image: dog.image || '',
      heatHistory: transformHeatHistory,
      heatInterval: dog.heatInterval,
    },
  });
  
  const handleSubmit = (values: DogFormValues) => {
    // Ensure the dateOfBirth year matches the selected birthYear
    const updatedDateOfBirth = new Date(values.dateOfBirth);
    updatedDateOfBirth.setFullYear(values.birthYear);
    values.dateOfBirth = updatedDateOfBirth;
    
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
                <h3 className="text-lg font-medium mb-4">Heat Cycle Information</h3>
                <HeatRecordsField form={form} disabled={isLoading} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DogEditForm;
