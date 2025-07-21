
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Litter } from '@/types/breeding';
import { useTranslation } from 'react-i18next';

interface DogLitterItemProps {
  litter: Litter;
  onViewDetails: (litter: Litter) => void;
}

const DogLitterItem: React.FC<DogLitterItemProps> = ({ litter, onViewDetails }) => {
  const { t } = useTranslation('dogs');
  const formattedDate = format(new Date(litter.dateOfBirth), 'yyyy-MM-dd');
  const litterLabel = `${litter.damName} × ${litter.sireName}`;

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-sm sm:text-base">
              {litterLabel}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('litters.item.born', { date: formattedDate })}
            </p>
            {litter.archived && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {t('litters.item.archived')}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(litter)}
            className="ml-4"
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('litters.item.viewDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DogLitterItem;
