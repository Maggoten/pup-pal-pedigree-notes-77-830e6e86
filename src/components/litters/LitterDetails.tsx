
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Litter, Puppy } from '@/types/breeding';
import PuppyList from './PuppyList';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyGrowthChart from './PuppyGrowthChart';

interface LitterDetailsProps {
  litter: Litter;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const LitterDetails: React.FC<LitterDetailsProps> = ({
  litter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
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
  const getDamBreed = () => {
    if (litter.puppies.length > 0) {
      // Check if any puppy has a breed set
      const puppyWithBreed = litter.puppies.find(puppy => puppy.breed);
      if (puppyWithBreed && puppyWithBreed.breed) {
        return puppyWithBreed.breed;
      }
    }
    return ''; // Return empty string if no breed found
  };

  const handleDeletePuppy = (puppyId: string) => {
    onDeletePuppy(puppyId);
    if (selectedPuppy && selectedPuppy.id === puppyId) {
      setSelectedPuppy(null);
      setShowPuppyDetailsDialog(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Litter Details</CardTitle>
          <CardDescription>
            Born: {new Date(litter.dateOfBirth).toLocaleDateString()} | 
            Sire: {litter.sireName} | 
            Dam: {litter.damName}
          </CardDescription>
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
            damBreed={getDamBreed()} // Pass the mother's breed
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
