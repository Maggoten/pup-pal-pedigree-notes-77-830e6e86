
// This file serves as a central export point for all calendar event services
import { loadEvents } from './calendar/operations/loadEvents';
import { addEvent } from './calendar/operations/addEvent';
import { editEvent } from './calendar/operations/editEvent';
import { deleteEvent } from './calendar/operations/deleteEvent';
import { getEventColor } from './calendar/eventColorService';

export {
  loadEvents,
  addEvent,
  editEvent,
  deleteEvent,
  getEventColor
};
