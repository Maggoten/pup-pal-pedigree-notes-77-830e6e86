
import React from 'react';
import { Dog, FileText, Settings, PawPrint, Calendar, LogOut, Menu } from 'lucide-react';
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
  
  const navItems = [
    { path: "/", label: "Home", icon: Calendar },
    { path: "/my-dogs", label: "My Dogs", icon: Dog },
    { path: "/planned-litters", label: "Planned Litters", icon: FileText },
    { path: "/pregnancy", label: "Pregnancy", icon: PawPrint },
    { path: "/my-litters", label: "My Litters", icon: Dog }
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="pt-10">
              <nav className="flex flex-col space-y-2 p-4">
                {navItems.map((item) => (
                  <DrawerClose key={item.path} asChild>
                    <Button 
                      variant={isActive(item.path) ? "default" : "ghost"} 
                      asChild
                      className="justify-start w-full"
                    >
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  </DrawerClose>
                ))}
                <DrawerClose asChild>
                  <Button 
                    variant="destructive" 
                    className="justify-start w-full mt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </Button>
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>
          <Dog className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Breeding Journey</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Button key={item.path} variant={isActive(item.path) ? "default" : "ghost"} asChild>
              <Link to={item.path} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
