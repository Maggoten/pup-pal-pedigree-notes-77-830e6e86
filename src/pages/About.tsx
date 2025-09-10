import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

const About: React.FC = () => {
  const { t } = useTranslation('about');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t('mission.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('mission.text')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('features.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline" className="block text-left">
                  {t('features.dogTracking')}
                </Badge>
                <Badge variant="outline" className="block text-left">
                  {t('features.litterPlanning')}
                </Badge>
                <Badge variant="outline" className="block text-left">
                  {t('features.pregnancyMonitoring')}
                </Badge>
                <Badge variant="outline" className="block text-left">
                  {t('features.recordKeeping')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('contact.email')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;