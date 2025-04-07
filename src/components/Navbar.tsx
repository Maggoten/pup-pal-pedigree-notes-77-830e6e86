
import React from 'react';
import { LogOut, Menu, Calendar, Dog, FileText, Settings, PawPrint } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from '@/components/ui/drawer';
import BreedingJourneyLogo from './illustrations/BreedingJourneyLogo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate('/login');
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };
  
  const navItems = [
    { path: "/", label: "Home", icon: Calendar },
    { path: "/my-dogs", label: "My Dogs", icon: Dog },
    { path: "/planned-litters", label: "Planned Litters", icon: FileText },
    { path: "/pregnancy", label: "Pregnancy", icon: PawPrint },
    { path: "/my-litters", label: "My Litters", icon: Dog }
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden p-3">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="pt-10">
              <div className="flex justify-center mb-6">
                <BreedingJourneyLogo showSlogan />
              </div>
              <nav className="flex flex-col space-y-2 p-4">
                {navItems.map((item) => (
                  <DrawerClose key={item.path} asChild>
                    <Button 
                      variant={isActive(item.path) ? "default" : "ghost"} 
                      asChild
                      className="justify-start w-full py-3 text-base"
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  </DrawerClose>
                ))}
                <DrawerClose asChild>
                  <Button 
                    variant="ghost" 
                    className="justify-start w-full py-3 text-base"
                    onClick={handleSettings}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button 
                    variant="destructive" 
                    className="justify-start w-full mt-4 py-3 text-base"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </Button>
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>
          <Link to="/" className="hover:opacity-80 transition-opacity duration-200">
            <BreedingJourneyLogo showSlogan={false} />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Button key={item.path} variant={isActive(item.path) ? "default" : "ghost"} asChild className="text-base py-6 px-4">
              <Link to={item.path} className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="p-3">
            <LogOut className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSettings} title="Settings" className="p-3">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
