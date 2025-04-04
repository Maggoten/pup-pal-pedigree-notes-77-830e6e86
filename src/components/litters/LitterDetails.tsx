
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
}

const LitterDetails: React.FC<LitterDetailsProps> = ({
  litter,
  onAddPuppy,
  onUpdatePuppy
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');

  const handlePuppySelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
  };

  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    onUpdatePuppy(updatedPuppy);
    setSelectedPuppy(updatedPuppy);
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
            showAddPuppyDialog={showAddPuppyDialog}
            setShowAddPuppyDialog={setShowAddPuppyDialog}
            puppyNumber={litter.puppies.length + 1}
            litterDob={litter.dateOfBirth}
          />
        </CardContent>
      </Card>
      
      {litter.puppies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Puppy Growth Charts</span>
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
                : 'Tracking the entire litter'}
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
          />
        </Dialog>
      )}
    </div>
  );
};

export default LitterDetails;
