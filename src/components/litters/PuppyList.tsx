
import React from 'react';
import { Edit, Trash2, BarChart2 } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Puppy } from '@/types/breeding';
import PuppyDetailsDialog from './PuppyDetailsDialog';

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
  const getLatestMeasurement = (puppy: Puppy, type: 'weight' | 'height') => {
    const log = type === 'weight' ? puppy.weightLog : puppy.heightLog;
    if (log.length === 0) return 'Not recorded';
    
    const latestEntry = log.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const value = type === 'weight' 
      ? (latestEntry as {weight: number}).weight 
      : (latestEntry as {height: number}).height;
      
    return `${value} ${type === 'weight' ? 'kg' : 'cm'}`;
  };

  const handleDeletePuppy = (puppyId: string, puppyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Do you want to delete "${puppyName}"?`)) {
      onDeletePuppy(puppyId);
    }
  };

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
          {puppies.map(puppy => (
            <tr 
              key={puppy.id}
              className={`border-b hover:bg-muted/50 cursor-pointer ${selectedPuppyId === puppy.id ? 'bg-primary/5' : ''}`}
              onClick={() => onPuppyClick && onPuppyClick(puppy)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {/* Ensure we're displaying the exact puppy name with no modifications */}
                  <span>{puppy.name}</span>
                  {litterAge && litterAge < 2 && (
                    <Badge variant="outline" className="text-xs font-normal">New</Badge>
                  )}
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
                    onClick={() => onAddMeasurement && onAddMeasurement(puppy)}
                    className="h-8 w-8"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="sr-only">Add measurement</span>
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    onClick={(e) => handleDeletePuppy(puppy.id, puppy.name, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete puppy</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PuppyList;
