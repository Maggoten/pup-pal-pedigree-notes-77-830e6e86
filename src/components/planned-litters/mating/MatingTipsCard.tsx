
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const MatingTips = [
  "Wait until the bitch is in standing heat before mating",
  "The optimal time for mating is usually 10-14 days after the start of heat",
  "Consider progesterone testing to determine the optimal mating time",
  "Two matings 24-48 hours apart can increase the chances of pregnancy",
  "Keep both dogs calm and relaxed before and after mating"
];

const MatingTipsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mating Tips & Tricks</CardTitle>
        <CardDescription>Important information for successful breeding</CardDescription>
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
                  <span>{tip}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 text-muted-foreground">
                  {index === 0 && "Standing heat is when the female is most receptive to the male and most likely to conceive. Look for a soft vulva and straw-colored discharge."}
                  {index === 1 && "This is typically when ovulation occurs. Consider tracking the cycle carefully with your vet to determine the optimal time."}
                  {index === 2 && "Progesterone testing can precisely pinpoint when ovulation occurs, giving you the best chance of a successful pregnancy."}
                  {index === 3 && "Multiple matings increase the chances of pregnancy, as sperm can live for several days in the female reproductive tract."}
                  {index === 4 && "Stress can interfere with successful breeding. Ensure the environment is quiet and familiar to both dogs."}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MatingTipsCard;
