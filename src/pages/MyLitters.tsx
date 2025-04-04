
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Dog, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLitterService } from '@/services/PlannedLitterService';
import AddLitterDialog from '@/components/litters/AddLitterDialog';
import EmptyLitterState from '@/components/litters/EmptyLitterState';
import LitterDetails from '@/components/litters/LitterDetails';
import LitterSearchForm from '@/components/litters/LitterSearchForm';
import LitterEditDialog from '@/components/litters/LitterEditDialog';

const MyLitters: React.FC = () => {
  const [littersData, setLittersData] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  const [plannedLitters, setPlannedLitters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const loadedLitters = litterService.loadLitters();
    if (loadedLitters.length > 0) {
      setLittersData(loadedLitters);
      setSelectedLitterId(loadedLitters[0].id);
    }
    
    const loadedPlannedLitters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(loadedPlannedLitters);
  }, []);
  
  const handleAddLitter = (newLitter: Litter) => {
    newLitter.puppies = [];
    
    const updatedLitters = litterService.addLitter(newLitter);
    setLittersData(updatedLitters);
    setSelectedLitterId(newLitter.id);
    
    toast({
      title: "Litter Added",
      description: `${newLitter.name} has been added successfully.`
    });
  };
  
  const handleUpdateLitter = (updatedLitter: Litter) => {
    const updatedLitters = litterService.updateLitter(updatedLitter);
    setLittersData(updatedLitters);
    
    toast({
      title: "Litter Updated",
      description: `${updatedLitter.name} has been updated successfully.`
    });
    
    setShowEditLitterDialog(false);
  };
  
  const handleAddPuppy = (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.addPuppy(selectedLitterId, newPuppy);
    setLittersData(updatedLitters);
    
    toast({
      title: "Puppy Added",
      description: `${newPuppy.name} has been added to the litter.`
    });
  };
  
  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.updatePuppy(selectedLitterId, updatedPuppy);
    setLittersData(updatedLitters);
  };

  const handleDeletePuppy = (puppyId: string) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.deletePuppy(selectedLitterId, puppyId);
    setLittersData(updatedLitters);
  };

  const handleDeleteLitter = (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      const updatedLitters = litterService.deleteLitter(litterId);
      setLittersData(updatedLitters);
      
      if (selectedLitterId === litterId) {
        setSelectedLitterId(updatedLitters.length > 0 ? updatedLitters[0].id : null);
      }
      
      toast({
        title: "Litter Deleted",
        description: "The litter has been deleted successfully.",
        variant: "destructive"
      });
      
      setShowEditLitterDialog(false);
    }
  };
  
  const filteredLitters = littersData.filter(litter => {
    if (!searchQuery.trim()) return true;
    
    const searchTermLower = searchQuery.toLowerCase();
    return (
      litter.name.toLowerCase().includes(searchTermLower) ||
      litter.sireName.toLowerCase().includes(searchTermLower) ||
      litter.damName.toLowerCase().includes(searchTermLower)
    );
  });
  
  const selectedLitter = selectedLitterId 
    ? filteredLitters.find(litter => litter.id === selectedLitterId) 
    : null;
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<Dog className="h-6 w-6" />}
    >
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-4">
          <LitterSearchForm 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Litter
              </Button>
            </DialogTrigger>
            <AddLitterDialog 
              onClose={() => setShowAddLitterDialog(false)} 
              onSubmit={handleAddLitter}
              plannedLitters={plannedLitters}
            />
          </Dialog>
        </div>
      </div>
      
      {filteredLitters.length > 0 ? (
        <>
          <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
            <div className="flex items-start">
              <TabsList className="w-full justify-start overflow-auto border p-2 rounded-lg bg-muted/50">
                {filteredLitters.map(litter => (
                  <TabsTrigger 
                    key={litter.id} 
                    value={litter.id} 
                    className="px-6 py-2 font-medium rounded-md relative"
                  >
                    <span className="text-primary font-semibold">{litter.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {selectedLitter && (
              <TabsContent value={selectedLitter.id} className="space-y-4">
                <div className="flex justify-end mb-2">
                  <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Litter Details
                      </Button>
                    </DialogTrigger>
                    <LitterEditDialog 
                      litter={selectedLitter}
                      onClose={() => setShowEditLitterDialog(false)}
                      onUpdate={handleUpdateLitter}
                      onDelete={handleDeleteLitter}
                    />
                  </Dialog>
                </div>
                
                <LitterDetails
                  litter={selectedLitter}
                  onAddPuppy={handleAddPuppy}
                  onUpdatePuppy={handleUpdatePuppy}
                  onDeletePuppy={handleDeletePuppy}
                />
              </TabsContent>
            )}
          </Tabs>
        </>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No matching litters found</h3>
          <p className="text-muted-foreground">Try adjusting your search term</p>
        </div>
      ) : (
        <EmptyLitterState onAddLitter={() => setShowAddLitterDialog(true)} />
      )}
    </PageLayout>
  );
};

export default MyLitters;
