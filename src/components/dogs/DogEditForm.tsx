
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import DogFormFields, { dogFormSchema, DogFormValues } from './DogFormFields';
import DogImageField from './DogImageField';
import HeatRecordsField from './HeatRecordsField';
import { Dog } from '@/types/dogs';
import { useSupabaseDogs } from '@/context/SupabaseDogContext';

interface DogEditFormProps {
  dog: Dog;
  onCancel: () => void;
  onSave: (values: DogFormValues) => void;
}

const DogEditForm: React.FC<DogEditFormProps> = ({ dog, onCancel, onSave }) => {
  const { heatRecords, updateDogInfo } = useSupabaseDogs();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform date strings to Date objects for form
  const transformHeatHistory = heatRecords 
    ? heatRecords.map(heat => ({ date: new Date(heat.date) }))
    : [];

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
      notes: dog.notes || '',
      image: dog.image_url || '',
      heatHistory: transformHeatHistory,
      heatInterval: dog.heatInterval,
    },
  });
  
  const handleSubmit = async (values: DogFormValues) => {
    setIsSubmitting(true);
    try {
      onSave(values);
    } catch (error) {
      console.error('Error updating dog:', error);
      toast({
        title: "Error",
        description: "Failed to update dog information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (imageBase64: string) => {
    form.setValue('image', imageBase64);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <DogImageField 
            form={form} 
            handleImageChange={handleImageChange} 
          />
          <div className="space-y-6">
            <DogFormFields form={form} />
            
            {form.watch('gender') === 'female' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Heat Cycle Information</h3>
                <HeatRecordsField form={form} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DogEditForm;
