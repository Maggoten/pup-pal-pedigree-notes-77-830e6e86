import React, { useState } from 'react';
import { Dog, FileText, Settings, PawPrint, LogOut, Menu, Calendar, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle
} from '@/components/ui/drawer';
import SettingsDialog from '@/components/settings/SettingsDialog';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useTranslation('common');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const isActive = (path: string) => {
    // Special case for home path to avoid matching all routes
    if (path === '/') {
      return location.pathname === '/';
    }
    // For all other routes, check if the current path starts with the nav item path
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = async () => {
    try {
      // AuthProvider now handles navigation directly, no need for navigate here
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  const navItems = [
    { path: "/", label: t('navigation.home'), icon: Calendar },
    { path: "/my-dogs", label: t('navigation.myDogs'), icon: Dog },
    { path: "/planned-litters", label: t('navigation.plannedLitters'), icon: FileText },
    { path: "/pregnancy", label: t('navigation.pregnancies'), icon: Heart },
    { path: "/my-litters", label: t('navigation.myLitters'), icon: PawPrint }
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
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
              <DrawerTitle className="sr-only">Mobile Navigation</DrawerTitle>
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
                    <span>{t('logout')}</span>
                  </Button>
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSettingsOpen(true)} 
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
};

export default Navbar;
