import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const About: React.FC = () => {
  const { t, i18n } = useTranslation('about');

  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <Helmet>
        <title>{t('seo.title')}</title>
        <meta name="description" content={t('seo.description')} />
      </Helmet>
      
      <div className="min-h-screen bg-warmbeige-50/70 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>

        {/* Back to Login Link */}
        <div className="absolute top-4 left-4 z-10">
          <Link 
            to="/login" 
            className="text-sm text-warmgreen-600 hover:text-warmgreen-700 underline flex items-center gap-1"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-warmgreen-600" />
            </div>
            <h1 className="text-4xl font-bold text-warmgreen-800 font-playfair mb-2">
              {t('title')}
            </h1>
            <p className="text-lg text-warmgreen-700 italic">
              {t('tagline')}
            </p>
          </div>

          {/* Short Section */}
          <Card className="mb-8 border-warmbeige-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-warmgreen-800 font-playfair">
                {t('short.heading')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-warmgreen-700 leading-relaxed">
                {t('short.p1')}
              </p>
              <p className="text-warmgreen-700 leading-relaxed">
                {t('short.p2')}
              </p>
              <p className="text-warmgreen-700 leading-relaxed">
                {t('short.p3')}
              </p>
            </CardContent>
          </Card>

          {/* Extended Section - Collapsible */}
          <Card className="border-warmbeige-200 shadow-lg">
            <details className="group">
              <summary className="cursor-pointer">
                <CardHeader className="hover:bg-warmbeige-50/50 transition-colors">
                  <CardTitle className="text-xl font-bold text-warmgreen-800 font-playfair flex items-center justify-between">
                    {t('extended.heading')}
                    <ChevronDown className="h-5 w-5 text-warmgreen-600 transition-transform group-open:rotate-180" />
                  </CardTitle>
                </CardHeader>
              </summary>
              
              <CardContent className="space-y-8 pt-0">
                {/* Our Story */}
                <div>
                  <h3 className="text-lg font-semibold text-warmgreen-800 mb-3 font-playfair">
                    {t('extended.story.h')}
                  </h3>
                  <p className="text-warmgreen-700 leading-relaxed">
                    {t('extended.story.p1')}
                  </p>
                </div>

                {/* Our Mission */}
                <div>
                  <h3 className="text-lg font-semibold text-warmgreen-800 mb-3 font-playfair">
                    {t('extended.mission.h')}
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.mission.li1')}
                    </li>
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.mission.li2')}
                    </li>
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.mission.li3')}
                    </li>
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.mission.li4')}
                    </li>
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.mission.li5')}
                    </li>
                  </ul>
                </div>

                {/* Our Values */}
                <div>
                  <h3 className="text-lg font-semibold text-warmgreen-800 mb-3 font-playfair">
                    {t('extended.values.h')}
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.values.v1')}
                    </li>
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.values.v2')}
                    </li>
                    <li className="text-warmgreen-700 flex items-start">
                      <span className="text-warmgreen-600 mr-2">•</span>
                      {t('extended.values.v3')}
                    </li>
                  </ul>
                </div>

                {/* Who is it for */}
                <div>
                  <h3 className="text-lg font-semibold text-warmgreen-800 mb-3 font-playfair">
                    {t('extended.for.h')}
                  </h3>
                  <p className="text-warmgreen-700 leading-relaxed">
                    {t('extended.for.p1')}
                  </p>
                </div>

                {/* Looking ahead */}
                <div>
                  <h3 className="text-lg font-semibold text-warmgreen-800 mb-3 font-playfair">
                    {t('extended.future.h')}
                  </h3>
                  <p className="text-warmgreen-700 leading-relaxed">
                    {t('extended.future.p1')}
                  </p>
                </div>
              </CardContent>
            </details>
          </Card>
        </div>
      </div>
    </>
  );
};

export default About;