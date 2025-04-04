
import React from 'react';
import { Paw, FileText, HeartPulse, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Paw className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">BreedersJournal</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Paw className="h-4 w-4" />
              <span>Dogs</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Pedigrees</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              <span>Health</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Breeding</span>
            </Link>
          </Button>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
