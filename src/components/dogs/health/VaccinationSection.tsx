import React, { useState } from 'react';
import { Dog } from '@/types/dogs';
import { useTranslation } from 'react-i18next';
import { format, addYears, addMonths, differenceInDays, parseISO } from 'date-fns';
import { Syringe, Bug, Shield, Calendar, AlertCircle, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EditVaccinationDialog from './EditVaccinationDialog';

interface VaccinationSectionProps {
  dog: Dog;
  userId: string | undefined;
  onUpdate?: () => void;
}

const VaccinationSection: React.FC<VaccinationSectionProps> = ({ dog, userId, onUpdate }) => {
  const { t } = useTranslation('dogs');
  const [editOpen, setEditOpen] = useState(false);

  const calculateNextDue = (date: string | undefined, intervalYears: number = 1) => {
    if (!date) return null;
    const lastDate = parseISO(date);
    return addYears(lastDate, intervalYears);
  };

  const calculateNextDeworming = (date: string | undefined) => {
    if (!date) return null;
    const lastDate = parseISO(date);
    return addMonths(lastDate, 3);
  };

  const getDaysUntil = (nextDate: Date | null) => {
    if (!nextDate) return null;
    return differenceInDays(nextDate, new Date());
  };

  const getStatusBadge = (daysUntil: number | null) => {
    if (daysUntil === null) return null;
    
    if (daysUntil < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('health.vaccinations.overdue', 'Overdue')}
        </Badge>
      );
    }
    if (daysUntil <= 14) {
      return (
        <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600">
          {t('health.vaccinations.dueSoon', 'Due soon')}
        </Badge>
      );
    }
    return null;
  };

  const vaccinations = [
    {
      icon: Syringe,
      label: t('health.vaccinations.vaccination', 'Vaccination'),
      date: dog.vaccinationDate,
      nextDue: calculateNextDue(dog.vaccinationDate, 1),
      daysUntil: getDaysUntil(calculateNextDue(dog.vaccinationDate, 1))
    },
    {
      icon: Shield,
      label: t('health.vaccinations.rabies', 'Rabies'),
      date: dog.rabiesDate || dog.rabies_date,
      nextDue: calculateNextDue(dog.rabiesDate || dog.rabies_date, 3),
      daysUntil: getDaysUntil(calculateNextDue(dog.rabiesDate || dog.rabies_date, 3))
    },
    {
      icon: Bug,
      label: t('health.vaccinations.deworming', 'Deworming'),
      date: dog.dewormingDate,
      nextDue: calculateNextDeworming(dog.dewormingDate),
      daysUntil: getDaysUntil(calculateNextDeworming(dog.dewormingDate))
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {t('health.vaccinations.title', 'Vaccinations & Deworming')}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-1" />
          {t('common.edit', 'Edit')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vaccinations.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index}
              className={cn(
                "p-4 rounded-lg border bg-card",
                item.daysUntil !== null && item.daysUntil < 0 && "border-destructive/50 bg-destructive/5",
                item.daysUntil !== null && item.daysUntil >= 0 && item.daysUntil <= 14 && "border-amber-500/50 bg-amber-500/5"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              
              {item.date ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('health.vaccinations.lastDate', 'Last')}: {format(parseISO(item.date), 'yyyy-MM-dd')}
                  </p>
                  {item.nextDue && (
                    <p className="text-sm">
                      {t('health.vaccinations.nextDue', 'Next')}: {format(item.nextDue, 'yyyy-MM-dd')}
                    </p>
                  )}
                  {getStatusBadge(item.daysUntil)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t('health.vaccinations.notRecorded', 'Not recorded')}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Sterilization for females */}
      {dog.gender === 'female' && (
        <div className="pt-2">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{t('health.vaccinations.sterilization', 'Sterilization')}</span>
            </div>
            {dog.sterilizationDate || dog.sterilization_date ? (
              <p className="text-sm">
                {format(parseISO(dog.sterilizationDate || dog.sterilization_date!), 'yyyy-MM-dd')}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t('health.vaccinations.notSterilized', 'Not sterilized')}
              </p>
            )}
          </div>
        </div>
      )}

      <EditVaccinationDialog
        dog={dog}
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={userId}
        onSuccess={onUpdate}
      />
    </div>
  );
};

export default VaccinationSection;
