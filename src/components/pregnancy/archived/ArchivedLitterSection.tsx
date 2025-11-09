import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PawPrint, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { LinkedLitter } from '@/services/PregnancyArchivedService';

interface ArchivedLitterSectionProps {
  linkedLitter: LinkedLitter | null;
}

const ArchivedLitterSection: React.FC<ArchivedLitterSectionProps> = ({ linkedLitter }) => {
  const { t, i18n } = useTranslation('pregnancy');
  const navigate = useNavigate();
  const locale = i18n.language === 'sv' ? sv : undefined;

  if (!linkedLitter) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-amber-600" />
            {t('archived.litter.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t('archived.litter.notLinked')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-amber-600" />
          {t('archived.litter.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{linkedLitter.name}</h3>
              <p className="text-sm text-muted-foreground">
                {linkedLitter.damName} × {linkedLitter.sireName}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(linkedLitter.dateOfBirth, 'PPP', { locale })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/my-litters?selected=${linkedLitter.id}`)}
              className="flex items-center gap-2"
            >
              {t('archived.litter.viewLitter')}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Puppy Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-greige-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{linkedLitter.totalPuppies}</p>
              <p className="text-xs text-muted-foreground">{t('archived.litter.total')}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{linkedLitter.alivePuppies}</p>
              <p className="text-xs text-muted-foreground">{t('archived.litter.alive')}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-700">{linkedLitter.deadPuppies}</p>
              <p className="text-xs text-muted-foreground">{t('archived.litter.dead')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedLitterSection;