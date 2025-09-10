import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();

  const scrollToTop = () => {
    // Multiple approaches to ensure scroll works on all devices
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Force scroll for iOS Safari
    document.documentElement.style.scrollBehavior = 'auto';
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = '';
    }, 0);
  };

  // Scroll on route changes
  useLayoutEffect(() => {
    scrollToTop();
  }, [location.pathname, location.search]);

  return { scrollToTop };
};