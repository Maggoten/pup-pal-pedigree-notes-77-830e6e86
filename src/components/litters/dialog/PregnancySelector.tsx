import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getArchivedPregnanciesForDog } from '@/services/PregnancyService';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface PregnancySelectorProps {
  femaleId: string;
  selectedPregnancyId?: string | null;
  onPregnancyChange: (pregnancyId: string | null) => void;
}

export const PregnancySelector: React.FC<PregnancySelectorProps> = ({
  femaleId,
  selectedPregnancyId,
  onPregnancyChange,
}) => {
  const { t } = useTranslation('litters');
  const [pregnancies, setPregnancies] = useState<Array<{
    id: string;
    matingDate: Date;
    femaleName: string;
    maleName: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPregnancies = async () => {
      if (!femaleId) {
        setPregnancies([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getArchivedPregnanciesForDog(femaleId);
        setPregnancies(data);
      } catch (error) {
        console.error('Error fetching archived pregnancies:', error);
        setPregnancies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPregnancies();
  }, [femaleId]);

  if (!femaleId) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="pregnancy-selector">
        {t('dialog.form.pregnancy.linkToPregnancy')}
      </Label>
      <p className="text-sm text-muted-foreground">
        {t('dialog.form.pregnancy.linkDescription')}
      </p>
      
      {isLoading ? (
        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading pregnancies...
        </div>
      ) : pregnancies.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {t('dialog.form.pregnancy.noPregnancySelected')}
        </p>
      ) : (
        <Select
          value={selectedPregnancyId || 'none'}
          onValueChange={(value) => onPregnancyChange(value === 'none' ? null : value)}
        >
          <SelectTrigger className="bg-white border-greige-300">
            <SelectValue placeholder={t('dialog.form.placeholders.selectPregnancy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {t('dialog.form.pregnancy.noPregnancySelected')}
            </SelectItem>
            {pregnancies.map((pregnancy) => (
              <SelectItem key={pregnancy.id} value={pregnancy.id}>
                {pregnancy.femaleName} × {pregnancy.maleName} - {format(pregnancy.matingDate, 'PPP')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
