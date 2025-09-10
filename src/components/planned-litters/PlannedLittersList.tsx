import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PlannedLitter } from '@/types/breeding';
import EnhancedPlannedLitterCard from '@/components/planned-litters/EnhancedPlannedLitterCard';
import AddPlannedLitterDialog from '@/components/planned-litters/AddPlannedLitterDialog';
import EditPlannedLitterDialog from '@/components/planned-litters/EditPlannedLitterDialog';
import EmptyPlannedLitters from '@/components/planned-litters/EmptyPlannedLitters';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { Dog } from '@/context/DogsContext';
import { useTranslation } from 'react-i18next';
interface PlannedLittersListProps {
  plannedLitters: PlannedLitter[];
  males: Dog[];
  females: Dog[];
  onAddPlannedLitter: (values: PlannedLitterFormValues) => void;
  onEditPlannedLitter: (litterId: string, values: PlannedLitterFormValues) => void;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onEditMatingDate?: (litterId: string, dateIndex: number, newDate: Date) => void;
  onDeleteMatingDate?: (litterId: string, dateIndex: number) => void;
  onDeleteLitter: (litterId: string) => void;
}
const PlannedLittersList: React.FC<PlannedLittersListProps> = ({
  plannedLitters,
  males,
  females,
  onAddPlannedLitter,
  onEditPlannedLitter,
  onAddMatingDate,
  onEditMatingDate,
  onDeleteMatingDate,
  onDeleteLitter
}) => {
  const { t } = useTranslation('plannedLitters');
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; litter: PlannedLitter | null }>({
    open: false,
    litter: null
  });
  const [calendarOpen, setCalendarOpen] = useState<{
    [litterId: string]: boolean;
  }>({});

  const handleEditLitter = (litter: PlannedLitter) => {
    setEditDialog({ open: true, litter });
  };
  return <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('actions.addPlannedLitter')}
            </Button>
          </DialogTrigger>
          
          <AddPlannedLitterDialog males={males} females={females} onSubmit={values => {
          onAddPlannedLitter(values);
          setOpenDialog(false);
        }} />
        </Dialog>
      </div>

      {plannedLitters.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plannedLitters.map(litter => (
            <EnhancedPlannedLitterCard 
              key={litter.id} 
              litter={litter} 
              onAddMatingDate={onAddMatingDate} 
              onEditMatingDate={onEditMatingDate} 
              onDeleteMatingDate={onDeleteMatingDate}
              onEditLitter={handleEditLitter}
              onDeleteLitter={onDeleteLitter} 
              calendarOpen={calendarOpen[litter.id] || false} 
              onCalendarOpenChange={open => setCalendarOpen({
                ...calendarOpen,
                [litter.id]: open
              })} 
            />
          ))}
        </div>
      ) : (
        <EmptyPlannedLitters onAddClick={() => setOpenDialog(true)} />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, litter: null })}>
        {editDialog.litter && (
          <EditPlannedLitterDialog 
            litter={editDialog.litter}
            males={males} 
            females={females} 
            onSubmit={(litterId, values) => {
              onEditPlannedLitter(litterId, values);
              setEditDialog({ open: false, litter: null });
            }} 
          />
        )}
      </Dialog>
    </div>;
};
export default PlannedLittersList;