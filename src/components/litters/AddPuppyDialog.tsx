
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import DatePicker from '@/components/common/DatePicker';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import { Puppy } from '@/types/breeding';
import PuppyGenderSelector from './puppies/PuppyGenderSelector';
import PuppyImageUploader from './puppies/PuppyImageUploader';

interface AddPuppyDialogProps {
  onClose: () => void;
  onAddPuppy: (puppy: Puppy) => void;
  puppyNumber?: number;
  litterDob: string;
  damBreed?: string;
}

const AddPuppyDialog: React.FC<AddPuppyDialogProps> = ({ 
  onClose, 
  onAddPuppy, 
  puppyNumber = 1,
  litterDob,
  damBreed = ''
}) => {
  const defaultDob = new Date(litterDob);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [color, setColor] = useState<string>('');
  const [birthWeight, setBirthWeight] = useState<string>('');
  const [timeOfBirth, setTimeOfBirth] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultDob);
  const [breed, setBreed] = useState<string>(damBreed);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  useEffect(() => {
    setName(`Puppy ${puppyNumber}`);
  }, [puppyNumber]);

  // Update breed when damBreed changes (e.g. if dialog is reused)
  useEffect(() => {
    if (damBreed) {
      console.log("Setting puppy breed to dam's breed:", damBreed);
      setBreed(damBreed);
    }
  }, [damBreed]);

  const handleGenderChange = (value: 'male' | 'female') => {
    setGender(value);
  };

  const handleImageChange = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a datetime for birth
      let birthDateTime = new Date(dateOfBirth);
      if (timeOfBirth) {
        const [hours, minutes] = timeOfBirth.split(':').map(Number);
        birthDateTime.setHours(hours, minutes);
      }

      // Generate a unique ID using UUID format that will work with Supabase
      // Note: Using a proper UUID format for compatibility with Supabase's UUID column type
      const newId = crypto.randomUUID();
      
      const weightValue = birthWeight ? parseFloat(birthWeight) : 0;
      
      // Create a weight log entry for birth weight
      const initialWeightLog = weightValue ? [{
        date: dateOfBirth.toISOString().split('T')[0],
        weight: weightValue
      }] : [];

      const newPuppy: Puppy = {
        id: newId,
        name,
        gender,
        color: color || '', // Ensure color is not undefined
        breed: breed || damBreed || '', // Use breed if selected, fallback to dam breed, or empty string
        birthWeight: weightValue,
        birthDateTime: birthDateTime.toISOString(),
        imageUrl: imageUrl, // Add the image URL
        weightLog: initialWeightLog,
        heightLog: [],
        notes: []
      };

      console.log("Adding new puppy:", newPuppy);
      await onAddPuppy(newPuppy);
      toast({
        title: "Puppy Added",
        description: `${name} has been added to the litter successfully.`,
      });
      onClose();
    } catch (error) {
      console.error("Error adding puppy:", error);
      toast({
        title: "Error Adding Puppy",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add New Puppy</DialogTitle>
          <DialogDescription>
            Add a new puppy to your litter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-center mb-4">
            <PuppyImageUploader
              puppyName={name}
              currentImage={imageUrl}
              onImageChange={handleImageChange}
              large={true}
            />
          </div>
          
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Puppy name"
              className="bg-white border-greige-300"
              required
            />
          </div>

          <PuppyGenderSelector gender={gender} onGenderChange={handleGenderChange} />

          <div>
            <Label htmlFor="breed">Breed</Label>
            <BreedDropdown 
              value={breed} 
              onChange={setBreed}
              className="bg-white border-greige-300"
            />
            {damBreed && breed !== damBreed && (
              <p className="text-xs text-muted-foreground mt-1">
                Mother's breed: {damBreed}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Input 
              id="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              placeholder="Puppy color"
              className="bg-white border-greige-300"
            />
          </div>

          <div>
            <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
            <Input 
              id="birthWeight" 
              value={birthWeight} 
              onChange={(e) => setBirthWeight(e.target.value)} 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              className="bg-white border-greige-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <DatePicker 
              date={dateOfBirth} 
              setDate={setDateOfBirth}
              className="bg-white border-greige-300"
            />
          </div>

          <div>
            <Label htmlFor="timeOfBirth">Time of Birth</Label>
            <Input 
              id="timeOfBirth" 
              value={timeOfBirth} 
              onChange={(e) => setTimeOfBirth(e.target.value)} 
              type="time"
              className="bg-white border-greige-300"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Puppy"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddPuppyDialog;
