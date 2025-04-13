import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import DogFormFields from './DogFormFields';
import { dogFormSchema, DogFormValues } from './schema/dogFormSchema';
import DogImageField from './DogImageField';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDog: (dog: any) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ open, onOpenChange, onAddDog }) => {
  const form = useForm<DogFormValues>({
    resolver: zodResolver(dogFormSchema),
    defaultValues: {
      name: '',
      breed: '',
      dateOfBirth: new Date(),
      gender: 'male',
      color: '',
      registrationNumber: '',
      dewormingDate: undefined,
      vaccinationDate: undefined,
      notes: '',
      image: '',
      heatHistory: [],
      heatInterval: undefined,
    },
  });

  const handleImageChange = (imageBase64: string) => {
    form.setValue('image', imageBase64);
  };

  const onSubmit = (values: DogFormValues) => {
    onAddDog(values);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Dog</DialogTitle>
          <DialogDescription>
            Fill in the information below to add a new dog to your breeding program.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
              <DogImageField 
                form={form} 
                handleImageChange={handleImageChange} 
              />
              <div>
                <DogFormFields form={form} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Add Dog</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
