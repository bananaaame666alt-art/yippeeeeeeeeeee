import { EventRecord, PersonRecord } from '../types';

/**
 * Format a date string (YYYY-MM-DD or ISO) into iCalendar DTSTART / DTEND format (YYYYMMDD or YYYYMMDDTHHMMSSZ).
 */
function formatDateToIcs(dateStr: string, timeStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // If time is provided, e.g. "09:00"
  if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(':').map((s) => s.padStart(2, '0'));
    const cleanDate = dateStr.replace(/-/g, '');
    return `${cleanDate}T${hours}${minutes}00`;
  }

  // Full day event
  const cleanDate = dateStr.replace(/-/g, '');
  return cleanDate;
}

/**
 * Escapes characters for iCalendar text values (commas, semicolons, backslashes, newlines).
 */
function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Exports a single event to standard RFC 5545 iCalendar (.ics) format.
 */
export function generateEventIcs(event: EventRecord, attendees: PersonRecord[] = []): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtStart = formatDateToIcs(event.date, event.time);
  const dtEnd = formatDateToIcs(event.endDate || event.date, event.time ? '17:00' : undefined);

  const attendeeLines = attendees.length > 0
    ? `\nPeople met at this event:\n` +
      attendees.map((p) => `• ${p.name} (${p.headline || 'Attendee'}${p.company ? ' at ' + p.company : ''}) - ${p.email || 'No email'}`).join('\n')
    : '';

  const fullDescription = escapeIcsText(
    (event.description ? `${event.description}\n\n` : '') +
    (attendeeLines ? `${attendeeLines}\n\n` : '') +
    `Saved with AfterHello (Browser-stored Event Follow-up CRM)`
  );

  const isAllDay = !event.time;
  const startLine = isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`;
  const endLine = isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AfterHello//Event Follow-up CRM//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:afterhello-${event.id}@afterhello.app`,
    `DTSTAMP:${dtStamp}`,
    startLine,
    endLine,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location + (event.venue ? ` (${event.venue})` : ''))}`,
    `DESCRIPTION:${fullDescription}`,
    `CATEGORIES:${escapeIcsText(event.category.toUpperCase())}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Exports multiple events to a consolidated .ics file.
 */
export function generateAllEventsIcs(events: EventRecord[], allPeople: PersonRecord[] = []): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const vEvents = events.map((event) => {
    const attendees = allPeople.filter((p) => p.eventId === event.id);
    const dtStart = formatDateToIcs(event.date, event.time);
    const dtEnd = formatDateToIcs(event.endDate || event.date, event.time ? '17:00' : undefined);

    const attendeeLines = attendees.length > 0
      ? `\nPeople met:\n` + attendees.map((p) => `• ${p.name} (${p.headline || ''} - ${p.company || ''})`).join('\n')
      : '';

    const fullDescription = escapeIcsText(
      (event.description ? `${event.description}\n` : '') +
      attendeeLines +
      `\nSaved with AfterHello`
    );

    const isAllDay = !event.time;
    const startLine = isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`;
    const endLine = isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`;

    return [
      'BEGIN:VEVENT',
      `UID:afterhello-${event.id}@afterhello.app`,
      `DTSTAMP:${dtStamp}`,
      startLine,
      endLine,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `LOCATION:${escapeIcsText(event.location + (event.venue ? ` (${event.venue})` : ''))}`,
      `DESCRIPTION:${fullDescription}`,
      `CATEGORIES:${escapeIcsText(event.category.toUpperCase())}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AfterHello//Event Follow-up CRM//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vEvents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Initiates a browser download of the .ics file.
 */
export function downloadIcsFile(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Simple parser to extract events from an uploaded .ics file.
 */
export function parseIcsContent(icsText: string): Array<Partial<EventRecord>> {
  const events: Array<Partial<EventRecord>> = [];
  const lines = icsText.split(/\r\n|\n|\r/);

  // Unfold folded lines (lines starting with space or tab)
  const unfoldedLines: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfoldedLines.length > 0) {
      unfoldedLines[unfoldedLines.length - 1] += line.slice(1);
    } else {
      unfoldedLines.push(line);
    }
  }

  let inEvent = false;
  let currentEvent: Partial<EventRecord> = {};

  for (const rawLine of unfoldedLines) {
    const line = rawLine.trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {
        tags: ['imported'],
        category: 'conference',
      };
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && currentEvent.title) {
        if (!currentEvent.date) {
          currentEvent.date = new Date().toISOString().split('T')[0];
        }
        if (!currentEvent.location) {
          currentEvent.location = 'TBD';
        }
        if (!currentEvent.description) {
          currentEvent.description = '';
        }
        events.push(currentEvent);
      }
      inEvent = false;
      currentEvent = {};
      continue;
    }

    if (!inEvent) continue;

    // Parse KEY;PARAMS:VALUE or KEY:VALUE
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const keyPart = line.slice(0, colonIndex).toUpperCase();
    const value = line.slice(colonIndex + 1);

    // Unescape text
    const cleanValue = value
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
      .trim();

    if (keyPart.startsWith('SUMMARY')) {
      currentEvent.title = cleanValue || 'Untitled Event';
    } else if (keyPart.startsWith('LOCATION')) {
      currentEvent.location = cleanValue;
    } else if (keyPart.startsWith('DESCRIPTION')) {
      currentEvent.description = cleanValue;
    } else if (keyPart.startsWith('DTSTART')) {
      // Formats: 20261105, 20261105T140000Z, 20261105T140000
      const match = cleanValue.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
      if (match) {
        const [, year, month, day, hour, min] = match;
        currentEvent.date = `${year}-${month}-${day}`;
        if (hour && min) {
          currentEvent.time = `${hour}:${min}`;
        }
      }
    } else if (keyPart.startsWith('DTEND')) {
      const match = cleanValue.match(/(\d{4})(\d{2})(\d{2})/);
      if (match) {
        const [, year, month, day] = match;
        currentEvent.endDate = `${year}-${month}-${day}`;
      }
    } else if (keyPart.startsWith('CATEGORIES')) {
      const cats = cleanValue.toLowerCase();
      if (cats.includes('meetup')) currentEvent.category = 'meetup';
      else if (cats.includes('coffee')) currentEvent.category = 'coffee';
      else if (cats.includes('dinner')) currentEvent.category = 'dinner';
      else if (cats.includes('workshop')) currentEvent.category = 'workshop';
      else if (cats.includes('summit')) currentEvent.category = 'summit';
      else currentEvent.category = 'conference';
    }
  }

  return events;
}
