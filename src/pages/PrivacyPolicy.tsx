import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck, Mail, Scale, Globe, Building, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightweightLanguageSwitcher from '@/components/LightweightLanguageSwitcher';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
const PrivacyPolicy: React.FC = () => {
  const {
    t
  } = useTranslation('privacy');
  const navigateToLogin = () => {
    window.location.href = '/login';
  };
  const [heroRef, heroVisible] = useIntersectionObserver({
    triggerOnce: true
  });
  return <div className="min-h-screen bg-gradient-to-br from-background via-warmbeige-50 to-warmgreen-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-warmgreen-100/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-xl" />
      </div>

      {/* Header with language switcher */}
      <header className="relative flex justify-between items-center p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <button onClick={navigateToLogin} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer group">
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{t('backToLogin')}</span>
        </button>
        <LightweightLanguageSwitcher />
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative">
        {/* Hero Section */}
        <div ref={heroRef} className={`text-center mb-16 transition-all duration-700 ${heroVisible ? 'animate-fade-in' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-playfair leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Data Collection Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Database className="h-6 w-6 text-primary" />
              </div>
              {t('sections.dataCollection.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-4">
              {t('sections.dataCollection.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.dataCollection.items', {
              returnObjects: true
            }) as string[]).map((item, index) => <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary mt-1 my-0">•</span>
                  {item}
                </li>)}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* Legal Basis Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Scale className="h-6 w-6 text-accent" />
              </div>
              {t('sections.legalBasis.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-4">
              {t('sections.legalBasis.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.legalBasis.items', {
              returnObjects: true
            }) as string[]).map((item, index) => <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-accent mt-1 my-0">•</span>
                  {item}
                </li>)}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* Data Usage Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              {t('sections.dataUsage.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-4">
              {t('sections.dataUsage.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.dataUsage.items', {
              returnObjects: true
            }) as string[]).map((item, index) => <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-accent mt-1 my-0">•</span>
                  {item}
                </li>)}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* Data Security Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-l from-primary/5 to-primary/10 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              {t('sections.dataSecurity.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.dataSecurity.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* International Data Transfers Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <Globe className="h-6 w-6 text-secondary-foreground" />
              </div>
              {t('sections.dataTransfers.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              {t('sections.dataTransfers.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Data Retention Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              {t('sections.dataRetention.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.dataRetention.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Your Rights Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <UserCheck className="h-6 w-6 text-secondary-foreground" />
              </div>
              {t('sections.yourRights.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground leading-relaxed text-lg mb-4">
              {t('sections.yourRights.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.yourRights.items', {
              returnObjects: true
            }) as string[]).map((item, index) => <li key={index} className="flex items-start gap-2 text-secondary-foreground">
                  <span className="mt-1 my-0">•</span>
                  {item}
                </li>)}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* Cookies Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              {t('sections.cookies.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.cookies.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Contact Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              {t('sections.contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.contact.description')}
            </p>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.contact.subDescription')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Last Updated */}
        <div className="text-center text-muted-foreground text-sm">
          {t('lastUpdated')}
        </div>
      </div>
    </div>;
};

// Animated Card Component
const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({
  children,
  className
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1
  });
  return <Card ref={ref} className={`transition-all duration-700 transform ${isVisible ? 'animate-fade-in' : 'opacity-0 translate-y-8'} hover:shadow-xl hover:-translate-y-1 ${className}`}>
      {children}
    </Card>;
};
export default PrivacyPolicy;