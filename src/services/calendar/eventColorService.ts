
// Get event color based on type
export const getEventColor = (type: string): string => {
  switch (type) {
    case 'heat':
      return 'bg-rose-100 border-rose-300 text-rose-800';
    case 'mating':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'planned-mating':
      return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    case 'due-date':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'custom':
      return 'bg-green-100 border-green-300 text-green-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};
