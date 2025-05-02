
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
import { Search, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreedDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const BreedDropdown: React.FC<BreedDropdownProps> = ({ 
  value, 
  onChange, 
  disabled = false, 
  className 
}) => {
  const [customBreedDialogOpen, setCustomBreedDialogOpen] = useState(false);
  const [customBreed, setCustomBreed] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Display the selected value in the input when not searching
  useEffect(() => {
    if (!isDropdownOpen && value) {
      setSearchTerm(value);
    }
  }, [isDropdownOpen, value]);
  
  // Filter breeds based on search term
  const filteredBreeds = searchTerm && isDropdownOpen
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

  // Handle custom breed submission
  const handleCustomBreedSubmit = () => {
    if (customBreed.trim()) {
      onChange(customBreed.trim());
      setCustomBreedDialogOpen(false);
      setSearchTerm(customBreed.trim());
      setIsDropdownOpen(false);
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (value === searchTerm) {
      setSearchTerm('');
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!customBreedDialogOpen) {
        setIsDropdownOpen(false);
        // Restore the actual value if user didn't select anything
        if (value && !searchTerm) {
          setSearchTerm(value);
        }
      }
    }, 200);
  };

  const handleBreedSelect = (breed: string) => {
    onChange(breed);
    setSearchTerm(breed);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <Input
            placeholder={value ? value : "Search breeds..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn(
              "w-full pr-10 bg-white",
              value && !isDropdownOpen && !searchTerm ? "text-gray-900" : ""
            )}
            disabled={disabled}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        {isDropdownOpen && !disabled && (
          <div className="absolute w-full mt-1 max-h-60 overflow-auto z-50 bg-white border border-gray-200 rounded-md shadow-lg">
            {filteredBreeds.length > 0 ? (
              <ul className="py-1">
                {filteredBreeds.map((breed) => (
                  <li 
                    key={breed} 
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => handleBreedSelect(breed)}
                  >
                    {breed}
                    {breed === value && (
                      <Check className="h-4 w-4 text-primary" />
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
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4" /> 
                  Add "{searchTerm}" as custom breed
                </Button>
              </div>
            )}
            
            {!hasExactMatch && filteredBreeds.length > 0 && searchTerm && (
              <div className="px-3 py-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start flex items-center gap-2"
                  onClick={() => setCustomBreedDialogOpen(true)}
                  disabled={disabled}
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
