import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LightweightLanguageSwitcher from '@/components/LightweightLanguageSwitcher';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const { t } = useTranslation('faq');
  
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const [heroRef, heroVisible] = useIntersectionObserver({ triggerOnce: true });

  const faqItems = t('questions', { returnObjects: true }) as FAQItem[];

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
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-playfair leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <AnimatedCard className="mb-8 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors py-4">
                    <span className="text-lg font-medium">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </AnimatedCard>

        {/* Contact CTA */}
        <AnimatedCard className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 shadow-lg">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold text-primary mb-2">{t('moreQuestions.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('moreQuestions.description')}</p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 underline transition-colors"
            >
              {t('moreQuestions.contactLink')}
            </a>
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

export default FAQ;
