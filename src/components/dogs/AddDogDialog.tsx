
import React, { useState } from 'react';
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
import { format } from 'date-fns';
import { uploadDogImageFromBase64 } from '@/services/dogs';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDog: (dog: any) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ open, onOpenChange, onAddDog }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const onSubmit = async (values: DogFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Format dates
      const formattedValues = {
        ...values,
        dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
        dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : undefined,
        vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : undefined,
      };
      
      // Generate temporary dog ID for image upload
      const tempDogId = uuidv4();
      
      // Handle image upload if an image was provided
      let imageUrl = null;
      if (values.image) {
        imageUrl = await uploadDogImageFromBase64(values.image, tempDogId);
      }
      
      // Add the image URL to the dog data
      const dogData = {
        ...formattedValues,
        image_url: imageUrl,
      };
      
      // Add the dog
      onAddDog(dogData);
      onOpenChange(false);
      form.reset();
      
    } catch (error) {
      console.error("Error adding dog:", error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isSubmitting) {
        onOpenChange(newOpen);
        if (!newOpen) {
          form.reset();
        }
      }
    }}>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Dog"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
