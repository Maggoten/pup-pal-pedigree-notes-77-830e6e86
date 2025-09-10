import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, CheckCircle, PawPrint, Users, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightweightLanguageSwitcher from '@/components/LightweightLanguageSwitcher';

const About: React.FC = () => {
  const { t } = useTranslation('about');
  
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 to-warmgreen-50">
      {/* Header with language switcher */}
      <header className="flex justify-between items-center p-4 border-b border-warmbeige-200 bg-white/80 backdrop-blur-sm">
        <button 
          onClick={navigateToLogin}
          className="flex items-center gap-2 text-warmgreen-700 hover:text-warmgreen-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{t('backToLogin')}</span>
        </button>
        <LightweightLanguageSwitcher />
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-warmgreen-800 mb-4 font-playfair">
            {t('title')}
          </h1>
          <p className="text-xl text-warmgreen-600 mb-8">
            {t('subtitle')}
          </p>
        </div>

        {/* Our Story Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <Heart className="h-6 w-6 text-warmgreen-600" />
              {t('sections.ourStory.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warmgreen-700 leading-relaxed text-lg">
              {t('sections.ourStory.description')}
            </p>
          </CardContent>
        </Card>

        {/* What You Can Do Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-warmgreen-600" />
              {t('sections.whatYouCanDo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(t('sections.whatYouCanDo.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-warmgreen-700 text-lg leading-relaxed">
                  <Heart className="h-5 w-5 text-warmgreen-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* How It Helps Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-warmgreen-600" />
              {t('sections.howItHelps.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(t('sections.howItHelps.benefits', { returnObjects: true }) as string[]).map((benefit: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-warmgreen-700 text-lg leading-relaxed">
                  <PawPrint className="h-5 w-5 text-warmgreen-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Who It's For Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <Users className="h-6 w-6 text-warmgreen-600" />
              {t('sections.whoItsFor.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warmgreen-700 leading-relaxed text-lg">
              {t('sections.whoItsFor.description')}
            </p>
          </CardContent>
        </Card>

        {/* Data & Security Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <Shield className="h-6 w-6 text-warmgreen-600" />
              {t('sections.dataSecurity.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warmgreen-700 leading-relaxed text-lg">
              {t('sections.dataSecurity.description')}
            </p>
          </CardContent>
        </Card>

        {/* Looking Ahead Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <Rocket className="h-6 w-6 text-warmgreen-600" />
              {t('sections.lookingAhead.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warmgreen-700 leading-relaxed text-lg">
              {t('sections.lookingAhead.description')}
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            onClick={navigateToLogin}
            className="bg-warmgreen-600 hover:bg-warmgreen-700 text-white px-8 py-3 text-lg"
          >
            {t('getStarted')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;