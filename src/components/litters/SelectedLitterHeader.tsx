
import React, { useState, memo } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Litter } from '@/types/breeding';
import LitterEditDialog from './LitterEditDialog';

interface SelectedLitterHeaderProps {
  litter: Litter;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  ageInWeeks: number;
}

const SelectedLitterHeader: React.FC<SelectedLitterHeaderProps> = ({
  litter,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  ageInWeeks
}) => {
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">{litter.name}</h2>
        {ageInWeeks > 0 && (
          <p className="text-sm text-muted-foreground">{ageInWeeks} weeks old</p>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={() => setShowEditLitterDialog(true)}
      >
        <Edit className="h-4 w-4" />
        <span className="sr-only">Edit Litter</span>
      </Button>
      {/* Only render dialog when it's open to improve performance */}
      {showEditLitterDialog && (
        <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
          <LitterEditDialog 
            litter={litter}
            onClose={() => setShowEditLitterDialog(false)}
            onUpdate={onUpdateLitter}
            onUpdateLitter={onUpdateLitter}
            onDelete={onDeleteLitter}
            onArchive={onArchiveLitter}
          />
        </Dialog>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(SelectedLitterHeader);
