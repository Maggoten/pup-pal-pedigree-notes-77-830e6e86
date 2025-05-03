
import React, { useMemo, useCallback } from 'react';
import { Edit, Trash2, BarChart2 } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Puppy, PuppyWeightRecord, PuppyHeightRecord } from '@/types/breeding';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PuppyListProps {
  puppies: Puppy[];
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onPuppyClick?: (puppy: Puppy) => void;
  selectedPuppyId?: string | null;
  onAddMeasurement?: (puppy: Puppy) => void;
  litterAge?: number;
}

const PuppyList: React.FC<PuppyListProps> = ({
  puppies,
  onUpdatePuppy,
  onDeletePuppy,
  onPuppyClick,
  selectedPuppyId,
  onAddMeasurement,
  litterAge
}) => {
  // Type guard function to check if a record is a weight record
  const isWeightRecord = (record: PuppyWeightRecord | PuppyHeightRecord): record is PuppyWeightRecord => {
    return 'weight' in record;
  };

  // Type guard function to check if a record is a height record
  const isHeightRecord = (record: PuppyWeightRecord | PuppyHeightRecord): record is PuppyHeightRecord => {
    return 'height' in record;
  };
  
  // Memoize the getLatestMeasurement function to avoid recreating it on every render
  const getLatestMeasurement = useCallback((puppy: Puppy, type: 'weight' | 'height') => {
    const log = type === 'weight' ? puppy.weightLog : puppy.heightLog;
    if (!log || log.length === 0) return 'Not recorded';

    // Sort logs by date, most recent first
    const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEntry = sortedLog[0];

    // Use the type guard functions to properly handle the types
    if (type === 'weight' && isWeightRecord(latestEntry)) {
      return `${latestEntry.weight} kg`;
    } else if (type === 'height' && isHeightRecord(latestEntry)) {
      return `${latestEntry.height} cm`;
    } else {
      return 'Invalid record';
    }
  }, []);
  
  const handleDeletePuppy = useCallback((puppyId: string, puppyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Do you want to delete "${puppyName}"?`)) {
      onDeletePuppy(puppyId);
    }
  }, [onDeletePuppy]);
  
  // Memoize puppies table rows to prevent unnecessary re-renders
  const puppyRows = useMemo(() => (
    puppies.map(puppy => (
      <Dialog key={puppy.id}>
        <DialogTrigger asChild>
          <tr 
            className={`border-b hover:bg-muted/50 cursor-pointer ${selectedPuppyId === puppy.id ? 'bg-primary/5' : ''}`} 
            onClick={() => onPuppyClick && onPuppyClick(puppy)}
          >
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {puppy.imageUrl ? 
                    <AvatarImage src={puppy.imageUrl} alt={puppy.name} className="object-cover" /> : 
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {puppy.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  }
                </Avatar>
                <span>{puppy.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 capitalize">{puppy.gender}</td>
            <td className="px-4 py-3">{puppy.color}</td>
            <td className="px-4 py-3">{getLatestMeasurement(puppy, 'weight')}</td>
            <td className="px-4 py-3">{getLatestMeasurement(puppy, 'height')}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={e => {
                    e.stopPropagation();
                    onAddMeasurement && onAddMeasurement(puppy);
                  }} 
                  className="h-8 w-8"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span className="sr-only">Add measurement</span>
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={e => e.stopPropagation()}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit puppy</span>
                    </Button>
                  </DialogTrigger>
                  <PuppyDetailsDialog 
                    puppy={puppy} 
                    onUpdatePuppy={onUpdatePuppy} 
                    onDeletePuppy={onDeletePuppy} 
                  />
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={e => handleDeletePuppy(puppy.id, puppy.name, e)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete puppy</span>
                </Button>
              </div>
            </td>
          </tr>
        </DialogTrigger>
        <PuppyDetailsDialog 
          puppy={puppy} 
          onUpdatePuppy={onUpdatePuppy} 
          onDeletePuppy={onDeletePuppy} 
        />
      </Dialog>
    ))
  ), [puppies, selectedPuppyId, getLatestMeasurement, handleDeletePuppy, onAddMeasurement, onPuppyClick, onUpdatePuppy, onDeletePuppy]);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="px-4 py-3 font-medium text-sm text-muted-foreground">Name</th>
            <th className="px-4 py-3 font-medium text-sm text-muted-foreground">Gender</th>
            <th className="px-4 py-3 font-medium text-sm text-muted-foreground">Color</th>
            <th className="px-4 py-3 font-medium text-sm text-muted-foreground">Current Weight</th>
            <th className="px-4 py-3 font-medium text-sm text-muted-foreground">Current Height</th>
            <th className="px-4 py-3 font-medium text-sm text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {puppyRows}
        </tbody>
      </table>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(PuppyList);
