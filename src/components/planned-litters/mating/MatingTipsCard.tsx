
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const MatingTips = [
  {
    title: "Health requirements & breed-specific testing",
    content: "Before mating, make sure both dogs fulfill the health requirements for your breed.",
    details: {
      type: "checklist",
      items: [
        "Check what health tests are required or recommended by your national kennel club or breed club (e.g. hip x-ray, eye exams, DNA tests)",
        "Ensure the dogs are healthy, of appropriate age, and in good condition",
        "Vaccinations should be up to date",
        "Avoid mating dogs with known heritable health problems"
      ]
    }
  },
  {
    title: "Review pedigrees & plan the match",
    content: "Choose a combination that supports your breed's goals and long-term health.",
    details: {
      type: "considerations",
      label: "Consider:",
      items: [
        "Inbreeding coefficient (COI)",
        "Temperament, type and structure",
        "Known health history"
      ],
      tip: "Consult your breed club or a mentor if you're unsure."
    }
  },
  {
    title: "Wait for standing heat",
    content: "The female is ready to mate when she enters standing heat. Look for:",
    details: {
      type: "list",
      items: [
        "A soft, swollen vulva",
        "Lighter-colored discharge (straw or pale pink)",
        "She stands still and moves her tail to the side when approached by the male"
      ],
      tip: "This often occurs around day 10–14 of the heat cycle – but it varies!"
    }
  },
  {
    title: "Use progesterone testing",
    content: "A progesterone test at the vet can help pinpoint ovulation and find the best day to mate.",
    details: {
      type: "useful_for",
      label: "Especially useful for:",
      items: [
        "Timing natural matings more precisely",
        "Planning travel or artificial insemination",
        "Bitches with irregular heat cycles"
      ]
    }
  },
  {
    title: "Consider two matings",
    content: "Two matings 24–48 hours apart often increase the chance of pregnancy.",
    details: {
      type: "list",
      items: [
        "Sperm can live for several days",
        "Helps ensure that mating overlaps with ovulation"
      ]
    }
  },
  {
    title: "Keep the environment calm",
    content: "Stress can disrupt the mating process.",
    details: {
      type: "tips",
      label: "Tips:",
      items: [
        "Use a calm, familiar setting",
        "Let the dogs meet beforehand if possible",
        "Keep people and distractions to a minimum"
      ]
    }
  }
];

const BonusTips = [
  "Track heat cycles regularly (use a journal or app)",
  "Book your vet in advance if using testing or insemination",
  "Prepare stud dog's documents in advance (pedigree, health records)",
  "Read the relevant breeding rules from your kennel club"
];

const renderDetails = (details: any) => {
  if (!details) return null;

  return (
    <div className="space-y-3">
      {details.label && (
        <div className="font-medium text-foreground">{details.label}</div>
      )}
      
      {details.type === "checklist" && (
        <div className="space-y-2">
          <div className="font-medium text-foreground">Checklist:</div>
          <ul className="space-y-1">
            {details.items.map((item: string, idx: number) => (
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
          {details.items.map((item: string, idx: number) => (
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

const MatingTipsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mating Tips for Breeders</CardTitle>
        <CardDescription>From preparation to the perfect timing – a step-by-step guide for successful breeding</CardDescription>
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
                <span>Bonus Tips for a Planned Litter</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-8">
                <ul className="space-y-2">
                  {BonusTips.map((tip, index) => (
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
