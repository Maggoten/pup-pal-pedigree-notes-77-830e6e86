interface DogColor {
  band: string;      // Main band color
  light: string;     // Light background for uncertainty
  border: string;    // Border/contrast
  chip: string;      // Chip background
  text: string;      // Text color (contrasted)
}

/**
 * Get consistent pregnancy color for a dog based on dogId
 */
export const getDogPregnancyColor = (dogId: string): DogColor => {
  // Hash dogId to consistent color
  const hash = dogId.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  
  const colorPalette: DogColor[] = [
    { 
      band: 'bg-pink-400', 
      light: 'bg-pink-50/20', 
      border: 'border-pink-600',
      chip: 'bg-pink-500',
      text: 'text-white'
    },
    { 
      band: 'bg-rose-400', 
      light: 'bg-rose-50/20', 
      border: 'border-rose-600',
      chip: 'bg-rose-500',
      text: 'text-white'
    },
    { 
      band: 'bg-fuchsia-400', 
      light: 'bg-fuchsia-50/20', 
      border: 'border-fuchsia-600',
      chip: 'bg-fuchsia-500',
      text: 'text-white'
    },
    { 
      band: 'bg-purple-400', 
      light: 'bg-purple-50/20', 
      border: 'border-purple-600',
      chip: 'bg-purple-500',
      text: 'text-white'
    },
    { 
      band: 'bg-indigo-400', 
      light: 'bg-indigo-50/20', 
      border: 'border-indigo-600',
      chip: 'bg-indigo-500',
      text: 'text-white'
    },
  ];
  
  return colorPalette[hash % colorPalette.length];
};
