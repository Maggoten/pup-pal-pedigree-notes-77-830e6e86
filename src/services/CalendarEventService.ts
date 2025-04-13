
// This file serves as a central export point for all calendar event services
import { loadEvents, addEvent, editEvent, deleteEvent } from './calendar/eventApiService';
import { getEventColor } from './calendar/eventColorService';

export {
  loadEvents,
  addEvent,
  editEvent,
  deleteEvent,
  getEventColor
};
