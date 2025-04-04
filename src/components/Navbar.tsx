
import React from 'react';
import { Dog, FileText, HeartPulse, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Dog className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Breeders Journey</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/my-dogs" className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              <span>My Dogs</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/planned-litters" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Planned Litters</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/mating" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              <span>Mating</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/pregnancy" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Pregnancy</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/puppies" className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              <span>Puppies</span>
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
