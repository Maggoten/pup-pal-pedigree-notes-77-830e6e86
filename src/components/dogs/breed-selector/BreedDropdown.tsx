
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { commonDogBreeds } from '@/utils/dogBreeds';
import CustomBreedDialog from './CustomBreedDialog';
import BreedSearchResults from './BreedSearchResults';
import { cn } from '@/lib/utils';

interface BreedDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const BreedDropdown: React.FC<BreedDropdownProps> = ({ value, onChange, className }) => {
  const [customBreedDialogOpen, setCustomBreedDialogOpen] = useState(false);
  const [customBreed, setCustomBreed] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Show selected breed in the input if available
  useEffect(() => {
    if (value && !searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);
  
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

  // Handle selection from the dropdown
  const handleBreedSelect = (selectedBreed: string) => {
    onChange(selectedBreed);
    setSearchTerm(selectedBreed);
    setIsDropdownOpen(false);
  };

  // Handle custom breed submission
  const handleCustomBreedSubmit = () => {
    if (customBreed.trim()) {
      onChange(customBreed.trim());
      setSearchTerm(customBreed.trim());
      setCustomBreedDialogOpen(false);
      setIsDropdownOpen(false);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setIsDropdownOpen(false);
      }
    }, 200);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  return (
    <>
      <div className="relative w-full">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Search breeds..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn("w-full pr-10 bg-white border-greige-300", className)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        {isDropdownOpen && (
          <BreedSearchResults 
            searchTerm={searchTerm}
            filteredBreeds={filteredBreeds}
            currentValue={value}
            onSelectBreed={handleBreedSelect}
            onAddCustomBreed={() => setCustomBreedDialogOpen(true)}
            hasExactMatch={hasExactMatch}
          />
        )}
      </div>
      
      <CustomBreedDialog 
        open={customBreedDialogOpen}
        onOpenChange={setCustomBreedDialogOpen}
        breedName={customBreed}
        onBreedNameChange={setCustomBreed}
        onSubmit={handleCustomBreedSubmit}
      />
    </>
  );
};

export default BreedDropdown;
