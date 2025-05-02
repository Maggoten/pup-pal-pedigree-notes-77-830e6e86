
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Grid2X2 } from 'lucide-react';
import { Litter, Puppy } from '@/types/breeding';
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
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);

  const getBreeds = () => {
    if (!litter.puppies || litter.puppies.length === 0) return 'Unknown';
    
    const breeds = [...new Set(litter.puppies
      .filter(puppy => puppy.breed)
      .map(puppy => puppy.breed))];
    
    if (breeds.length === 0) return 'Unknown';
    return breeds.join(', ');
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="sr-only">Litter Details</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto" onClick={() => setShowEditLitterDialog(true)}>
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Edit Litter</span>
          </Button>
          <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
            <LitterEditDialog 
              litter={litter}
              onClose={() => setShowEditLitterDialog(false)}
              onUpdate={onUpdateLitter}
              onDelete={onDeleteLitter}
              onArchive={onArchiveLitter}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {litter.puppies.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <h3 className="text-sm font-medium mr-1 flex items-center gap-1">
                  <Grid2X2 className="h-3.5 w-3.5 text-primary" />
                  <span>Breed:</span>
                </h3>
                <span className="text-sm">{getBreeds()}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <h3 className="text-sm font-medium mr-1 w-full">Colors:</h3>
                {[...new Set(litter.puppies.map(p => p.color))].map(color => (
                  <Badge key={color} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LitterDetails;
