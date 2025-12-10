import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, CreditCard, AlertTriangle, Scale, XCircle, RefreshCw, User, Stethoscope, FileUp, Server, Shield, Gavel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightweightLanguageSwitcher from '@/components/LightweightLanguageSwitcher';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const Terms: React.FC = () => {
  const { t } = useTranslation('terms');
  
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const [heroRef, heroVisible] = useIntersectionObserver({ triggerOnce: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-warmbeige-50 to-warmgreen-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-warmgreen-100/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-xl" />
      </div>

      {/* Header with language switcher */}
      <header className="relative flex justify-between items-center p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <button 
          onClick={navigateToLogin}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{t('backToLogin')}</span>
        </button>
        <LightweightLanguageSwitcher />
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative">
        {/* Hero Section */}
        <div 
          ref={heroRef}
          className={`text-center mb-16 transition-all duration-700 ${
            heroVisible ? 'animate-fade-in' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-playfair leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Acceptance Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              {t('sections.acceptance.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.acceptance.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Age Requirement Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              {t('sections.ageRequirement.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.ageRequirement.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Subscription Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              {t('sections.subscription.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-4">
              {t('sections.subscription.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.subscription.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-accent mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* User Responsibilities Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-l from-primary/5 to-primary/10 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              {t('sections.userResponsibilities.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-4">
              {t('sections.userResponsibilities.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.userResponsibilities.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* No Veterinary Advice Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <Stethoscope className="h-6 w-6 text-secondary-foreground" />
              </div>
              {t('sections.noVeterinaryAdvice.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              {t('sections.noVeterinaryAdvice.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* User Content Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              {t('sections.userContent.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-4">
              {t('sections.userContent.description')}
            </p>
            <ul className="space-y-2">
              {(t('sections.userContent.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </AnimatedCard>

        {/* Limitation of Liability Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-secondary-foreground" />
              </div>
              {t('sections.liability.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              {t('sections.liability.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Service Availability Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Server className="h-6 w-6 text-accent" />
              </div>
              {t('sections.serviceAvailability.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.serviceAvailability.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Termination Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <XCircle className="h-6 w-6 text-primary" />
              </div>
              {t('sections.termination.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.termination.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Privacy Reference Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              {t('sections.privacyReference.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.privacyReference.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Changes Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <RefreshCw className="h-6 w-6 text-accent" />
              </div>
              {t('sections.changes.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.changes.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Governing Law Section */}
        <AnimatedCard className="mb-8 bg-gradient-to-l from-primary/5 to-primary/10 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Gavel className="h-6 w-6 text-primary" />
              </div>
              {t('sections.governingLaw.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.governingLaw.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Last Updated */}
        <div className="text-center text-muted-foreground text-sm">
          {t('lastUpdated')}
        </div>
      </div>
    </div>
  );
};

// Animated Card Component
const AnimatedCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
}> = ({ children, className }) => {
  const [ref, isVisible] = useIntersectionObserver({ triggerOnce: true, threshold: 0.1 });

  return (
    <Card 
      ref={ref}
      className={`transition-all duration-700 transform ${
        isVisible ? 'animate-fade-in' : 'opacity-0 translate-y-8'
      } hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {children}
    </Card>
  );
};

export default Terms;
