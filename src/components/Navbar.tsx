
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center gap-6">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden p-4">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="pt-10">
              <div className="flex justify-center mb-8">
                <BreedingJourneyLogo showSlogan compact={false} />
              </div>
              <nav className="flex flex-col space-y-3 p-4">
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
          <Link to="/" className="transition-transform hover:scale-105 duration-300">
            <BreedingJourneyLogo showSlogan compact={false} />
          </Link>
        </div>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.path}>
                <Link to={item.path}>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} flex items-center gap-2 px-4 py-2 text-base ${isActive(item.path) ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleSettings} title="Settings" className="transition-transform hover:scale-105 duration-200 p-3">
            <Settings className="h-6 w-6" />
          </Button>
          <Button variant="outline" onClick={handleLogout} className="transition-transform hover:scale-105 duration-200 flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
