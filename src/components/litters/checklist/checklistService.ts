
import { Litter } from '@/types/breeding';
import { ChecklistItem } from './types';

export const generateChecklist = (litter: Litter): ChecklistItem[] => {
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

export const saveChecklistItemStatus = (litterId: string, itemId: string, completed: boolean) => {
  const savedStatus = localStorage.getItem(`litter-checklist-${litterId}`);
  const statusMap: Record<string, boolean> = savedStatus ? JSON.parse(savedStatus) : {};
  statusMap[itemId] = completed;
  localStorage.setItem(`litter-checklist-${litterId}`, JSON.stringify(statusMap));
};
