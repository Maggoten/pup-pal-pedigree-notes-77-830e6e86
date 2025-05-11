import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePuppy } from '@/services/PuppyService';
import { Puppy } from '@/types/puppies';
import { useAuth } from '@/hooks/useAuth';
import PuppyImageUploader, { PuppyImageUploaderProps } from './puppies/PuppyImageUploader';

interface PuppyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puppy: Puppy;
}

const PuppyDetailsDialog: React.FC<PuppyDetailsDialogProps> = ({ open, onOpenChange, puppy }) => {
  const [name, setName] = useState(puppy.name || '');
  const [birthDate, setBirthDate] = useState<Date | undefined>(puppy.birth_date ? new Date(puppy.birth_date) : undefined);
  const [gender, setGender] = useState(puppy.gender || '');
  const [imageUrl, setImageUrl] = useState(puppy.imageUrl || '');
  const { user } = useAuth();

  const queryClient = useQueryClient();

  useEffect(() => {
    setName(puppy.name || '');
    setBirthDate(puppy.birth_date ? new Date(puppy.birth_date) : undefined);
    setGender(puppy.gender || '');
    setImageUrl(puppy.imageUrl || '');
  }, [puppy]);

  const handleFieldChange = (field: string, value: any) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'birth_date':
        setBirthDate(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'imageUrl':
        setImageUrl(value);
        break;
      default:
        break;
    }
  };

  const { mutate: updatePuppyMutation, isLoading: isUpdating } = useMutation(
    async (updatedPuppyData: Partial<Puppy>) => {
      if (!puppy.id) {
        throw new Error("Puppy ID is missing");
      }
      return updatePuppy(puppy.id, updatedPuppyData);
    },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Puppy details updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['puppies', puppy.litter_id] });
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update puppy details: ${error.message || 'Unknown error'}`,
        });
      },
    }
  );

  const handleSaveChanges = async () => {
    const updatedPuppyData: Partial<Puppy> = {
      name,
      birth_date: birthDate ? birthDate.toISOString() : null,
      gender,
      imageUrl,
      updated_by: user?.id
    };

    updatePuppyMutation(updatedPuppyData);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Puppy Details</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to your puppy here. Click save when you're done.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthdate" className="text-right">
              Birthdate
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 pl-3 text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  {birthDate ? format(birthDate, "PPP") : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(date) => handleFieldChange('birth_date', date)}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender
            </Label>
            <Input id="gender" value={gender} onChange={(e) => handleFieldChange('gender', e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <div className="col-span-3">
              <PuppyImageUploader
                puppyId={puppy.id}
                litterId={puppy.litter_id}
                puppyName={puppy.name}
                currentImage={puppy.imageUrl}
                onImageChange={(newUrl) => handleFieldChange('imageUrl', newUrl)}
                large={true}
              />
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSaveChanges} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PuppyDetailsDialog;
