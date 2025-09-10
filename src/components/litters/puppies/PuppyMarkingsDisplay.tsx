import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PuppyMarkingsDisplayProps {
  markings?: string;
  color: string;
}

const PuppyMarkingsDisplay: React.FC<PuppyMarkingsDisplayProps> = ({ markings, color }) => {
  const { t } = useTranslation('litters');

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          {t('puppies.titles.markings')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Dog Silhouette */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              {/* Simple dog silhouette SVG */}
              <svg
                viewBox="0 0 200 200"
                className="w-40 h-40 fill-current text-muted-foreground/50"
              >
                {/* Dog head */}
                <ellipse cx="100" cy="70" rx="35" ry="30" />
                {/* Dog ears */}
                <ellipse cx="75" cy="55" rx="12" ry="20" />
                <ellipse cx="125" cy="55" rx="12" ry="20" />
                {/* Dog body */}
                <ellipse cx="100" cy="130" rx="40" ry="35" />
                {/* Dog legs */}
                <rect x="75" y="155" width="8" height="25" rx="4" />
                <rect x="90" y="155" width="8" height="25" rx="4" />
                <rect x="105" y="155" width="8" height="25" rx="4" />
                <rect x="120" y="155" width="8" height="25" rx="4" />
                {/* Dog tail */}
                <ellipse cx="140" cy="125" rx="8" ry="15" transform="rotate(30 140 125)" />
              </svg>
            </div>
          </div>

          {/* Markings Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('puppies.labels.baseColor')}:</span>
              <Badge variant="secondary" className="bg-warmbeige-100 text-warmbeige-800">
                {color}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">{t('puppies.labels.markings')}:</span>
              {markings ? (
                <div className="p-3 bg-muted/30 rounded-md border">
                  <p className="text-sm whitespace-pre-wrap">{markings}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t('puppies.labels.noMarkingsRecorded')}
                </p>
              )}
            </div>
          </div>

          {/* Color Guide */}
          <div className="mt-4 p-3 bg-primary/5 rounded-md">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              {t('puppies.labels.markingsGuide')}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t('puppies.descriptions.markingsDescription')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyMarkingsDisplay;