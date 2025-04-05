
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Litter } from '@/types/breeding';
import { differenceInDays, parseISO } from 'date-fns';
import { CheckCircle, Circle } from 'lucide-react';

interface PuppyDevelopmentChecklistProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  age: number; // in days
  isCompleted: boolean;
}

const PuppyDevelopmentChecklist: React.FC<PuppyDevelopmentChecklistProps> = ({ 
  litter,
  onToggleItem
}) => {
  // Generate checklist items based on puppy age
  const generateChecklist = (): ChecklistItem[] => {
    // Default checklist items for all litters
    const checklistItems: ChecklistItem[] = [
      {
        id: `${litter.id}-deworm-3w`,
        title: 'First Deworming (3 weeks)',
        description: 'Administer first deworming treatment to puppies',
        age: 21,
        isCompleted: false
      },
      {
        id: `${litter.id}-deworm-5w`,
        title: 'Second Deworming (5 weeks)',
        description: 'Administer second deworming treatment to puppies',
        age: 35,
        isCompleted: false
      },
      {
        id: `${litter.id}-deworm-7w`,
        title: 'Third Deworming (7 weeks)',
        description: 'Administer final deworming treatment before puppies leave',
        age: 49,
        isCompleted: false
      },
      {
        id: `${litter.id}-vet-6w`,
        title: 'Schedule Vet Visit (6 weeks)',
        description: 'Book vet appointment for final health check',
        age: 42,
        isCompleted: false
      },
      {
        id: `${litter.id}-microchip-7w`,
        title: 'Microchip Puppies (7 weeks)',
        description: 'Arrange for puppies to be microchipped before they go to new homes',
        age: 49,
        isCompleted: false
      },
      {
        id: `${litter.id}-vacc-6w`,
        title: 'First Vaccination (6-8 weeks)',
        description: 'Puppies should receive their first vaccination',
        age: 42,
        isCompleted: false
      },
      {
        id: `${litter.id}-temp-4w`,
        title: 'Temperament Testing (4-5 weeks)',
        description: 'Assess puppy temperaments to help with placement',
        age: 28,
        isCompleted: false
      },
      {
        id: `${litter.id}-puppy-pack`,
        title: 'Prepare Puppy Packs (7 weeks)',
        description: 'Compile documentation, care instructions and supplies for new owners',
        age: 49,
        isCompleted: false
      }
    ];
    
    // Load saved completion statuses from localStorage
    const savedStatus = localStorage.getItem(`litter-checklist-${litter.id}`);
    if (savedStatus) {
      try {
        const savedItems = JSON.parse(savedStatus) as Record<string, boolean>;
        checklistItems.forEach(item => {
          if (savedItems[item.id] !== undefined) {
            item.isCompleted = savedItems[item.id];
          }
        });
      } catch (e) {
        console.error('Error parsing saved checklist status', e);
      }
    }
    
    return checklistItems;
  };
  
  const checklist = generateChecklist();
  const birthDate = parseISO(litter.dateOfBirth);
  const today = new Date();
  const puppyAge = differenceInDays(today, birthDate);
  
  // Filter items to show only relevant ones based on current puppy age
  const relevantItems = checklist.filter(item => 
    puppyAge >= item.age - 7 && // Show items starting 1 week before they're due
    puppyAge <= item.age + 14   // Keep showing items for 2 weeks after they're due
  );
  
  // Handle toggling an item's completion status
  const handleToggle = (itemId: string) => {
    const item = checklist.find(item => item.id === itemId);
    if (item) {
      const newStatus = !item.isCompleted;
      
      // Update localStorage
      const savedStatus = localStorage.getItem(`litter-checklist-${litter.id}`);
      const statusMap: Record<string, boolean> = savedStatus ? JSON.parse(savedStatus) : {};
      statusMap[itemId] = newStatus;
      localStorage.setItem(`litter-checklist-${litter.id}`, JSON.stringify(statusMap));
      
      // Call the parent handler
      onToggleItem(itemId, newStatus);
    }
  };
  
  if (relevantItems.length === 0) {
    return null; // Don't show the checklist if there are no relevant items
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Puppy Development Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-4">
          Current puppy age: <span className="font-medium">{puppyAge} days</span>
        </div>
        
        <div className="space-y-2">
          {relevantItems.map(item => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => handleToggle(item.id)}
            >
              {item.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyDevelopmentChecklist;
