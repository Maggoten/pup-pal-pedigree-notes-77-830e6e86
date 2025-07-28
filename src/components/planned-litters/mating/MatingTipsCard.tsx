
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';


const MatingTipsCard: React.FC = () => {
  const { t } = useTranslation('plannedLitters');

  const renderDetails = (details: any) => {
    if (!details) return null;

    return (
      <div className="space-y-3">
        {details.label && (
          <div className="font-medium text-foreground">{details.label}</div>
        )}
        
        {details.type === "checklist" && (
          <div className="space-y-2">
            <div className="font-medium text-foreground">{t('matingTips.healthRequirements.checklist')}</div>
            <ul className="space-y-1">
              {Array.isArray(details.items) && details.items.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {(details.type === "list" || details.type === "considerations" || details.type === "useful_for" || details.type === "tips") && (
          <ul className="space-y-1">
            {Array.isArray(details.items) && details.items.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        
        {details.tip && (
          <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <span className="text-primary font-medium">💡</span>
            <span className="text-sm">{details.tip}</span>
          </div>
        )}
      </div>
    );
  };

  const MatingTips = [
    {
      title: t('matingTips.healthRequirements.title'),
      content: t('matingTips.healthRequirements.content'),
      details: {
        type: "checklist",
        items: t('matingTips.healthRequirements.items', { returnObjects: true })
      }
    },
    {
      title: t('matingTips.reviewPedigrees.title'),
      content: t('matingTips.reviewPedigrees.content'),
      details: {
        type: "considerations",
        label: t('matingTips.reviewPedigrees.consider'),
        items: t('matingTips.reviewPedigrees.items', { returnObjects: true }),
        tip: t('matingTips.reviewPedigrees.tip')
      }
    },
    {
      title: t('matingTips.waitForHeat.title'),
      content: t('matingTips.waitForHeat.content'),
      details: {
        type: "list",
        items: t('matingTips.waitForHeat.items', { returnObjects: true }),
        tip: t('matingTips.waitForHeat.tip')
      }
    },
    {
      title: t('matingTips.progesteroneTesting.title'),
      content: t('matingTips.progesteroneTesting.content'),
      details: {
        type: "useful_for",
        label: t('matingTips.progesteroneTesting.usefulFor'),
        items: t('matingTips.progesteroneTesting.items', { returnObjects: true })
      }
    },
    {
      title: t('matingTips.twoMatings.title'),
      content: t('matingTips.twoMatings.content'),
      details: {
        type: "list",
        items: t('matingTips.twoMatings.items', { returnObjects: true })
      }
    },
    {
      title: t('matingTips.calmEnvironment.title'),
      content: t('matingTips.calmEnvironment.content'),
      details: {
        type: "tips",
        label: t('matingTips.calmEnvironment.tips'),
        items: t('matingTips.calmEnvironment.items', { returnObjects: true })
      }
    }
  ];

  const BonusTips = t('matingTips.bonusTips.items', { returnObjects: true }) as string[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('matingTips.title')}</CardTitle>
        <CardDescription>{t('matingTips.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {MatingTips.map((tip, index) => (
            <AccordionItem key={index} value={`tip-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <span>{tip.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 space-y-4">
                  <p className="text-foreground">{tip.content}</p>
                  {renderDetails(tip.details)}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          
          {/* Bonus Tips Section */}
          <AccordionItem value="bonus-tips">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  💡
                </div>
                <span>{t('matingTips.bonusTips.title')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-8">
                <ul className="space-y-2">
                  {Array.isArray(BonusTips) && BonusTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MatingTipsCard;
