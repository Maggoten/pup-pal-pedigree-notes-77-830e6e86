
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trash2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { updatePuppy, deletePuppy } from '@/services/PuppyService';
import { Puppy } from '@/types/puppies';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PuppyImageUploader from './puppies/PuppyImageUploader';

export interface PuppyDetailsDialogProps {
  puppy: Puppy;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onClose: () => void;
}

const PuppyDetailsDialog: React.FC<PuppyDetailsDialogProps> = ({
  puppy,
  onUpdatePuppy,
  onDeletePuppy,
  onClose
}) => {
  const [puppyData, setPuppyData] = useState<Puppy>({ ...puppy });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPuppyData(prev => ({ ...prev, [name]: value }));
  };
  
  const updatePuppyMutation = useMutation({
    mutationFn: async (updatedPuppyData: Puppy) => {
      return await updatePuppy(updatedPuppyData.id, updatedPuppyData);
    },
    onSuccess: (data) => {
      onUpdatePuppy(data);
      toast({
        title: "Puppy updated",
        description: `${puppyData.name}'s details have been updated.`
      });
      queryClient.invalidateQueries({ queryKey: ['puppies', puppyData.litter_id] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: `Failed to update puppy details: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const deletePuppyMutation = useMutation({
    mutationFn: async () => {
      return await deletePuppy(puppy.id);
    },
    onSuccess: () => {
      onDeletePuppy(puppy.id);
      toast({
        title: "Puppy deleted",
        description: `${puppy.name} has been removed from the litter.`
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ['puppies', puppy.litter_id] });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: `Failed to delete puppy: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleSave = () => {
    updatePuppyMutation.mutate(puppyData);
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    deletePuppyMutation.mutate();
  };
  
  const handleImageChange = (newImageUrl: string) => {
    setPuppyData(prev => ({ ...prev, imageUrl: newImageUrl }));
    // Immediately update in parent component
    const updatedPuppy = { ...puppyData, imageUrl: newImageUrl };
    onUpdatePuppy(updatedPuppy);
  };
  
  return (
    <>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Puppy Details</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="photo" className="flex-1">Photo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={puppyData.name} 
                    onChange={handleInputChange}
                    placeholder="Puppy name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input 
                    id="color"
                    name="color"
                    value={puppyData.color || ''} 
                    onChange={handleInputChange}
                    placeholder="Color"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collar_color">Collar Color</Label>
                  <Input 
                    id="collar_color"
                    name="collar_color"
                    value={puppyData.collar_color || ''} 
                    onChange={handleInputChange}
                    placeholder="Collar color"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_weight">Birth Weight (g)</Label>
                  <Input 
                    id="birth_weight"
                    name="birth_weight"
                    type="number"
                    value={puppyData.birth_weight || ''} 
                    onChange={handleInputChange}
                    placeholder="Birth weight"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="photo" className="py-4 flex flex-col items-center">
            <PuppyImageUploader 
              puppyId={puppy.id}
              litterId={puppy.litter_id}
              puppyName={puppyData.name}
              currentImage={puppyData.imageUrl}
              onImageChange={handleImageChange}
              large={true}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deletePuppyMutation.isPending}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSave}
              disabled={updatePuppyMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Puppy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {puppy.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PuppyDetailsDialog;
