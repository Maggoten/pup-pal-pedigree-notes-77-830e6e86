
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
import { Loader2 } from 'lucide-react';
import DogFormFields from './DogFormFields';
import { dogFormSchema, DogFormValues } from './schema/dogFormSchema';
import DogImageField from './DogImageField';
import { format } from 'date-fns';
import { useDogs } from '@/hooks/useDogs';
import { uploadDogImageFromBase64 } from '@/services/dogs';
import { toast } from '@/components/ui/use-toast';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ open, onOpenChange }) => {
  const [imageChanged, setImageChanged] = useState(false);
  const { addDog, isAddingDog, refreshDogs } = useDogs();
  
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
    setImageChanged(true);
  };

  const onSubmit = async (values: DogFormValues) => {
    try {
      console.log("Adding new dog with values:", values);
      
      const formattedValues = {
        ...values,
        dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
        dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : undefined,
        vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : undefined,
      };
      
      let imageUrl = null;
      if (values.image) {
        try {
          // We'll handle the image upload in the service
          imageUrl = values.image;
        } catch (error) {
          console.error("Error handling image:", error);
          toast({
            title: "Image Upload Failed",
            description: "Could not process the image, but we'll continue saving other data.",
            variant: "destructive",
          });
        }
      }
      
      await addDog({
        name: formattedValues.name,
        breed: formattedValues.breed,
        gender: formattedValues.gender,
        dateOfBirth: formattedValues.dateOfBirth,
        color: formattedValues.color,
        registrationNumber: formattedValues.registrationNumber,
        dewormingDate: formattedValues.dewormingDate,
        vaccinationDate: formattedValues.vaccinationDate,
        notes: formattedValues.notes,
        heatInterval: formattedValues.heatInterval,
        image_url: imageUrl,
      });
      
      onOpenChange(false);
      form.reset();
      
      await refreshDogs();
      
    } catch (error) {
      console.error("Error adding dog:", error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isAddingDog) {
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
              <Button type="submit" disabled={isAddingDog}>
                {isAddingDog ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : "Add Dog"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
