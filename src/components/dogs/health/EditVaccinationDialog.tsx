import React, { useState } from 'react';
import { Dog } from '@/types/dogs';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useUpdateDog } from '@/hooks/dogs/mutations/useUpdateDog';

interface EditVaccinationDialogProps {
  dog: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onSuccess?: () => void;
}

const EditVaccinationDialog: React.FC<EditVaccinationDialogProps> = ({
  dog,
  open,
  onOpenChange,
  userId,
  onSuccess,
}) => {
  const { t } = useTranslation('dogs');
  const updateDog = useUpdateDog(userId);

  const [vaccinationDate, setVaccinationDate] = useState<Date | undefined>(
    dog.vaccinationDate ? new Date(dog.vaccinationDate) : undefined
  );
  const [rabiesDate, setRabiesDate] = useState<Date | undefined>(
    dog.rabiesDate || dog.rabies_date ? new Date(dog.rabiesDate || dog.rabies_date!) : undefined
  );
  const [dewormingDate, setDewormingDate] = useState<Date | undefined>(
    dog.dewormingDate ? new Date(dog.dewormingDate) : undefined
  );
  const [sterilizationDate, setSterilizationDate] = useState<Date | undefined>(
    dog.sterilizationDate || dog.sterilization_date 
      ? new Date(dog.sterilizationDate || dog.sterilization_date!) 
      : undefined
  );

  const handleSave = async () => {
    await updateDog.mutateAsync({
      id: dog.id,
      updates: {
        vaccinationDate: vaccinationDate ? format(vaccinationDate, 'yyyy-MM-dd') : null,
        rabiesDate: rabiesDate ? format(rabiesDate, 'yyyy-MM-dd') : null,
        dewormingDate: dewormingDate ? format(dewormingDate, 'yyyy-MM-dd') : null,
        sterilizationDate: sterilizationDate ? format(sterilizationDate, 'yyyy-MM-dd') : null,
      },
    });
    onOpenChange(false);
    onSuccess?.();
  };

  const DatePickerField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'yyyy-MM-dd') : t('health.vaccinations.notRecorded', 'Not recorded')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('health.vaccinations.editTitle', 'Edit Health Dates')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DatePickerField
            label={t('health.vaccinations.vaccination', 'Vaccination')}
            value={vaccinationDate}
            onChange={setVaccinationDate}
          />
          <DatePickerField
            label={t('health.vaccinations.rabies', 'Rabies')}
            value={rabiesDate}
            onChange={setRabiesDate}
          />
          <DatePickerField
            label={t('health.vaccinations.deworming', 'Deworming')}
            value={dewormingDate}
            onChange={setDewormingDate}
          />
          {dog.gender === 'female' && (
            <DatePickerField
              label={t('health.vaccinations.sterilization', 'Sterilization')}
              value={sterilizationDate}
              onChange={setSterilizationDate}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={updateDog.isPending}>
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVaccinationDialog;
