
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

  useEffect(() => {
    setDisplayValue(value);
    if (value && !commonDogBreeds.includes(value)) {
      setCustomBreed(value);
    }
  }, [value]);

  const filteredBreeds = commonDogBreeds.filter((breed) => 
    breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setDisplayValue(currentValue);
    setOpen(false);
  };

  const handleCustomBreed = () => {
    if (customBreed.trim() !== "") {
      onChange(customBreed.trim());
      setDisplayValue(customBreed.trim());
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal h-10"
        >
          {displayValue || "Select breed..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput 
            placeholder="Search for a breed..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No breed found. Add a custom breed:</p>
                <div className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    value={customBreed}
                    onChange={(e) => setCustomBreed(e.target.value)}
                    placeholder="Enter custom breed"
                    className="h-8"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCustomBreed}
                    disabled={!customBreed.trim()}
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
                  className="text-sm cursor-pointer"
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
                      placeholder="Enter custom breed"
                      className="h-8"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleCustomBreed}
                      disabled={!(customBreed || searchTerm).trim()}
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
