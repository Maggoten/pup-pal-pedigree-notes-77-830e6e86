
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { commonDogBreeds } from '@/utils/dogBreeds';
import { Input } from '@/components/ui/input';

interface BreedDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const BreedDropdown: React.FC<BreedDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customBreed, setCustomBreed] = useState("");
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize display value from props
  useEffect(() => {
    setDisplayValue(value);
    if (value && !commonDogBreeds.includes(value)) {
      setCustomBreed(value);
    }
  }, [value]);

  // Filter breeds based on search term
  const filteredBreeds = commonDogBreeds.filter((breed) => 
    breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Focus the input when CommandEmpty is shown
  useEffect(() => {
    if (open && inputRef.current && filteredBreeds.length === 0) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, searchTerm, filteredBreeds.length]);

  // Handle selection of a predefined breed
  const handleSelect = (currentValue: string) => {
    if (currentValue) {
      onChange(currentValue);
      setDisplayValue(currentValue);
      setOpen(false);
      setSearchTerm("");
      setCustomBreed("");
    }
  };

  // Handle custom breed submission
  const handleCustomBreed = () => {
    const trimmedBreed = customBreed.trim() || searchTerm.trim();
    if (trimmedBreed) {
      onChange(trimmedBreed);
      setDisplayValue(trimmedBreed);
      setSearchTerm("");
      setCustomBreed("");
      setOpen(false);
    }
  };

  // Handle custom breed input key press
  const handleCustomBreedKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleCustomBreed();
    }
  };

  // Stop event propagation for the custom breed input
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal h-10 bg-white border-input shadow-sm"
          onClick={() => setOpen(true)}
        >
          {displayValue || "Select breed..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 bg-white z-50" 
        align="start"
        sideOffset={5}
        avoidCollisions={true}
      >
        <Command className="w-full bg-white">
          <CommandInput 
            placeholder="Search for a breed..." 
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              // Only set custom breed if there's no match in the list
              if (filteredBreeds.length === 0) {
                setCustomBreed(value);
              }
            }}
            className="h-9"
            autoFocus
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-2 px-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No breed found. Add a custom breed:</p>
                <div className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    value={customBreed || searchTerm}
                    onChange={(e) => setCustomBreed(e.target.value)}
                    onKeyDown={handleCustomBreedKeyPress}
                    onClick={handleInputClick}
                    placeholder="Enter custom breed"
                    className="h-8 bg-white"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCustomBreed}
                    disabled={!(customBreed || searchTerm).trim()}
                    type="button"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Common Breeds">
              {filteredBreeds.map((breed) => (
                <CommandItem
                  key={breed}
                  value={breed}
                  onSelect={() => handleSelect(breed)}
                  className="text-sm cursor-pointer hover:bg-accent"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{breed}</span>
                    {breed === displayValue && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {searchTerm && filteredBreeds.length > 0 && (
              <CommandGroup className="border-t pt-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm text-muted-foreground">Or add custom breed:</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={customBreed || searchTerm}
                      onChange={(e) => setCustomBreed(e.target.value)}
                      onKeyDown={handleCustomBreedKeyPress}
                      onClick={handleInputClick}
                      placeholder="Enter custom breed"
                      className="h-8 bg-white"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleCustomBreed}
                      disabled={!(customBreed || searchTerm).trim()}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BreedDropdown;
