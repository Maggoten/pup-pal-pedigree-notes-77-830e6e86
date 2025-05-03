
import React, { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Grid2X2, Archive, Trash2, LayoutGrid, Folder } from 'lucide-react';
import { Litter, Puppy } from '@/types/breeding';
import LitterEditDialog from './LitterEditDialog';
import PuppyList from './PuppyList';

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
  
  // Use useMemo for computed values to prevent unnecessary recalculations
  const breeds = useMemo(() => {
    if (!litter.puppies || litter.puppies.length === 0) return 'Unknown';
    const breedSet = [...new Set(litter.puppies.filter(puppy => puppy.breed).map(puppy => puppy.breed))];
    if (breedSet.length === 0) return 'Unknown';
    return breedSet.join(', ');
  }, [litter.puppies]);
  
  const puppyCount = useMemo(() => litter.puppies?.length || 0, [litter.puppies]);
  const birthDate = useMemo(() => new Date(litter.dateOfBirth).toLocaleDateString(), [litter.dateOfBirth]);
  const litterAge = useMemo(() => 
    Math.floor((new Date().getTime() - new Date(litter.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 7)), 
    [litter.dateOfBirth]
  );
  
  const handleArchiveToggle = () => {
    onArchiveLitter(litter.id, !litter.archived);
  };
  
  const handleDeleteLitter = () => {
    if (confirm(`Are you sure you want to delete ${litter.name}? This action cannot be undone.`)) {
      onDeleteLitter(litter.id);
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {litter.name}
              {litter.archived && (
                <Badge variant="secondary" className="ml-2">Archived</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Born: {birthDate} • Sire: {litter.sireName} • Dam: {litter.damName}
              {breeds !== 'Unknown' && ` • Breed: ${breeds}`}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {/* Only render dialog when it's open to improve performance */}
            <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </DialogTrigger>
              {showEditLitterDialog && (
                <LitterEditDialog 
                  litter={litter} 
                  onClose={() => setShowEditLitterDialog(false)} 
                  onUpdate={onUpdateLitter}
                  onUpdateLitter={onUpdateLitter}
                  onDelete={onDeleteLitter}
                  onArchive={onArchiveLitter}
                />
              )}
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={handleArchiveToggle}
            >
              <Archive className="h-4 w-4" />
              <span>{litter.archived ? "Unarchive" : "Archive"}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10" 
              onClick={handleDeleteLitter}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Litter Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Total Puppies</div>
                <div className="text-2xl font-bold">{puppyCount}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Litter Age</div>
                <div className="text-2xl font-bold">{litterAge} weeks</div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Status</div>
                <div className="text-2xl font-bold">{litter.archived ? "Archived" : "Active"}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(LitterDetails);
