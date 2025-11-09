import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { SymptomLog, NoteLog } from '@/services/PregnancyArchivedService';

interface ArchivedSymptomsTimelineProps {
  symptoms: SymptomLog[];
  notes: NoteLog[];
}

type TimelineEntry = {
  id: string;
  date: Date;
  type: 'symptom' | 'note';
  title: string;
  description: string;
};

const ArchivedSymptomsTimeline: React.FC<ArchivedSymptomsTimelineProps> = ({ symptoms, notes }) => {
  const { t, i18n } = useTranslation('pregnancy');
  const locale = i18n.language === 'sv' ? sv : undefined;

  // Combine symptoms and notes, sort chronologically (oldest first)
  const timeline = useMemo(() => {
    const combined: TimelineEntry[] = [
      ...symptoms.map(s => ({ ...s, type: 'symptom' as const })),
      ...notes.map(n => ({ ...n, type: 'note' as const }))
    ];
    
    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [symptoms, notes]);

  // Check if entry contains veterinary keywords
  const isVetRelated = (entry: TimelineEntry) => {
    const text = `${entry.title} ${entry.description}`.toLowerCase();
    const keywords = ['ultraljud', 'ultrasound', 'veterinär', 'vet', 'röntgen', 'x-ray', 'kontroll', 'check'];
    return keywords.some(keyword => text.includes(keyword));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          {t('archived.timeline.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="timeline">
          <AccordionItem value="timeline">
            <AccordionTrigger>
              {t('archived.timeline.viewEntries', { count: timeline.length })}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 mt-4">
                {timeline.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex gap-4 relative pb-4 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-greige-200" />
                    )}

                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10
                      ${isVetRelated(entry) ? 'bg-blue-100' : 'bg-greige-100'}
                    `}>
                      {isVetRelated(entry) ? (
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-greige-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-greige-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{entry.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(entry.date, 'PPP', { locale })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ArchivedSymptomsTimeline;