
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import DatePicker from '@/components/common/DatePicker';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLitterService } from '@/services/PlannedLitterService';

interface AddLitterDialogProps {
  onClose: () => void;
  onSubmit: (litter: any) => void; // We'll type this properly in a later step
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

  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');

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
      <form onSubmit={handleSubmit}>
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

          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="litterName">Litter Name</Label>
                <Input 
                  id="litterName" 
                  value={litterName} 
                  onChange={(e) => setLitterName(e.target.value)} 
                  placeholder="Spring Litter 2025"
                />
              </div>

              <div>
                <Label htmlFor="female">Dam (Female)</Label>
                <select
                  id="female"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedFemaleId}
                  onChange={(e) => setSelectedFemaleId(e.target.value)}
                >
                  <option value="">Select Dam</option>
                  {females.map(dog => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="male">Sire (Male)</Label>
                <select
                  id="male"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedMaleId}
                  onChange={(e) => setSelectedMaleId(e.target.value)}
                >
                  <option value="">Select Sire</option>
                  {males.map(dog => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name}
                    </option>
                  ))}
                </select>
              </div>

              <DatePicker 
                date={dateOfBirth} 
                setDate={setDateOfBirth} 
                label="Date of Birth" 
              />
            </div>
          </TabsContent>

          <TabsContent value="planned" className="space-y-4 mt-4">
            {plannedLitters.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No planned litters available.</p>
                <p className="text-sm mt-2">Create a planned litter first in the Planned Litters section.</p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="plannedLitter">Select Planned Litter</Label>
                  <select
                    id="plannedLitter"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPlannedLitterId}
                    onChange={(e) => setSelectedPlannedLitterId(e.target.value)}
                  >
                    <option value="">Select a planned litter</option>
                    {plannedLitters.map(litter => (
                      <option key={litter.id} value={litter.id}>
                        {litter.maleName} × {litter.femaleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="plannedLitterName">Litter Name</Label>
                  <Input 
                    id="plannedLitterName" 
                    value={litterName} 
                    onChange={(e) => setLitterName(e.target.value)}
                    placeholder="Spring Litter 2025" 
                  />
                </div>

                <DatePicker 
                  date={dateOfBirth} 
                  setDate={setDateOfBirth} 
                  label="Date of Birth" 
                />
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Litter</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddLitterDialog;
