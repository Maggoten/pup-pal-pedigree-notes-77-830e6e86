
import { useRef, useEffect } from 'react';

/**
 * Debug hook to track component renders and prop changes 
 * Only used in development mode!
 */
export const useRenderDebug = (componentName: string, props: Record<string, any>) => {
  const renderCount = useRef(0);
  const prevProps = useRef<Record<string, any>>({});
  const mountedAt = useRef(Date.now());
  
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  useEffect(() => {
    renderCount.current += 1;
    
    console.group(`%c[RENDER] ${componentName} (render #${renderCount.current})`, 'color: #3b82f6; font-weight: bold;');
    console.log(`%cTime since mount: ${Date.now() - mountedAt.current}ms`, 'color: #8b5cf6');
    
    // Compare previous props with current ones to identify what changed
    if (renderCount.current > 1) {
      const changedProps: Record<string, { from: any, to: any }> = {};
      
      // Check which props changed
      Object.keys(props).forEach(key => {
        if (prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key]
          };
        }
      });
      
      // Log changed props
      if (Object.keys(changedProps).length > 0) {
        console.log('%cChanged props:', 'color: #10b981; font-weight: bold');
        Object.entries(changedProps).forEach(([prop, { from, to }]) => {
          console.log(`%c${prop}:`, 'font-weight: bold', { from, to });
        });
      } else {
        console.log('%cNo props changed. Re-render possibly caused by context or parent.', 'color: #f97316');
      }
    }
    
    console.groupEnd();
    
    // Update prevProps ref with current props
    prevProps.current = { ...props };
    
    // Cleanup function
    return () => {
      if (renderCount.current === 1) {
        console.log(`%c[UNMOUNT] ${componentName} after 1 render`, 'color: #ef4444');
      } else {
        console.log(`%c[UNMOUNT] ${componentName} after ${renderCount.current} renders`, 'color: #ef4444');
      }
    };
  });
};
