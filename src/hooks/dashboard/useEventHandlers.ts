
export const useEventHandlers = () => {
  // Wrapper functions to adapt async functions to the synchronous interface expected by components
  const handleAddEvent = (addEvent: Function) => (data: any) => {
    const result = addEvent(data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch((err: any) => {
        console.error("Error adding event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  const handleEditEvent = (editEvent: Function) => (eventId: string, data: any) => {
    const result = editEvent(eventId, data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch((err: any) => {
        console.error("Error editing event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };

  return {
    handleAddEvent,
    handleEditEvent
  };
};
