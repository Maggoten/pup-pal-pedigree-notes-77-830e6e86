
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Litter } from '@/types/breeding';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';
import { CheckCircle, Circle, CalendarRange, Milestone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PuppyDevelopmentChecklistProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
  compact?: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  age: number; // in days
  isCompleted: boolean;
  category: 'health' | 'development' | 'admin';
  weekNumber?: number;
}

// Group checklist items by timeline segments
const timelineSegments = [
  { name: 'First Week', min: 0, max: 7 },
  { name: 'Weeks 2-3', min: 8, max: 21 },
  { name: 'Weeks 4-6', min: 22, max: 42 },
  { name: 'Weeks 7-8', min: 43, max: 56 },
  { name: 'After 8 Weeks', min: 57, max: 100 }
];

const PuppyDevelopmentChecklist: React.FC<PuppyDevelopmentChecklistProps> = ({ 
  litter,
  onToggleItem,
  compact = false
}) => {
  const [activeCategory, setActiveCategory] = React.useState('all');
  
  // Generate checklist items based on puppy age
  const generateChecklist = (): ChecklistItem[] => {
    // Comprehensive checklist items for all litters
    const checklistItems: ChecklistItem[] = [
      // Health-related items
      {
        id: `${litter.id}-deworm-2w`,
        title: 'First Deworming',
        description: 'Administer first deworming treatment to puppies',
        age: 14,
        isCompleted: false,
        category: 'health',
        weekNumber: 2
      },
      {
        id: `${litter.id}-deworm-4w`,
        title: 'Second Deworming',
        description: 'Administer second deworming treatment to puppies',
        age: 28,
        isCompleted: false,
        category: 'health',
        weekNumber: 4
      },
      {
        id: `${litter.id}-deworm-6w`,
        title: 'Third Deworming',
        description: 'Administer third deworming treatment to puppies',
        age: 42,
        isCompleted: false,
        category: 'health',
        weekNumber: 6
      },
      {
        id: `${litter.id}-deworm-8w`,
        title: 'Final Deworming',
        description: 'Administer final deworming treatment before puppies leave',
        age: 56,
        isCompleted: false,
        category: 'health',
        weekNumber: 8
      },
      {
        id: `${litter.id}-vet-6w`,
        title: 'Vet Visit',
        description: 'Schedule vet appointment for health check and vaccinations',
        age: 42,
        isCompleted: false,
        category: 'health',
        weekNumber: 6
      },
      {
        id: `${litter.id}-vacc-6w`,
        title: 'First Vaccination',
        description: 'Puppies should receive their first vaccination',
        age: 42,
        isCompleted: false,
        category: 'health',
        weekNumber: 6
      },
      {
        id: `${litter.id}-vacc-9w`,
        title: 'Second Vaccination',
        description: 'Plan for second vaccination (after puppies leave)',
        age: 63,
        isCompleted: false,
        category: 'health',
        weekNumber: 9
      },
      
      // Development-related items
      {
        id: `${litter.id}-weaning-3w`,
        title: 'Start Weaning',
        description: 'Begin introducing puppy food mixed with water',
        age: 21,
        isCompleted: false,
        category: 'development',
        weekNumber: 3
      },
      {
        id: `${litter.id}-weaning-4w`,
        title: 'Continue Weaning',
        description: 'Gradually reduce mother\'s milk dependency',
        age: 28,
        isCompleted: false,
        category: 'development',
        weekNumber: 4
      },
      {
        id: `${litter.id}-weaning-5w`,
        title: 'Complete Weaning',
        description: 'Puppies should be mostly eating solid food',
        age: 35,
        isCompleted: false,
        category: 'development',
        weekNumber: 5
      },
      {
        id: `${litter.id}-socialization-3w`,
        title: 'Begin Socialization',
        description: 'Start introducing puppies to different sounds and gentle handling',
        age: 21,
        isCompleted: false,
        category: 'development',
        weekNumber: 3
      },
      {
        id: `${litter.id}-socialization-5w`,
        title: 'Increase Socialization',
        description: 'Expose puppies to more people, sounds, and experiences',
        age: 35,
        isCompleted: false,
        category: 'development',
        weekNumber: 5
      },
      {
        id: `${litter.id}-temp-4w`,
        title: 'Temperament Testing',
        description: 'Assess puppy temperaments to help with placement',
        age: 28,
        isCompleted: false,
        category: 'development',
        weekNumber: 4
      },
      
      // Administrative items
      {
        id: `${litter.id}-microchip-7w`,
        title: 'Microchip Puppies',
        description: 'Arrange for puppies to be microchipped before they go to new homes',
        age: 49,
        isCompleted: false,
        category: 'admin',
        weekNumber: 7
      },
      {
        id: `${litter.id}-photos-6w`,
        title: 'Professional Photos',
        description: 'Take professional photos of puppies for adoption profiles',
        age: 42,
        isCompleted: false,
        category: 'admin',
        weekNumber: 6
      },
      {
        id: `${litter.id}-register-7w`,
        title: 'Register Litter',
        description: 'Submit registration paperwork for the litter',
        age: 49,
        isCompleted: false,
        category: 'admin',
        weekNumber: 7
      },
      {
        id: `${litter.id}-puppy-pack`,
        title: 'Prepare Puppy Packs',
        description: 'Compile documentation, care instructions and supplies for new owners',
        age: 49,
        isCompleted: false,
        category: 'admin',
        weekNumber: 7
      },
      {
        id: `${litter.id}-contracts-7w`,
        title: 'Prepare Contracts',
        description: 'Finalize adoption contracts for new puppy owners',
        age: 49,
        isCompleted: false,
        category: 'admin',
        weekNumber: 7
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
  const puppyWeeks = differenceInWeeks(today, birthDate);
  
  // Calculate completion statistics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.isCompleted).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Filter items based on active category and current puppy age
  const getFilteredItems = () => {
    let filtered = checklist;
    
    // Filter by category if not 'all'
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // For compact view, show only relevant items based on current puppy age
    if (compact) {
      filtered = filtered.filter(item => 
        puppyAge >= item.age - 7 && // Show items starting 1 week before they're due
        puppyAge <= item.age + 14   // Keep showing items for 2 weeks after they're due
      );
    }
    
    return filtered;
  };
  
  const filteredItems = getFilteredItems();
  
  // Group items by timeline segment
  const itemsByTimeline = timelineSegments.map(segment => ({
    ...segment,
    items: filteredItems.filter(item => item.age >= segment.min && item.age <= segment.max)
  }));
  
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
  
  // For compact view with no items, don't show the checklist
  if (compact && filteredItems.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Puppy Development Checklist
          </CardTitle>
          <Badge variant={completionPercentage === 100 ? "success" : "outline"}>
            {completedItems}/{totalItems} completed
          </Badge>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              <CalendarRange className="h-4 w-4 inline mr-1" />
              Current age: <span className="font-medium">{puppyAge} days ({puppyWeeks} weeks)</span>
            </span>
            <span className="text-muted-foreground">{completionPercentage}% complete</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {!compact && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="admin">Administrative</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {compact ? (
          <div className="space-y-2">
            {filteredItems.map(item => (
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
        ) : (
          <div className="space-y-8">
            {itemsByTimeline
              .filter(segment => segment.items.length > 0)
              .map(segment => (
                <div key={segment.name} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Milestone className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{segment.name}</h3>
                  </div>
                  
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    {segment.items.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleToggle(item.id)}
                      >
                        {item.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium">{item.title}</div>
                            <Badge variant="outline" className="text-xs">Week {item.weekNumber}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No tasks found in this category for the current puppy age.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PuppyDevelopmentChecklist;
