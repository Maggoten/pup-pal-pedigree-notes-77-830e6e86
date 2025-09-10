import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, CheckCircle, PawPrint, Dog, Shield, Rocket, Star, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LightweightLanguageSwitcher from '@/components/LightweightLanguageSwitcher';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const About: React.FC = () => {
  const { t } = useTranslation('about');
  
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const [heroRef, heroVisible] = useIntersectionObserver({ triggerOnce: true });
  const [statsRef, statsVisible] = useIntersectionObserver({ triggerOnce: true });

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
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-playfair leading-tight">
              {t('title')}
            </h1>
            <div className="absolute -top-2 -right-4 text-accent/30">
              <PawPrint className="h-8 w-8 rotate-12" />
            </div>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex justify-center gap-4 hidden">
            <Badge variant="active" className="px-4 py-2 text-sm">
              <Heart className="h-4 w-4 mr-2" />
              Breeder-friendly
            </Badge>
            <Badge variant="success" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2" />
              Secure & Private
            </Badge>
          </div>
        </div>

        {/* Statistics Section - Hidden temporarily for new startup
        <div 
          ref={statsRef}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 transition-all duration-700 delay-200 ${
            statsVisible ? 'animate-scale-in' : 'opacity-0 scale-95'
          }`}
        >
          <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Happy Breeders</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors">
            <div className="text-3xl font-bold text-accent mb-2">2,000+</div>
            <div className="text-sm text-muted-foreground">Dogs Registered</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-secondary/50 border border-secondary hover:bg-secondary/70 transition-colors">
            <div className="text-3xl font-bold text-secondary-foreground mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </div>
        */}

        {/* Our Story Section */}
        <AnimatedCard className="mb-12 bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Heart className="h-6 w-6 text-primary transition-transform hover:scale-110" />
              </div>
              {t('sections.ourStory.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.ourStory.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* What You Can Do Section */}
        <AnimatedCard className="mb-12 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-accent transition-transform hover:scale-110" />
              </div>
              {t('sections.whatYouCanDo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {(t('sections.whatYouCanDo.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-colors group">
                  <div className="p-1.5 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                    <Heart className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground text-lg leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* How It Helps Section - Horizontal Layout */}
        <AnimatedCard className="mb-12 bg-gradient-to-l from-primary/5 to-primary/10 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <PawPrint className="h-6 w-6 text-primary transition-transform hover:scale-110 hover:rotate-12" />
              </div>
              {t('sections.howItHelps.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {(t('sections.howItHelps.benefits', { returnObjects: true }) as string[]).map((benefit: string, index: number) => {
                const [title, ...descriptionParts] = benefit.split(':');
                const description = descriptionParts.join(':').trim();
                
                return (
                  <div key={index} className="p-5 rounded-xl bg-background/50 hover:bg-background/70 transition-all duration-300 hover:scale-105 group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <PawPrint className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-1">{title}</h4>
                        <p className="text-foreground/80 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Who It's For Section */}
        <AnimatedCard className="mb-12 bg-gradient-to-r from-secondary/30 to-secondary/50 border-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground flex items-center gap-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <Dog className="h-6 w-6 text-secondary-foreground transition-transform hover:scale-110" />
              </div>
              {t('sections.whoItsFor.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-secondary-foreground leading-relaxed text-lg">
              {t('sections.whoItsFor.description')}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-secondary-foreground/20 text-secondary-foreground">
                <Users className="h-3 w-3 mr-1" />
                Professional Breeders
              </Badge>
              <Badge variant="outline" className="border-secondary-foreground/20 text-secondary-foreground">
                <Star className="h-3 w-3 mr-1" />
                Hobby Enthusiasts  
              </Badge>
              <Badge variant="outline" className="border-secondary-foreground/20 text-secondary-foreground">
                <Trophy className="h-3 w-3 mr-1" />
                Show Dog Owners
              </Badge>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Data & Security Section */}
        <AnimatedCard className="mb-12 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border-primary/30 shadow-lg ring-1 ring-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-6 w-6 text-primary transition-transform hover:scale-110 hover:rotate-3" />
              </div>
              {t('sections.dataSecurity.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-6">
              {t('sections.dataSecurity.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" className="px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                GDPR Compliant
              </Badge>
              <Badge variant="info" className="px-3 py-1">
                End-to-End Encryption
              </Badge>
              <Badge variant="active" className="px-3 py-1">
                Your Data Stays Yours
              </Badge>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Looking Ahead Section */}
        <AnimatedCard className="mb-12 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Rocket className="h-6 w-6 text-accent transition-transform hover:scale-110 hover:-rotate-12" />
              </div>
              {t('sections.lookingAhead.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {t('sections.lookingAhead.description')}
            </p>
          </CardContent>
        </AnimatedCard>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 shadow-lg">
            <h3 className="text-2xl font-bold text-primary mb-4 font-playfair">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Join thousands of breeders who trust us with their breeding journey.</p>
            <Button 
              onClick={navigateToLogin}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Heart className="h-5 w-5 mr-2" />
              {t('getStarted')}
            </Button>
          </div>
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

export default About;