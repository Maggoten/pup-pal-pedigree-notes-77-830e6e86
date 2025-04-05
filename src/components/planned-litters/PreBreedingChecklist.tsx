
import React from 'react';
import { usePreBreedingChecklist } from '@/hooks/usePreBreedingChecklist';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ChecklistProgress from '@/components/checklist/ChecklistProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';
import { PlannedLitter } from '@/types/breeding';

interface PreBreedingChecklistProps {
  litter: PlannedLitter;
}

const PreBreedingChecklist: React.FC<PreBreedingChecklistProps> = ({ litter }) => {
  const { checklist, toggleItemCompletion } = usePreBreedingChecklist(litter.id);

  if (!checklist) {
    return <div>Loading checklist...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardCheck className="h-5 w-5 text-purple-500 mr-2" />
            <CardTitle>Breeding Preparation Checklist</CardTitle>
          </div>
        </div>
        <CardDescription>
          Complete these tasks before breeding {litter.femaleName} with {litter.maleName}
        </CardDescription>
        
        <ChecklistProgress 
          progress={checklist.progress}
          title="Overall Progress"
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

        {checklist.progress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-center">
            <h3 className="text-green-800 font-semibold text-lg">All preparations complete!</h3>
            <p className="text-green-700 mt-1">You're ready to proceed with the breeding.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreBreedingChecklist;
