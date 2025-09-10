import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const About: React.FC = () => {
  const { t } = useTranslation('about');

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 to-warmgreen-50">
      {/* Header with language switcher */}
      <header className="flex justify-between items-center p-4 border-b border-warmbeige-200 bg-white/80 backdrop-blur-sm">
        <Link to="/login" className="flex items-center gap-2 text-warmgreen-700 hover:text-warmgreen-800">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{t('backToLogin')}</span>
        </Link>
        <LanguageSwitcher />
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

        {/* What is Section */}
        <Card className="mb-12 border-warmbeige-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-warmgreen-800 flex items-center gap-2">
              <Heart className="h-6 w-6 text-warmgreen-600" />
              {t('sections.whatIs.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warmgreen-700 leading-relaxed text-lg">
              {t('sections.whatIs.description')}
            </p>
          </CardContent>
        </Card>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-warmgreen-800 text-center mb-8 font-playfair">
            {t('sections.services.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-warmbeige-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-warmgreen-800 mb-3">
                  {t('sections.services.breeding.title')}
                </h3>
                <p className="text-warmgreen-700">
                  {t('sections.services.breeding.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmbeige-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-warmgreen-800 mb-3">
                  {t('sections.services.pregnancy.title')}
                </h3>
                <p className="text-warmgreen-700">
                  {t('sections.services.pregnancy.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmbeige-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-warmgreen-800 mb-3">
                  {t('sections.services.litters.title')}
                </h3>
                <p className="text-warmgreen-700">
                  {t('sections.services.litters.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmbeige-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-warmgreen-800 mb-3">
                  {t('sections.services.health.title')}
                </h3>
                <p className="text-warmgreen-700">
                  {t('sections.services.health.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-warmgreen-800 text-center mb-8 font-playfair">
            {t('sections.whyChoose.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-warmbeige-200 shadow-md text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-warmgreen-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-warmgreen-800 mb-2">
                  {t('sections.whyChoose.comprehensive.title')}
                </h3>
                <p className="text-warmgreen-700 text-sm">
                  {t('sections.whyChoose.comprehensive.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmbeige-200 shadow-md text-center">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-warmgreen-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-warmgreen-800 mb-2">
                  {t('sections.whyChoose.easyToUse.title')}
                </h3>
                <p className="text-warmgreen-700 text-sm">
                  {t('sections.whyChoose.easyToUse.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmbeige-200 shadow-md text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-warmgreen-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-warmgreen-800 mb-2">
                  {t('sections.whyChoose.secure.title')}
                </h3>
                <p className="text-warmgreen-700 text-sm">
                  {t('sections.whyChoose.secure.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-warmbeige-200 shadow-md text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-warmgreen-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-warmgreen-800 mb-2">
                  {t('sections.whyChoose.support.title')}
                </h3>
                <p className="text-warmgreen-700 text-sm">
                  {t('sections.whyChoose.support.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button asChild className="bg-warmgreen-600 hover:bg-warmgreen-700 text-white px-8 py-3 text-lg">
            <Link to="/login">
              {t('getStarted')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;