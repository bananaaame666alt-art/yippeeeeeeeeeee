import React, { useRef, useState } from 'react';
import {
  Calendar,
  Plus,
  Download,
  Upload,
  MapPin,
  Clock,
  Users,
  Edit2,
  Trash2,
  Tag,
  Check,
  FileText,
  UserPlus,
} from 'lucide-react';
import { EventRecord, PersonRecord } from '../types';
import { generateEventIcs, generateAllEventsIcs, downloadIcsFile, parseIcsContent } from '../services/ical';
import { StorageService } from '../services/storage';

interface EventsViewProps {
  events: EventRecord[];
  people: PersonRecord[];
  onOpenNewEvent: () => void;
  onEditEvent: (event: EventRecord) => void;
  onSelectPerson: (person: PersonRecord) => void;
  onAddPersonToEvent: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  people,
  onOpenNewEvent,
  onEditEvent,
  onSelectPerson,
  onAddPersonToEvent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportSingle = (event: EventRecord) => {
    const attendees = people.filter((p) => p.eventId === event.id);
    const ics = generateEventIcs(event, attendees);
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    downloadIcsFile(ics, filename);
    showNotice(`Exported "${event.title}" to ${filename}`);
  };

  const handleExportAll = () => {
    if (events.length === 0) return;
    const ics = generateAllEventsIcs(events, people);
    downloadIcsFile(ics, 'afterhello-all-events.ics');
    showNotice(`Exported ${events.length} events to afterhello-all-events.ics`);
  };

  const handleImportIcs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsedEvents = parseIcsContent(content);
        if (parsedEvents.length === 0) {
          alert('Could not find any VEVENT entries in the uploaded .ics file.');
          return;
        }

        let importedCount = 0;
        for (const item of parsedEvents) {
          if (!item.title) continue;
          const newEvent: EventRecord = {
            id: 'evt-imported-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            title: item.title,
            date: item.date || new Date().toISOString().split('T')[0],
            endDate: item.endDate,
            time: item.time,
            location: item.location || 'TBD',
            venue: item.venue,
            category: item.category || 'conference',
            description: item.description || '',
            tags: item.tags || ['imported'],
            createdAt: new Date().toISOString(),
          };
          StorageService.saveEvent(newEvent);
          importedCount++;
        }

        showNotice(`Successfully imported ${importedCount} events from .ics!`);
      } catch (err: any) {
        alert('Error parsing .ics file: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteEvent = (event: EventRecord) => {
    const count = people.filter((p) => p.eventId === event.id).length;
    const confirmMsg = count > 0
      ? `Delete "${event.title}"? There are ${count} people linked to this event. (Their profiles will be kept).`
      : `Delete "${event.title}"?`;

    if (window.confirm(confirmMsg)) {
      StorageService.deleteEvent(event.id);
      showNotice(`Deleted "${event.title}"`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2B23] font-display">
            Events & Conferences
          </h1>
          <p className="text-xs text-[#5B635D] mt-0.5">
            Conferences, summits, and meetups where you connect with people
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics,text/calendar"
            onChange={handleImportIcs}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import .ics file from Apple Calendar, Google Calendar, or Outlook"
            className="px-3.5 py-2 bg-white border border-[#DDD5C7] text-[#1F2B23] hover:bg-[#F4EFEA] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#264E36]" />
            <span>Import .ics</span>
          </button>

          <button
            onClick={handleExportAll}
            title="Export all events as an .ics calendar file"
            className="px-3.5 py-2 bg-white border border-[#DDD5C7] text-[#1F2B23] hover:bg-[#F4EFEA] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#264E36]" />
            <span>Export All .ics</span>
          </button>

          <button
            onClick={onOpenNewEvent}
            className="px-4 py-2 bg-[#264E36] hover:bg-[#1E3F2B] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="p-3 bg-[#E9EFE9] border border-[#CDE0D2] rounded-xl text-xs text-[#264E36] font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#264E36] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#DDD5C7] space-y-3">
            <Calendar className="w-10 h-10 text-[#737C75] mx-auto opacity-40" />
            <h3 className="text-base font-semibold text-[#1F2B23]">No events yet</h3>
            <p className="text-xs text-[#5B635D] max-w-sm mx-auto">
              Add your first event or import an existing .ics calendar file.
            </p>
            <button
              onClick={onOpenNewEvent}
              className="px-4 py-2 bg-[#264E36] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1E3F2B]"
            >
              Add Event
            </button>
          </div>
        ) : (
          events.map((event) => {
            const attendees = people.filter((p) => p.eventId === event.id);

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-[#E8E2D8] p-5 sm:p-6 space-y-4 hover:border-[#264E36]/50 transition-all shadow-2xs"
              >
                {/* Event Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#264E36] bg-[#E9EFE9] px-2 py-0.5 rounded-md">
                        {event.category}
                      </span>
                      <span className="text-xs text-[#737C75] font-mono">
                        {event.date} {event.endDate ? `to ${event.endDate}` : ''}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#1F2B23] font-display mt-1">
                      {event.title}
                    </h2>

                    <div className="text-xs text-[#5B635D] flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#264E36]" />
                        <span>{event.location}</span>
                        {event.venue && <span className="text-[#737C75]">({event.venue})</span>}
                      </span>

                      {event.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#264E36]" />
                          <span>{event.time}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleExportSingle(event)}
                      title="Download .ics for Apple Calendar, Google Calendar, etc."
                      className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#DDD5C7] rounded-lg text-xs font-medium text-[#1F2B23] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#264E36]" />
                      <span>Export .ics</span>
                    </button>

                    <button
                      onClick={() => onEditEvent(event)}
                      title="Edit event details"
                      className="p-1.5 text-[#737C75] hover:text-[#1F2B23] hover:bg-[#F4EFEA] rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event)}
                      title="Delete event"
                      className="p-1.5 text-[#737C75] hover:text-[#B93815] hover:bg-[#FBECE7] rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Event Description */}
                {event.description && (
                  <p className="text-xs text-[#5B635D] leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#737C75]">
                    {event.tags.map((tag, idx) => (
                      <React.Fragment key={idx}>
                        <span>#{tag}</span>
                        {idx < event.tags.length - 1 && <span aria-hidden="true">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Attendees Met at this event */}
                <div className="pt-3 border-t border-[#F2ECE3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#264E36]" />
                    <span className="text-xs font-semibold text-[#1F2B23]">
                      People met here ({attendees.length}):
                    </span>
                  </div>

                  <button
                    onClick={() => onAddPersonToEvent(event.id)}
                    className="text-xs text-[#264E36] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Log someone met here</span>
                  </button>
                </div>

                {attendees.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                    {attendees.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => onSelectPerson(person)}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#264E36] transition-all cursor-pointer flex items-center gap-2.5 group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display shrink-0"
                          style={{ backgroundColor: person.avatarColor || '#264E36' }}
                        >
                          {person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1F2B23] font-display truncate group-hover:text-[#264E36] transition-colors">
                            {person.name}
                          </p>
                          <p className="text-[11px] text-[#737C75] truncate">
                            {person.headline || person.company || 'Attendee'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#737C75] italic">
                    No contacts recorded yet for this event.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
