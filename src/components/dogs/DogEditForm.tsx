
import React from 'react';
import { format } from 'date-fns';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { Dog } from '@/context/DogsContext';
import DogFormFields, { dogFormSchema, DogFormValues } from './DogFormFields';
import DogImageField from './DogImageField';

interface DogEditFormProps {
  dog: Dog;
  onCancel: () => void;
  onSave: (values: DogFormValues) => void;
}

const DogEditForm: React.FC<DogEditFormProps> = ({ dog, onCancel, onSave }) => {
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
      image: dog.image || '',
    },
  });
  
  const handleSubmit = (values: DogFormValues) => {
    const formattedValues = {
      ...values,
      dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : undefined,
      vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : undefined,
      dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
    };
    
    onSave(formattedValues);
    
    toast({
      title: "Dog updated",
      description: `${values.name}'s information has been updated.`,
    });
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
          <DogFormFields form={form} />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
};

export default DogEditForm;
