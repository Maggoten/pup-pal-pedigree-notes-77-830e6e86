
import { ChecklistItem } from './types';

// All checklist items for puppy development
export const generateChecklistItems = (litterId: string): ChecklistItem[] => [
  // Health-related items
  {
    id: `${litterId}-deworm-2w`,
    title: 'First Deworming',
    description: 'Administer first deworming treatment to puppies',
    age: 14,
    isCompleted: false,
    category: 'health',
    weekNumber: 2
  },
  {
    id: `${litterId}-deworm-4w`,
    title: 'Second Deworming',
    description: 'Administer second deworming treatment to puppies',
    age: 28,
    isCompleted: false,
    category: 'health',
    weekNumber: 4
  },
  {
    id: `${litterId}-deworm-6w`,
    title: 'Third Deworming',
    description: 'Administer third deworming treatment to puppies',
    age: 42,
    isCompleted: false,
    category: 'health',
    weekNumber: 6
  },
  {
    id: `${litterId}-deworm-8w`,
    title: 'Final Deworming',
    description: 'Administer final deworming treatment before puppies leave',
    age: 56,
    isCompleted: false,
    category: 'health',
    weekNumber: 8
  },
  {
    id: `${litterId}-vet-6w`,
    title: 'Vet Visit',
    description: 'Schedule vet appointment for health check and vaccinations',
    age: 42,
    isCompleted: false,
    category: 'health',
    weekNumber: 6
  },
  {
    id: `${litterId}-vacc-6w`,
    title: 'First Vaccination',
    description: 'Puppies should receive their first vaccination',
    age: 42,
    isCompleted: false,
    category: 'health',
    weekNumber: 6
  },
  {
    id: `${litterId}-vacc-9w`,
    title: 'Second Vaccination',
    description: 'Plan for second vaccination (after puppies leave)',
    age: 63,
    isCompleted: false,
    category: 'health',
    weekNumber: 9
  },
  
  // Development-related items
  {
    id: `${litterId}-weaning-3w`,
    title: 'Start Weaning',
    description: 'Begin introducing puppy food mixed with water',
    age: 21,
    isCompleted: false,
    category: 'development',
    weekNumber: 3
  },
  {
    id: `${litterId}-weaning-4w`,
    title: 'Continue Weaning',
    description: 'Gradually reduce mother\'s milk dependency',
    age: 28,
    isCompleted: false,
    category: 'development',
    weekNumber: 4
  },
  {
    id: `${litterId}-weaning-5w`,
    title: 'Complete Weaning',
    description: 'Puppies should be mostly eating solid food',
    age: 35,
    isCompleted: false,
    category: 'development',
    weekNumber: 5
  },
  {
    id: `${litterId}-socialization-3w`,
    title: 'Begin Socialization',
    description: 'Start introducing puppies to different sounds and gentle handling',
    age: 21,
    isCompleted: false,
    category: 'development',
    weekNumber: 3
  },
  {
    id: `${litterId}-socialization-5w`,
    title: 'Increase Socialization',
    description: 'Expose puppies to more people, sounds, and experiences',
    age: 35,
    isCompleted: false,
    category: 'development',
    weekNumber: 5
  },
  {
    id: `${litterId}-temp-4w`,
    title: 'Temperament Testing',
    description: 'Assess puppy temperaments to help with placement',
    age: 28,
    isCompleted: false,
    category: 'development',
    weekNumber: 4
  },
  
  // Administrative items
  {
    id: `${litterId}-microchip-7w`,
    title: 'Microchip Puppies',
    description: 'Arrange for puppies to be microchipped before they go to new homes',
    age: 49,
    isCompleted: false,
    category: 'admin',
    weekNumber: 7
  },
  {
    id: `${litterId}-photos-6w`,
    title: 'Professional Photos',
    description: 'Take professional photos of puppies for adoption profiles',
    age: 42,
    isCompleted: false,
    category: 'admin',
    weekNumber: 6
  },
  {
    id: `${litterId}-register-7w`,
    title: 'Register Litter',
    description: 'Submit registration paperwork for the litter',
    age: 49,
    isCompleted: false,
    category: 'admin',
    weekNumber: 7
  },
  {
    id: `${litterId}-puppy-pack`,
    title: 'Prepare Puppy Packs',
    description: 'Compile documentation, care instructions and supplies for new owners',
    age: 49,
    isCompleted: false,
    category: 'admin',
    weekNumber: 7
  },
  {
    id: `${litterId}-contracts-7w`,
    title: 'Prepare Contracts',
    description: 'Finalize adoption contracts for new puppy owners',
    age: 49,
    isCompleted: false,
    category: 'admin',
    weekNumber: 7
  }
];
