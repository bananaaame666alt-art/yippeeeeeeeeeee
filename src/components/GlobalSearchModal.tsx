import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { PersonRecord, EventRecord } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonRecord[];
  events: EventRecord[];
  onSelectPerson: (person: PersonRecord) => void;
  onSelectEvent: (eventId: string) => void;
  onDraftEmail: (person: PersonRecord) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  people,
  events,
  onSelectPerson,
  onSelectEvent,
  onDraftEmail,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingPeople = q
    ? people.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.company && p.company.toLowerCase().includes(q)) ||
          (p.headline && p.headline.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          (p.topics && p.topics.some((t) => t.toLowerCase().includes(q))) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }).slice(0, 5)
    : [];

  const matchingEvents = q
    ? events.filter((e) => {
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.venue && e.venue.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#E8E2D8] shadow-2xl overflow-hidden mt-12 sm:mt-16 animate-scale-up">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E8E2D8] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#737C75] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, notes, conversation topics, events..."
            className="w-full bg-transparent text-sm text-[#1F2B23] placeholder:text-[#8D968F] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#737C75] hover:text-[#1F2B23]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#FAF8F5] border border-[#DDD5C7] rounded text-[#808982]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {!query ? (
            <div className="p-6 text-center text-xs text-[#737C75]">
              Type to search across all people profiles, detailed conversation notes, and attended events.
            </div>
          ) : matchingPeople.length === 0 && matchingEvents.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#737C75]">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* People Results */}
              {matchingPeople.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737C75] px-3">
                    People Met
                  </span>
                  {matchingPeople.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPerson(p);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display"
                          style={{ backgroundColor: p.avatarColor || '#264E36' }}
                        >
                          {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1F2B23] font-display group-hover:text-[#264E36]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-[#5B635D]">
                            {p.headline || p.company || 'Attendee'}
                            {p.eventName ? ` · ${p.eventName}` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDraftEmail(p);
                          onClose();
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-medium text-[#264E36] hover:bg-[#E9EFE9] flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Draft</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Event Results */}
              {matchingEvents.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#F2ECE3]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737C75] px-3">
                    Events
                  </span>
                  {matchingEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => {
                        onSelectEvent(ev.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E9EFE9] text-[#264E36] flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1F2B23] font-display group-hover:text-[#264E36]">
                            {ev.title}
                          </p>
                          <p className="text-[11px] text-[#737C75] font-mono">
                            {ev.date} · {ev.location}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C4BCB0] group-hover:text-[#264E36] transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
