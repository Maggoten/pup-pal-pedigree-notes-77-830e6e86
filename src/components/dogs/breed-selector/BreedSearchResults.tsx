
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BreedSearchResultsProps {
  searchTerm: string;
  filteredBreeds: string[];
  currentValue: string;
  onSelectBreed: (breed: string) => void;
  onAddCustomBreed: () => void;
  hasExactMatch: boolean;
}

const BreedSearchResults: React.FC<BreedSearchResultsProps> = ({
  searchTerm,
  filteredBreeds,
  currentValue,
  onSelectBreed,
  onAddCustomBreed,
  hasExactMatch
}) => {
  if (!searchTerm) return null;
  
  return (
    <div className="absolute w-full mt-1 max-h-60 overflow-auto z-50 bg-white border border-gray-200 rounded-md shadow-lg">
      {filteredBreeds.length > 0 ? (
        <ul className="py-1">
          {filteredBreeds.map((breed) => (
            <li 
              key={breed} 
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              onClick={() => onSelectBreed(breed)}
            >
              {breed}
              {breed === currentValue && (
                <span className="text-primary">✓</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-3">
          <p className="text-sm text-gray-500 mb-2">No breed found. Add a custom breed:</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start flex items-center gap-2"
            onClick={onAddCustomBreed}
          >
            <Plus className="h-4 w-4" /> 
            Add "{searchTerm}" as custom breed
          </Button>
        </div>
      )}
      
      {!hasExactMatch && filteredBreeds.length > 0 && (
        <div className="px-3 py-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start flex items-center gap-2"
            onClick={onAddCustomBreed}
          >
            <Plus className="h-4 w-4" /> 
            Add "{searchTerm}" as custom breed
          </Button>
        </div>
      )}
    </div>
  );
};

export default BreedSearchResults;
