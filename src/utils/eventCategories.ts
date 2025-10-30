export interface EventCategory {
  name: string;
  icon: string;
  pillClass: string;      // Kompakt pill-stil
  ringClass: string;      // Ring runt cell
  bgShade: string;        // Svag bakgrund för uncertainty
  chipPriority: number;   // För sortering av chips
}

export const EVENT_CATEGORIES: Record<string, EventCategory> = {
  // Dräktighet - Rose/Pink
  'mating': {
    name: 'Mating',
    icon: '♥',
    pillClass: 'bg-rose-100 text-rose-700 border-rose-200',
    ringClass: 'ring-2 ring-rose-400/50',
    bgShade: 'bg-rose-50/10',
    chipPriority: 2
  },
  'due-date': {
    name: 'Due Date',
    icon: '★',
    pillClass: 'bg-rose-100 text-rose-700 border-rose-200',
    ringClass: 'ring-2 ring-rose-400/50',
    bgShade: 'bg-rose-50/10',
    chipPriority: 1  // Högst prioritet
  },
  
  // Födelsedag - Sky/Blue
  'birthday': {
    name: 'Birthday',
    icon: '🎂',
    pillClass: 'bg-sky-100 text-sky-700 border-sky-200',
    ringClass: 'ring-2 ring-sky-400/35',
    bgShade: 'bg-sky-50/10',
    chipPriority: 3
  },
  'birthday-reminder': {
    name: 'Birthday Reminder',
    icon: '🎂',
    pillClass: 'bg-sky-100 text-sky-700 border-sky-200',
    ringClass: 'ring-2 ring-sky-400/35',
    bgShade: 'bg-sky-50/10',
    chipPriority: 4
  },
  
  // Hälsa - Green
  'vaccination': {
    name: 'Vaccination',
    icon: '💉',
    pillClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ringClass: 'ring-2 ring-emerald-400/30',
    bgShade: 'bg-emerald-50/10',
    chipPriority: 5
  },
  'health': {
    name: 'Health',
    icon: '🏥',
    pillClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ringClass: 'ring-2 ring-emerald-400/30',
    bgShade: 'bg-emerald-50/10',
    chipPriority: 6
  },
  'vet-appointment': {
    name: 'Vet Appointment',
    icon: '🏥',
    pillClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ringClass: 'ring-2 ring-emerald-400/30',
    bgShade: 'bg-emerald-50/10',
    chipPriority: 6
  },
  
  // Brunst - Amber/Purple
  'heat': {
    name: 'Heat',
    icon: '🔥',
    pillClass: 'bg-amber-100 text-amber-700 border-amber-200',
    ringClass: 'ring-2 ring-amber-400/30',
    bgShade: 'bg-amber-50/10',
    chipPriority: 7
  },
  'heat-start': {
    name: 'Heat Start',
    icon: '🔥',
    pillClass: 'bg-amber-100 text-amber-700 border-amber-200',
    ringClass: 'ring-2 ring-amber-400/30',
    bgShade: 'bg-amber-50/10',
    chipPriority: 7
  },
  'ovulation-predicted': {
    name: 'Ovulation',
    icon: '⭕',
    pillClass: 'bg-purple-100 text-purple-700 border-purple-200',
    ringClass: 'ring-2 ring-purple-400/30',
    bgShade: 'bg-purple-50/10',
    chipPriority: 8
  },
  'fertility-window': {
    name: 'Fertility Window',
    icon: '💝',
    pillClass: 'bg-purple-100 text-purple-700 border-purple-200',
    ringClass: 'ring-2 ring-purple-400/30',
    bgShade: 'bg-purple-50/10',
    chipPriority: 9
  },
  
  // Custom - Lilac
  'custom': {
    name: 'Custom',
    icon: '📌',
    pillClass: 'bg-violet-100 text-violet-700 border-violet-200',
    ringClass: 'ring-2 ring-violet-400/30',
    bgShade: 'bg-violet-50/10',
    chipPriority: 10
  },
  'reminder': {
    name: 'Reminder',
    icon: '🔔',
    pillClass: 'bg-violet-100 text-violet-700 border-violet-200',
    ringClass: 'ring-2 ring-violet-400/30',
    bgShade: 'bg-violet-50/10',
    chipPriority: 11
  }
};

export const getEventCategory = (type?: string): EventCategory => {
  if (!type) return EVENT_CATEGORIES['custom'];
  return EVENT_CATEGORIES[type] || EVENT_CATEGORIES['custom'];
};
