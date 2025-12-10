
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, HelpCircle, Facebook, Instagram } from 'lucide-react';
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
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('help.about.copyright')}
            </p>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('help.about.followUs')}</p>
              <div className="flex justify-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61577076560899"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
                <a
                  href="https://www.instagram.com/breedingjourney"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSettings;
