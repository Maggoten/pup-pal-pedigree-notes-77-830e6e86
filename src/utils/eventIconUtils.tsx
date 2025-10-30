import { 
  Heart, 
  PawPrint, 
  Cake, 
  Syringe, 
  Flame, 
  Sparkles, 
  Flower2, 
  Stethoscope,
  Calendar,
  LucideIcon
} from 'lucide-react';

// Map event types to their corresponding icons
export const eventTypeIcons: Record<string, LucideIcon> = {
  'mating': Heart,
  'due-date': PawPrint,
  'birthday': Cake,
  'vaccination': Syringe,
  'heat': Flame,
  'heat-active': Flame,
  'ovulation-predicted': Sparkles,
  'fertility-window': Flower2,
  'vet-visit': Stethoscope,
  'custom': Calendar,
  'reminder': Calendar,
  'planned-mating': Heart,
  'deworming': Syringe,
};

// Get icon component for an event type
export function getEventIcon(type: string | undefined): LucideIcon | null {
  if (!type) return null;
  return eventTypeIcons[type] || null;
}
