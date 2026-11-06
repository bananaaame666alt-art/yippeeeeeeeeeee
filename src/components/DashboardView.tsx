import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  Download,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Mail,
  ChevronRight,
  Coffee,
} from 'lucide-react';
import { PersonRecord, EventRecord, FollowUpSummary } from '../types';
import { generateEventIcs, downloadIcsFile } from '../services/ical';

interface DashboardViewProps {
  people: PersonRecord[];
  events: EventRecord[];
  summary: FollowUpSummary;
  onOpenNewPerson: () => void;
  onOpenNewEvent: () => void;
  onSelectPerson: (person: PersonRecord) => void;
  onDraftEmail: (person: PersonRecord) => void;
  onNavigateTab: (tab: 'dashboard' | 'people' | 'events' | 'reminders') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  people,
  events,
  summary,
  onOpenNewPerson,
  onOpenNewEvent,
  onSelectPerson,
  onDraftEmail,
  onNavigateTab,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // People needing follow up (overdue or due soon)
  const urgentFollowUps = people
    .filter((p) => p.followUpStatus !== 'completed' && p.followUpDueDate)
    .sort((a, b) => (a.followUpDueDate || '').localeCompare(b.followUpDueDate || ''))
    .slice(0, 4);

  // Recent 3 events
  const recentEvents = [...events]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  // Recent 4 people added
  const recentPeople = [...people]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 4);

  const handleExportEventIcs = (e: React.MouseEvent, ev: EventRecord) => {
    e.stopPropagation();
    const attendees = people.filter((p) => p.eventId === ev.id);
    const ics = generateEventIcs(ev, attendees);
    downloadIcsFile(ics, `${ev.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-br from-[#264E36] to-[#1E3F2B] rounded-3xl p-6 sm:p-8 text-[#FAF8F5] shadow-sm relative overflow-hidden">
        {/* Subtle decorative ring pattern */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium text-[#CDE0D2]">
            <Sparkles className="w-3.5 h-3.5 text-[#A3C7AD]" />
            <span>Turn Event Hellos into Meaningful Relationships</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Keep your network warm after every event.
          </h1>

          <p className="text-sm text-[#DFEBE2] leading-relaxed">
            Record what you talked about, never miss a follow-up, and draft warm, personalized emails with Gemini in seconds.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewPerson}
              className="px-4 py-2.5 bg-[#FAF8F5] text-[#1F2B23] hover:bg-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#264E36]" />
              <span>Log Person Met</span>
            </button>

            <button
              onClick={onOpenNewEvent}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Metric Strip (Tabular Numerals) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigateTab('people')}
          className="bg-white rounded-2xl p-5 border border-[#E8E2D8] hover:border-[#264E36]/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#5B635D]">
            <span>Total Contacts</span>
            <Users className="w-4 h-4 text-[#264E36] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1F2B23] font-display tabular-nums">
              {summary.totalPeople}
            </span>
            <span className="text-xs text-[#737C75]">people met</span>
          </div>
        </div>

        {/* Metric 2: Overdue */}
        <div
          onClick={() => onNavigateTab('reminders')}
          className={`rounded-2xl p-5 border transition-colors cursor-pointer group ${
            summary.overdueCount > 0
              ? 'bg-[#FDF6F4] border-[#F2D1C8]'
              : 'bg-white border-[#E8E2D8]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#5B635D]">
            <span>Overdue Follow-ups</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                summary.overdueCount > 0 ? 'text-[#B93815]' : 'text-[#737C75]'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-display tabular-nums ${
                summary.overdueCount > 0 ? 'text-[#B93815]' : 'text-[#1F2B23]'
              }`}
            >
              {summary.overdueCount}
            </span>
            <span className="text-xs text-[#737C75]">need attention</span>
          </div>
        </div>

        {/* Metric 3: Due Soon */}
        <div
          onClick={() => onNavigateTab('reminders')}
          className="bg-white rounded-2xl p-5 border border-[#E8E2D8] hover:border-[#264E36]/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#5B635D]">
            <span>Due This Week</span>
            <Clock className="w-4 h-4 text-[#264E36] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1F2B23] font-display tabular-nums">
              {summary.dueSoonCount}
            </span>
            <span className="text-xs text-[#737C75]">upcoming</span>
          </div>
        </div>

        {/* Metric 4: Events */}
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-white rounded-2xl p-5 border border-[#E8E2D8] hover:border-[#264E36]/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#5B635D]">
            <span>Events Logged</span>
            <Calendar className="w-4 h-4 text-[#264E36] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1F2B23] font-display tabular-nums">
              {summary.totalEvents}
            </span>
            <span className="text-xs text-[#737C75]">conferences & meetups</span>
          </div>
        </div>
      </section>

      {/* Urgent Follow-up Priority Queue */}
      <section className="bg-white rounded-3xl p-6 border border-[#E8E2D8] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1F2B23] font-display">
              Follow-up Priority Queue
            </h2>
            <p className="text-xs text-[#5B635D]">
              People you promised to reconnect with or who are due for an email
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('reminders')}
            className="text-xs font-semibold text-[#264E36] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentFollowUps.length === 0 ? (
          <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD5C7]">
            <CheckCircle className="w-8 h-8 text-[#264E36] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1F2B23]">All caught up!</p>
            <p className="text-xs text-[#5B635D] max-w-sm mx-auto mt-1">
              No overdue follow-ups right now. Add a new connection from your latest event to stay top of mind.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentFollowUps.map((p) => {
              const isOverdue = p.followUpDueDate && p.followUpDueDate < today;
              const isToday = p.followUpDueDate === today;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isOverdue
                      ? 'bg-[#FFF9F7] border-[#F2D1C8] hover:border-[#B93815]'
                      : 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-[#264E36]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display shrink-0"
                        style={{ backgroundColor: p.avatarColor || '#264E36' }}
                      >
                        {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1F2B23] font-display">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[#5B635D] truncate max-w-[180px]">
                          {p.headline || p.company || 'New Connection'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-medium shrink-0 ${
                        isOverdue
                          ? 'bg-[#FBECE7] text-[#B93815]'
                          : isToday
                          ? 'bg-[#FEF6EE] text-[#B54708]'
                          : 'bg-[#E9EFE9] text-[#264E36]'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : isToday ? 'Due Today' : `Due ${p.followUpDueDate}`}
                    </span>
                  </div>

                  {p.notes && (
                    <p className="text-xs text-[#5B635D] line-clamp-2 italic">
                      "{p.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8]/60 text-xs">
                    <span className="text-[#737C75]">
                      {p.eventName ? `Met at ${p.eventName}` : `Met on ${p.meetingDate}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDraftEmail(p);
                      }}
                      className="px-2.5 py-1 bg-[#264E36] hover:bg-[#1E3F2B] text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#CDE0D2]" />
                      <span>Draft Email</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2-Column Split: Recent Events & Recent Contacts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Recent Events Column */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1F2B23] font-display">
                  Recent Events
                </h2>
                <p className="text-xs text-[#5B635D]">
                  Conferences, breakfasts & meetups you attended
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs font-semibold text-[#264E36] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All Events</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentEvents.map((ev) => {
                const attendees = people.filter((p) => p.eventId === ev.id);
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#264E36]/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#1F2B23] font-display">
                          {ev.title}
                        </h3>
                        <div className="text-xs text-[#5B635D] flex items-center gap-2 mt-0.5 font-mono">
                          <span>{ev.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ev.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleExportEventIcs(e, ev)}
                        title="Download .ics for Apple/Google Calendar"
                        className="p-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[#5B635D] hover:text-[#1F2B23] hover:border-[#264E36] transition-colors shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E2D8]/60">
                      <span className="text-[#5B635D]">
                        <strong>{attendees.length}</strong> {attendees.length === 1 ? 'person' : 'people'} met
                      </span>
                      {attendees.length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {attendees.slice(0, 4).map((att) => (
                            <div
                              key={att.id}
                              title={att.name}
                              className="w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] text-white font-bold"
                              style={{ backgroundColor: att.avatarColor || '#264E36' }}
                            >
                              {att.name[0]}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onOpenNewEvent}
            className="w-full py-2.5 rounded-xl border border-dashed border-[#DDD5C7] text-xs font-semibold text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Event</span>
          </button>
        </div>

        {/* Recent Connections Column */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1F2B23] font-display">
                  Recent Connections
                </h2>
                <p className="text-xs text-[#5B635D]">
                  Latest contacts added to AfterHello
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('people')}
                className="text-xs font-semibold text-[#264E36] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentPeople.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#264E36]/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display shrink-0"
                      style={{ backgroundColor: p.avatarColor || '#264E36' }}
                    >
                      {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1F2B23] font-display group-hover:text-[#264E36] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#5B635D] truncate max-w-[200px]">
                        {p.headline || p.company || 'Attendee'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDraftEmail(p);
                      }}
                      title="Draft follow-up"
                      className="p-2 rounded-lg bg-white border border-[#DDD5C7] text-[#5B635D] hover:text-[#264E36] hover:border-[#264E36] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenNewPerson}
            className="w-full py-2.5 rounded-xl border border-dashed border-[#DDD5C7] text-xs font-semibold text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Person</span>
          </button>
        </div>
      </section>
    </div>
  );
};
