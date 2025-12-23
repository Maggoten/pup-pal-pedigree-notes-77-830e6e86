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
import { useTranslation } from 'react-i18next';
import { dateToISOString } from '@/utils/dateUtils';

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
  const { t } = useTranslation('litters');
  const defaultDob = new Date(litterDob);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [color, setColor] = useState<string>('');
  const [birthWeight, setBirthWeight] = useState<string>('');
  const [timeOfBirth, setTimeOfBirth] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultDob);
  const [breed, setBreed] = useState<string>(damBreed);
  const [markings, setMarkings] = useState<string>('');
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
      
      // Create a weight log entry for birth weight (timezone-safe)
      const initialWeightLog = weightValue ? [{
        date: dateToISOString(dateOfBirth),
        weight: weightValue
      }] : [];

      const newPuppy: Puppy = {
        id: newId,
        name,
        gender,
        color: color || '', // Ensure color is not undefined
        markings: markings || undefined,
        breed: breed || damBreed || '', // Use breed if selected, fallback to dam breed, or empty string
        birthWeight: weightValue,
        birthDateTime: birthDateTime.toISOString(),
        imageUrl: imageUrl, // Add the image URL
        registration_number: '', // Initialize as empty
        weightLog: initialWeightLog,
        heightLog: [],
        notes: []
      };

      console.log("Adding new puppy:", newPuppy);
      await onAddPuppy(newPuppy);
      toast({
        title: t('toasts.success.litterAdded'),
        description: `${name} has been added to the litter successfully.`,
      });
      onClose();
    } catch (error) {
      console.error("Error adding puppy:", error);
      toast({
        title: t('toasts.error.failedToAddLitter'),
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
          <DialogTitle>{t('puppies.titles.addPuppy')}</DialogTitle>
          <DialogDescription>
            {t('puppies.descriptions.addPuppy')}
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
            <Label htmlFor="name">{t('puppies.labels.name')}</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('puppies.placeholders.puppyName')}
              className="bg-white border-greige-300"
              required
            />
          </div>

          <PuppyGenderSelector gender={gender} onGenderChange={handleGenderChange} />

          <div>
            <Label htmlFor="breed">{t('puppies.labels.breed')}</Label>
            <BreedDropdown 
              value={breed} 
              onChange={setBreed}
              className="bg-white border-greige-300"
            />
            {damBreed && breed !== damBreed && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('puppies.descriptions.motherBreed', { breed: damBreed })}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="color">{t('puppies.labels.color')}</Label>
            <Input 
              id="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              placeholder={t('puppies.placeholders.puppyColor')}
              className="bg-white border-greige-300"
            />
          </div>

          <div>
            <Label htmlFor="markings">{t('puppies.labels.markings')}</Label>
            <Input 
              id="markings" 
              value={markings} 
              onChange={(e) => setMarkings(e.target.value)} 
              placeholder={t('puppies.placeholders.markings')}
              className="bg-white border-greige-300"
            />
          </div>

          <div>
            <Label htmlFor="birthWeight">{t('puppies.labels.birthWeight')}</Label>
            <Input 
              id="birthWeight" 
              value={birthWeight} 
              onChange={(e) => setBirthWeight(e.target.value)} 
              type="number" 
              step="0.01" 
              placeholder={t('puppies.placeholders.weightPlaceholder')}
              className="bg-white border-greige-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t('puppies.labels.dateOfBirth')}</Label>
            <DatePicker 
              date={dateOfBirth} 
              setDate={setDateOfBirth}
              className="bg-white border-greige-300"
            />
          </div>

          <div>
            <Label htmlFor="timeOfBirth">{t('puppies.labels.timeOfBirth')}</Label>
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
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('puppies.actions.adding') : t('puppies.actions.addPuppy')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddPuppyDialog;
