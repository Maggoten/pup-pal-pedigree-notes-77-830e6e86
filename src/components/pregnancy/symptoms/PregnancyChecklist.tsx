
import React from 'react';
import { usePregnancyChecklist } from '@/hooks/usePregnancyChecklist';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ChecklistProgress from '@/components/checklist/ChecklistProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

interface PregnancyChecklistProps {
  pregnancyId: string;
  femaleName: string;
}

const PregnancyChecklist: React.FC<PregnancyChecklistProps> = ({ 
  pregnancyId,
  femaleName
}) => {
  const { checklist, toggleItemCompletion } = usePregnancyChecklist(pregnancyId);

  if (!checklist) {
    return <div>Loading checklist...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
          <CardTitle>Pregnancy Symptoms Tracker</CardTitle>
        </div>
        <CardDescription>
          Check off symptoms as you observe them in {femaleName}'s pregnancy
        </CardDescription>
        
        <ChecklistProgress 
          progress={checklist.progress}
          title="Symptoms Observed"
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="pt-2">
        {checklist.groups.map(group => (
          <ChecklistGroup 
            key={group.id}
            group={group}
            onToggleItem={toggleItemCompletion}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default PregnancyChecklist;
