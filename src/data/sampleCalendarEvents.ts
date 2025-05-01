
import { CalendarEvent } from '@/components/calendar/types';

export const getSampleEvents = (): CalendarEvent[] => {
  return [
    {
      id: '1',
      title: 'Pregnancy Due Date',
      date: new Date(2025, 4, 15), // May 15, 2025
      type: 'due-date',
      dogId: '1',
      dogName: 'Luna'
    },
    {
      id: '2',
      title: 'Planned Mating',
      date: new Date(2025, 3, 12), // April 12, 2025
      type: 'planned-mating',
      dogId: '2',
      dogName: 'Bella'
    },
    {
      id: '3',
      title: 'Due Date',
      date: new Date(2025, 4, 5), // May 5, 2025
      type: 'due-date',
      dogId: '2',
      dogName: 'Bella'
    }
  ];
};
