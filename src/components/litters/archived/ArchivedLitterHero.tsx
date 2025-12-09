import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Heart, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Litter } from '@/types/breeding';

interface ArchivedLitterHeroProps {
  litter: Litter;
  damImageUrl?: string;
  sireImageUrl?: string;
  damBreed?: string;
  damRegistration?: string;
  sireBreed?: string;
  sireRegistration?: string;
}

const ArchivedLitterHero: React.FC<ArchivedLitterHeroProps> = ({ 
  litter, 
  damImageUrl, 
  sireImageUrl,
  damBreed,
  damRegistration,
  sireBreed,
  sireRegistration
}) => {
  const { t, i18n } = useTranslation('litters');
  const locale = i18n.language === 'sv' ? sv : undefined;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-primary" />
            {litter.name}
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {t('archivedLitters.hero.archived')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parents Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dam */}
          <div className="bg-white/70 dark:bg-background/70 p-4 rounded-lg border-l-4 border-pink-400">
            <p className="text-xs font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-3">
              {t('archivedLitters.hero.dam')}
            </p>
            <div className="flex items-start gap-3">
              <Avatar className="h-16 w-16 border-2 border-pink-200">
                <AvatarImage src={damImageUrl} alt={litter.damName} />
                <AvatarFallback className="bg-pink-100 text-pink-700">
                  {litter.damName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{litter.damName}</p>
                {damBreed && (
                  <p className="text-sm text-muted-foreground truncate">{damBreed}</p>
                )}
                {damRegistration && (
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{damRegistration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sire */}
          <div className="bg-white/70 dark:bg-background/70 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
              {t('archivedLitters.hero.sire')}
            </p>
            <div className="flex items-start gap-3">
              <Avatar className="h-16 w-16 border-2 border-blue-200">
                <AvatarImage src={sireImageUrl} alt={litter.sireName} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {litter.sireName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{litter.sireName}</p>
                {sireBreed && (
                  <p className="text-sm text-muted-foreground truncate">{sireBreed}</p>
                )}
                {sireRegistration && (
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{sireRegistration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date Information */}
        <div className="flex items-center gap-3 bg-background/70 p-3 rounded-lg">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{t('archivedLitters.hero.bornOn')}</p>
            <p className="font-medium">
              {format(new Date(litter.dateOfBirth), 'PPP', { locale })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedLitterHero;
