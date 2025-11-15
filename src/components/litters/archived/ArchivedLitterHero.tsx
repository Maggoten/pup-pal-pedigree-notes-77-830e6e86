import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Litter } from '@/types/breeding';

interface ArchivedLitterHeroProps {
  litter: Litter;
  damImageUrl?: string;
  sireImageUrl?: string;
}

const ArchivedLitterHero: React.FC<ArchivedLitterHeroProps> = ({ 
  litter, 
  damImageUrl, 
  sireImageUrl 
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
          <div className="flex items-center gap-3 bg-background/70 p-4 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={damImageUrl} alt={litter.damName} />
              <AvatarFallback>{litter.damName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{t('display.dam')}</p>
              <p className="font-semibold text-lg">{litter.damName}</p>
            </div>
          </div>

          {/* Sire */}
          <div className="flex items-center gap-3 bg-background/70 p-4 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={sireImageUrl} alt={litter.sireName} />
              <AvatarFallback>{litter.sireName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{t('display.sire')}</p>
              <p className="font-semibold text-lg">{litter.sireName}</p>
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
