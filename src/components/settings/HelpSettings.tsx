
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HelpSettings: React.FC = () => {
  const { t } = useTranslation('settings');
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t('help.support.title')}
          </CardTitle>
          <CardDescription>
            {t('help.support.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('help.support.needHelp')}</p>
            <p className="text-sm text-muted-foreground">
              {t('help.support.contactDescription')}
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
              <Mail className="h-4 w-4 text-primary" />
              <a 
                href={`mailto:${t('help.support.email')}`}
                className="text-sm text-primary hover:underline"
              >
                {t('help.support.email')}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('help.about.title')}</CardTitle>
          <CardDescription>
            {t('help.about.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {t('help.about.copyright')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSettings;
