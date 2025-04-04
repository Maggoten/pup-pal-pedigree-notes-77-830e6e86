
import React from 'react';
import { Dog, FileText, HeartPulse, Users, Settings, PawPrint, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Dog className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Breeding Journey</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant={isActive("/") ? "default" : "ghost"} asChild>
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <Button variant={isActive("/my-dogs") ? "default" : "ghost"} asChild>
            <Link to="/my-dogs" className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              <span>My Dogs</span>
            </Link>
          </Button>
          <Button variant={isActive("/planned-litters") ? "default" : "ghost"} asChild>
            <Link to="/planned-litters" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Planned Litters</span>
            </Link>
          </Button>
          <Button variant={isActive("/mating") ? "default" : "ghost"} asChild>
            <Link to="/mating" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              <span>Mating</span>
            </Link>
          </Button>
          <Button variant={isActive("/pregnancy") ? "default" : "ghost"} asChild>
            <Link to="/pregnancy" className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              <span>Pregnancy</span>
            </Link>
          </Button>
          <Button variant={isActive("/my-litters") ? "default" : "ghost"} asChild>
            <Link to="/my-litters" className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              <span>My Litters</span>
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
