
import React, { useState } from 'react';
import { Dog, FileText, Settings, PawPrint, LogOut, Menu, Calendar, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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
  const { logout, isAuthTransitioning, isLoggedIn } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  
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
      // Add extra local state to prevent multiple clicks in addition to auth state
      if (isAuthTransitioning || logoutInProgress) {
        console.log("Navbar: Logout already in progress, ignoring request");
        return;
      }
      
      // Set local logout in progress state
      setLogoutInProgress(true);
      
      console.log("Navbar: Initiating logout, current auth state:", {
        isLoggedIn,
        isAuthTransitioning
      });
      
      await logout();
      
      console.log("Navbar: Logout completed");
      // Don't navigate - let AuthGuard handle it when auth state changes
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Release local lock after a small delay
      setTimeout(() => {
        setLogoutInProgress(false);
      }, 1000);
    }
  };
  
  const navItems = [
    { path: "/", label: "Home", icon: Calendar },
    { path: "/my-dogs", label: "My Dogs", icon: Dog },
    { path: "/planned-litters", label: "Planned Litters", icon: FileText },
    { path: "/pregnancy", label: "Pregnancy", icon: Heart },
    { path: "/my-litters", label: "My Litters", icon: PawPrint }
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
                    disabled={isAuthTransitioning || logoutInProgress}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>
                      {isAuthTransitioning || logoutInProgress ? "Logging out..." : "Logout"}
                    </span>
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            title="Logout"
            disabled={isAuthTransitioning || logoutInProgress}
          >
            <LogOut className={`h-5 w-5 ${(isAuthTransitioning || logoutInProgress) ? 'text-gray-400 animate-pulse' : ''}`} />
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
