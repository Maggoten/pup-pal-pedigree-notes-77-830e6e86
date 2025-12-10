import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightweightLanguageSwitcher from '@/components/LightweightLanguageSwitcher';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const Contact: React.FC = () => {
  const { t } = useTranslation('contact');
  
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
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-playfair leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email Card */}
          <AnimatedCard className="bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                {t('email.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{t('email.description')}</p>
              <a 
                href="mailto:support@breedingjourney.com" 
                className="text-accent hover:text-accent/80 underline transition-colors font-medium"
              >
                support@breedingjourney.com
              </a>
            </CardContent>
          </AnimatedCard>

          {/* Response Time Card */}
          <AnimatedCard className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-accent flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-full">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                {t('responseTime.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('responseTime.description')}</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Additional Info */}
        <AnimatedCard className="bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-secondary-foreground flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <MapPin className="h-5 w-5 text-secondary-foreground" />
              </div>
              {t('company.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground leading-relaxed">
              {t('company.description')}
            </p>
            <div className="mt-4 space-y-1 text-secondary-foreground/80">
              <p>{t('company.name')}</p>
              <p>{t('company.location')}</p>
            </div>
          </CardContent>
        </AnimatedCard>
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

export default Contact;
