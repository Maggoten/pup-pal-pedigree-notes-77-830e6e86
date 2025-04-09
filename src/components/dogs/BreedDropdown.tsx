
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { commonDogBreeds } from '@/utils/dogBreeds';
import { Search, Plus } from 'lucide-react';

interface BreedDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const BreedDropdown: React.FC<BreedDropdownProps> = ({ value, onChange }) => {
  const [customBreedDialogOpen, setCustomBreedDialogOpen] = useState(false);
  const [customBreed, setCustomBreed] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter breeds based on search term
  const filteredBreeds = searchTerm 
    ? commonDogBreeds.filter(breed => 
        breed.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : commonDogBreeds;

  // Display "Custom..." option if no exact match and there's a search term
  const hasExactMatch = searchTerm ? 
    filteredBreeds.some(breed => breed.toLowerCase() === searchTerm.toLowerCase()) : 
    true;
  
  // Reset custom breed input when dialog opens
  useEffect(() => {
    if (customBreedDialogOpen) {
      setCustomBreed(searchTerm);
    }
  }, [customBreedDialogOpen, searchTerm]);

  // Handle value selection
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setCustomBreedDialogOpen(true);
    } else {
      onChange(selectedValue);
    }
  };

  // Handle custom breed submission
  const handleCustomBreedSubmit = () => {
    if (customBreed.trim()) {
      onChange(customBreed.trim());
      setCustomBreedDialogOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      <div className="relative w-full">
        <div className="relative">
          <Input
            placeholder="Search breeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 bg-white"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        {searchTerm && (
          <div className="absolute w-full mt-1 max-h-60 overflow-auto z-50 bg-white border border-gray-200 rounded-md shadow-lg">
            {filteredBreeds.length > 0 ? (
              <ul className="py-1">
                {filteredBreeds.map((breed) => (
                  <li 
                    key={breed} 
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      onChange(breed);
                      setSearchTerm('');
                    }}
                  >
                    {breed}
                    {breed === value && (
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
                  onClick={() => setCustomBreedDialogOpen(true)}
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
                  onClick={() => setCustomBreedDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" /> 
                  Add "{searchTerm}" as custom breed
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Custom Breed Dialog */}
      <Dialog open={customBreedDialogOpen} onOpenChange={setCustomBreedDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Breed</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter custom breed name"
              value={customBreed}
              onChange={(e) => setCustomBreed(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomBreedDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomBreedSubmit} disabled={!customBreed.trim()}>
              Add Breed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BreedDropdown;
