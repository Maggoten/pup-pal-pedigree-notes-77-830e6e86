
import React, { useState } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import DogFormFields from './DogFormFields';
import { dogFormSchema, DogFormValues } from './schema/dogFormSchema';
import DogImageField from './DogImageField';
import HeatRecordsField from './HeatRecordsField';
import { Dog } from '@/types/dogs';
import { Loader2 } from 'lucide-react';

interface DogEditFormProps {
  dog: Dog;
  onCancel: () => void;
  onSave: (values: DogFormValues) => Promise<void>;
  isSaving?: boolean;
}

const DogEditForm: React.FC<DogEditFormProps> = ({ 
  dog, 
  onCancel, 
  onSave, 
  isSaving = false 
}) => {
  const [imageChanged, setImageChanged] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Prepare default values with proper date objects
  const defaultValues = {
    id: dog.id,
    name: dog.name,
    breed: dog.breed,
    dateOfBirth: dog.dateOfBirth ? new Date(dog.dateOfBirth) : new Date(),
    gender: dog.gender,
    color: dog.color,
    registrationNumber: dog.registrationNumber || '',
    dewormingDate: dog.dewormingDate ? new Date(dog.dewormingDate) : undefined,
    vaccinationDate: dog.vaccinationDate ? new Date(dog.vaccinationDate) : undefined,
    notes: dog.notes || '',
    image: dog.image_url || '',
    heatHistory: [],
    heatInterval: dog.heatInterval,
  };

  const form = useForm<DogFormValues>({
    resolver: zodResolver(dogFormSchema),
    defaultValues,
  });
  
  const onSubmit = async (values: DogFormValues) => {
    console.log("Form submitted with values:", values);
    
    // Clear previous image error
    setImageError(null);
    
    try {
      // Handle image changes
      if (imageChanged && values.image && values.image !== dog.image_url) {
        console.log("Image has been changed, passing to parent handler");
        
        // Check image size (rough estimate based on base64 length)
        if (values.image.length > 5000000) { // ~5MB limit
          setImageError("Image is too large. Please select a smaller image (under 5MB).");
          toast({
            title: "Image Too Large",
            description: "Please select a smaller image (under 5MB).",
            variant: "destructive"
          });
          return;
        }
      } else if (!imageChanged) {
        // Ensure we're using the existing image URL if it wasn't changed
        values.image = dog.image_url || '';
      }
      
      if (imageError) {
        return;
      }
      
      // Call the onSave function passed from the parent
      await onSave(values);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Failed to process form submission. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImageChange = (imageBase64: string) => {
    setImageError(null);
    
    // Basic validation for image
    if (imageBase64.length > 5000000) { // ~5MB limit
      setImageError("Image is too large. Please select a smaller image (under 5MB).");
      toast({
        title: "Image Too Large",
        description: "Please select a smaller image (under 5MB).",
        variant: "destructive"
      });
      return;
    }
    
    form.setValue('image', imageBase64);
    setImageChanged(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <div className="space-y-2">
            <DogImageField 
              form={form} 
              handleImageChange={handleImageChange} 
            />
            {imageError && (
              <p className="text-sm text-destructive mt-1">{imageError}</p>
            )}
          </div>
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
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !!imageError}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DogEditForm;
