
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Grid2X2 } from 'lucide-react';
import { Litter, Puppy } from '@/types/breeding';
import PuppyList from './PuppyList';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyGrowthChart from './PuppyGrowthChart';
import LitterEditDialog from './LitterEditDialog';

interface LitterDetailsProps {
  litter: Litter;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
}

const LitterDetails: React.FC<LitterDetailsProps> = ({
  litter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');

  const handlePuppySelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
  };

  const handleRowSelect = (puppy: Puppy) => {
    // This is used when clicking on a row to select a puppy for the chart
    setSelectedPuppy(puppy);
  };

  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    onUpdatePuppy(updatedPuppy);
    setSelectedPuppy(updatedPuppy);
  };

  // Extract the dam's breed from puppies array if available
  const getBreeds = () => {
    if (!litter.puppies || litter.puppies.length === 0) return 'Unknown';
    
    // Get unique breeds
    const breeds = [...new Set(litter.puppies
      .filter(puppy => puppy.breed)
      .map(puppy => puppy.breed))];
    
    if (breeds.length === 0) return 'Unknown';
    return breeds.join(', ');
  };

  const handleDeletePuppy = (puppyId: string) => {
    onDeletePuppy(puppyId);
    if (selectedPuppy && selectedPuppy.id === puppyId) {
      setSelectedPuppy(null);
      setShowPuppyDetailsDialog(false);
    }
  };

  const puppyCount = litter.puppies?.length || 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Litter Details</CardTitle>
              <CardDescription>
                Born: {new Date(litter.dateOfBirth).toLocaleDateString()} | 
                Sire: {litter.sireName} | 
                Dam: {litter.damName}
              </CardDescription>
            </div>
            <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Litter Details
                </Button>
              </DialogTrigger>
              <LitterEditDialog 
                litter={litter}
                onClose={() => setShowEditLitterDialog(false)}
                onUpdate={onUpdateLitter}
                onDelete={onDeleteLitter}
                onArchive={onArchiveLitter}
              />
            </Dialog>
          </div>
          {puppyCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Grid2X2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Breed: {getBreeds()}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <PuppyList 
            puppies={litter.puppies}
            onAddPuppy={onAddPuppy}
            onSelectPuppy={handlePuppySelect}
            onRowSelect={handleRowSelect}
            onUpdatePuppy={handleUpdatePuppy}
            onDeletePuppy={handleDeletePuppy}
            showAddPuppyDialog={showAddPuppyDialog}
            setShowAddPuppyDialog={setShowAddPuppyDialog}
            puppyNumber={1} // Always start with puppy 1 for each litter
            litterDob={litter.dateOfBirth}
            selectedPuppy={selectedPuppy}
            damBreed={getBreeds()} // Pass the mother's breed
          />
        </CardContent>
      </Card>
      
      {litter.puppies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedPuppy 
                  ? `${selectedPuppy.name}'s Growth Chart` 
                  : 'Litter Growth Chart'}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant={logType === 'weight' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogType('weight')}
                >
                  Weight
                </Button>
                <Button 
                  variant={logType === 'height' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogType('height')}
                >
                  Height
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedPuppy 
                ? `Tracking ${logType} for ${selectedPuppy.name}`
                : `Tracking ${logType} for the entire litter`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PuppyGrowthChart
              selectedPuppy={selectedPuppy}
              puppies={litter.puppies}
              logType={logType}
              setLogType={setLogType}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Puppy Details Dialog */}
      {selectedPuppy && (
        <Dialog open={showPuppyDetailsDialog} onOpenChange={setShowPuppyDetailsDialog}>
          <PuppyDetailsDialog 
            puppy={selectedPuppy} 
            onClose={() => setShowPuppyDetailsDialog(false)} 
            onUpdate={handleUpdatePuppy}
            onDelete={handleDeletePuppy}
          />
        </Dialog>
      )}
    </div>
  );
};

export default LitterDetails;
