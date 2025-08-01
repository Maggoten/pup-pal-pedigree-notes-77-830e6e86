
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterCard from '@/components/planned-litters/PlannedLitterCard';
import AddPlannedLitterDialog from '@/components/planned-litters/AddPlannedLitterDialog';
import EmptyPlannedLitters from '@/components/planned-litters/EmptyPlannedLitters';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { Dog } from '@/context/DogsContext';
import { useTranslation } from 'react-i18next';

interface PlannedLittersListProps {
  plannedLitters: PlannedLitter[];
  males: Dog[];
  females: Dog[];
  onAddPlannedLitter: (values: PlannedLitterFormValues) => void;
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
  onAddMatingDate,
  onEditMatingDate,
  onDeleteMatingDate,
  onDeleteLitter
}) => {
  const { t } = useTranslation('plannedLitters');
  const [openDialog, setOpenDialog] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState<{ [litterId: string]: boolean }>({});

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 whitespace-nowrap">
              <PlusCircle className="h-4 w-4" />
              {t('actions.addPlannedLitter')}
            </Button>
          </DialogTrigger>
          <AddPlannedLitterDialog 
            males={males} 
            females={females} 
            onSubmit={(values) => {
              onAddPlannedLitter(values);
              setOpenDialog(false);
            }} 
          />
        </Dialog>
      </div>

      {plannedLitters.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plannedLitters.map(litter => (
            <PlannedLitterCard 
              key={litter.id}
              litter={litter}
              onAddMatingDate={onAddMatingDate}
              onEditMatingDate={onEditMatingDate}
              onDeleteMatingDate={onDeleteMatingDate}
              onDeleteLitter={onDeleteLitter}
              calendarOpen={calendarOpen[litter.id] || false}
              onCalendarOpenChange={(open) => setCalendarOpen({...calendarOpen, [litter.id]: open})}
            />
          ))}
        </div>
      ) : (
        <EmptyPlannedLitters onAddClick={() => setOpenDialog(true)} />
      )}
    </div>
  );
};

export default PlannedLittersList;
