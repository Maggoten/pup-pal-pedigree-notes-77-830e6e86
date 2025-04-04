
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import NewLitterForm from './dialog/NewLitterForm';
import PlannedLitterForm from './dialog/PlannedLitterForm';

interface AddLitterDialogProps {
  onClose: () => void;
  onSubmit: (litter: any) => void;
  plannedLitters: PlannedLitter[];
}

const AddLitterDialog: React.FC<AddLitterDialogProps> = ({ onClose, onSubmit, plannedLitters }) => {
  const { dogs } = useDogs();
  const [createType, setCreateType] = useState<'new' | 'planned'>('new');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [selectedMaleId, setSelectedMaleId] = useState<string>('');
  const [selectedFemaleId, setSelectedFemaleId] = useState<string>('');
  const [litterName, setLitterName] = useState<string>(`Litter ${new Date().toLocaleDateString()}`);
  const [selectedPlannedLitterId, setSelectedPlannedLitterId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let newLitter;

      if (createType === 'new') {
        // Validation
        if (!selectedFemaleId) {
          toast({
            title: "Error",
            description: "Please select a dam (female dog)",
            variant: "destructive"
          });
          return;
        }

        const selectedFemale = dogs.find(dog => dog.id === selectedFemaleId);
        const selectedMale = dogs.find(dog => dog.id === selectedMaleId);

        newLitter = {
          id: Date.now().toString(),
          name: litterName,
          dateOfBirth: dateOfBirth.toISOString().split('T')[0],
          sireId: selectedMaleId,
          damId: selectedFemaleId,
          sireName: selectedMale ? selectedMale.name : 'Unknown Sire',
          damName: selectedFemale ? selectedFemale.name : 'Unknown Dam',
          puppies: []
        };
      } else {
        // Validation
        if (!selectedPlannedLitterId) {
          toast({
            title: "Error",
            description: "Please select a planned litter",
            variant: "destructive"
          });
          return;
        }

        const plannedLitter = plannedLitters.find(litter => litter.id === selectedPlannedLitterId);
        if (!plannedLitter) {
          toast({
            title: "Error",
            description: "Selected planned litter not found",
            variant: "destructive"
          });
          return;
        }

        newLitter = {
          id: Date.now().toString(),
          name: litterName,
          dateOfBirth: dateOfBirth.toISOString().split('T')[0],
          sireId: plannedLitter.maleId,
          damId: plannedLitter.femaleId,
          sireName: plannedLitter.maleName,
          damName: plannedLitter.femaleName,
          puppies: []
        };
      }

      onSubmit(newLitter);
      onClose();
    } catch (error) {
      toast({
        title: "Error Creating Litter",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add New Litter</DialogTitle>
        <DialogDescription>
          Create a new litter record or convert a planned litter.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={createType} onValueChange={(value) => setCreateType(value as 'new' | 'planned')} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Litter</TabsTrigger>
          <TabsTrigger value="planned">From Planned Litter</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <NewLitterForm
            litterName={litterName}
            setLitterName={setLitterName}
            selectedMaleId={selectedMaleId}
            setSelectedMaleId={setSelectedMaleId}
            selectedFemaleId={selectedFemaleId}
            setSelectedFemaleId={setSelectedFemaleId}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            onSubmit={handleSubmit}
          />
        </TabsContent>

        <TabsContent value="planned">
          <PlannedLitterForm
            plannedLitters={plannedLitters}
            litterName={litterName}
            setLitterName={setLitterName}
            selectedPlannedLitterId={selectedPlannedLitterId}
            setSelectedPlannedLitterId={setSelectedPlannedLitterId}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            onSubmit={handleSubmit}
          />
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>Create Litter</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddLitterDialog;
