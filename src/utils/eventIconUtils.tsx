import React from 'react';
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

// Map event types to Lucide icons
export const eventTypeIcons: Record<string, LucideIcon> = {
  'mating': Heart,                    // 💗 Parning
  'due-date': PawPrint,               // 🐾 Förlossning
  'birthday': Cake,                   // 🎂 Födelsedag
  'birthday-reminder': Cake,          // 🎂 Födelsedagspåminnelse
  'vaccination': Syringe,             // 💉 Vaccination
  'vaccination-reminder': Syringe,    // 💉 Vaccinationspåminnelse
  'heat': Flame,                      // 🔥 Predicted löp
  'heat-active': Flame,               // 🔥 Aktivt löp
  'ovulation-predicted': Sparkles,    // ✨ Ägglossning
  'fertility-window': Flower2,        // 🌸 Fertilitetsfönster
  'vet-visit': Stethoscope,          // 🏥 Veterinärbesök
  'custom': Calendar,                 // 📅 Custom event
  'reminder': Calendar,               // 📅 Påminnelse
  'default': Calendar                 // 📅 Default
};

/**
 * Get the appropriate icon component for an event type
 * @param type The event type
 * @returns The Lucide icon component
 */
export function getEventIcon(type?: string): LucideIcon {
  if (!type) return eventTypeIcons.default;
  return eventTypeIcons[type] || eventTypeIcons.default;
}
