import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Star,
  Sparkles,
  Calendar,
  Mail,
  ChevronDown,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import { PersonRecord, EventRecord, FollowUpStatus } from '../types';
import { StorageService } from '../services/storage';

interface PeopleViewProps {
  people: PersonRecord[];
  events: EventRecord[];
  onSelectPerson: (person: PersonRecord) => void;
  onEditPerson: (person: PersonRecord) => void;
  onDraftEmail: (person: PersonRecord) => void;
  onOpenNewPerson: () => void;
  initialFilter?: string;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  events,
  onSelectPerson,
  onEditPerson,
  onDraftEmail,
  onOpenNewPerson,
  initialFilter = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'dueDate'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const today = new Date().toISOString().split('T')[0];

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesHeadline = (p.headline || '').toLowerCase().includes(q);
        const matchesCompany = (p.company || '').toLowerCase().includes(q);
        const matchesNotes = (p.notes || '').toLowerCase().includes(q);
        const matchesTopics = (p.topics || []).some((t) => t.toLowerCase().includes(q));
        const matchesTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesHeadline && !matchesCompany && !matchesNotes && !matchesTopics && !matchesTags) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'overdue') {
        if (p.followUpStatus === 'completed' || !p.followUpDueDate || p.followUpDueDate >= today) {
          return false;
        }
      } else if (statusFilter === 'due_soon') {
        if (p.followUpStatus === 'completed' || !p.followUpDueDate) return false;
        const diff = Math.ceil((new Date(p.followUpDueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0 || diff > 5) return false;
      } else if (statusFilter === 'starred') {
        if (!p.starred) return false;
      } else if (statusFilter === 'completed') {
        if (p.followUpStatus !== 'completed') return false;
      } else if (statusFilter === 'active') {
        if (p.followUpStatus === 'completed' || p.followUpStatus === 'none') return false;
      }

      // Event filter
      if (selectedEventId !== 'all') {
        if (p.eventId !== selectedEventId) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'dueDate') {
        const dateA = a.followUpDueDate || '9999-99-99';
        const dateB = b.followUpDueDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      }
      // 'recent'
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [people, searchQuery, statusFilter, selectedEventId, sortBy, today]);

  const handleToggleStar = (e: React.MouseEvent, p: PersonRecord) => {
    e.stopPropagation();
    StorageService.savePerson({
      ...p,
      starred: !p.starred,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2B23] font-display">
            People Met
          </h1>
          <p className="text-xs text-[#5B635D] mt-0.5">
            {filteredPeople.length} {filteredPeople.length === 1 ? 'contact' : 'contacts'} · Search by name, company, notes, or conversation topics
          </p>
        </div>

        <button
          onClick={onOpenNewPerson}
          className="px-4 py-2.5 bg-[#264E36] hover:bg-[#1E3F2B] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Connection</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E2D8] space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Live Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737C75] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, company, notes, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl pl-9.5 pr-4 py-2 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36] focus:border-transparent transition-all placeholder:text-[#8D968F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-[#737C75] hover:text-[#1F2B23]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Event Filter dropdown */}
          <div className="relative shrink-0 sm:w-48">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3 py-2 text-xs text-[#1F2B23] font-medium appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#264E36]"
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#737C75] absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Sort By dropdown */}
          <div className="relative shrink-0 sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3 py-2 text-xs text-[#1F2B23] font-medium appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#264E36]"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
              <option value="dueDate">Follow-up Date</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#737C75] absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-[#F4EFEA] rounded-xl border border-[#E3DCD2] shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#264E36] shadow-xs' : 'text-[#737C75] hover:text-[#1F2B23]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#264E36] shadow-xs' : 'text-[#737C75] hover:text-[#1F2B23]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F2ECE3]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            All ({people.length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-[#B93815] text-white shadow-xs font-semibold'
                : 'text-[#B93815] hover:bg-[#FBECE7]'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'due_soon'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            Due This Week
          </button>
          <button
            onClick={() => setStatusFilter('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'starred'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            Starred
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Contacts List / Grid */}
      {filteredPeople.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#DDD5C7] space-y-3">
          <UserCheck className="w-10 h-10 text-[#737C75] mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-[#1F2B23]">No contacts found</h3>
          <p className="text-xs text-[#5B635D] max-w-sm mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}". Try a different keyword or reset filters.`
              : 'Start logging the great people you meet at conferences and meetups.'}
          </p>
          <button
            onClick={onOpenNewPerson}
            className="px-4 py-2 bg-[#264E36] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1E3F2B] transition-colors cursor-pointer"
          >
            Add Connection
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => {
            const isOverdue =
              person.followUpDueDate &&
              person.followUpDueDate < today &&
              person.followUpStatus !== 'completed';
            const isDueToday =
              person.followUpDueDate === today && person.followUpStatus !== 'completed';

            return (
              <div
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className="bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#264E36]/60 p-5 space-y-4 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-xs"
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold font-display shadow-xs shrink-0"
                        style={{ backgroundColor: person.avatarColor || '#264E36' }}
                      >
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1F2B23] font-display group-hover:text-[#264E36] transition-colors">
                          {person.name}
                        </h3>
                        <p className="text-xs font-medium text-[#3E4A41] truncate max-w-[170px]">
                          {person.headline || 'Attendee'}
                        </p>
                        {person.company && (
                          <p className="text-[11px] text-[#737C75] truncate max-w-[170px]">
                            {person.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(e, person)}
                      className="p-1 text-[#C4BCB0] hover:text-[#D97706] transition-colors focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          person.starred ? 'fill-[#D97706] text-[#D97706]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Meeting Context & Event Link */}
                  <div className="mt-3 text-xs text-[#5B635D] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#264E36] shrink-0" />
                    <span className="truncate">
                      {person.eventName ? person.eventName : `Met ${person.meetingDate}`}
                    </span>
                  </div>

                  {/* Conversation Topics - Clean Unboxed Discipline */}
                  {person.topics && person.topics.length > 0 && (
                    <div className="mt-2 text-xs text-[#5B635D] line-clamp-1">
                      <span>Topics: </span>
                      {person.topics.map((t, idx) => (
                        <React.Fragment key={idx}>
                          <span className="text-[#1F2B23] font-medium">{t}</span>
                          {idx < person.topics.length - 1 && (
                            <span aria-hidden="true" className="text-[#C4BCB0] mx-1">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Notes snippet */}
                  {person.notes && (
                    <p className="mt-2 text-xs text-[#5B635D] line-clamp-2 italic leading-relaxed">
                      "{person.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom card footer */}
                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-xs">
                  <div>
                    {person.followUpDueDate ? (
                      <span
                        className={`font-mono text-[11px] font-medium ${
                          isOverdue
                            ? 'text-[#B93815]'
                            : isDueToday
                            ? 'text-[#B54708]'
                            : 'text-[#5B635D]'
                        }`}
                      >
                        {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today: ' : 'Target: '}
                        {person.followUpDueDate}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#737C75]">
                        {person.followUpStatus === 'completed' ? 'Completed' : 'No follow-up set'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPerson(person);
                      }}
                      title="Edit person"
                      className="p-1.5 rounded-lg text-[#737C75] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDraftEmail(person);
                      }}
                      className="px-2.5 py-1.5 bg-[#264E36] hover:bg-[#1E3F2B] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#CDE0D2]" />
                      <span>Draft Email</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#5B635D] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Event Met</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE3]">
                {filteredPeople.map((person) => {
                  const isOverdue =
                    person.followUpDueDate &&
                    person.followUpDueDate < today &&
                    person.followUpStatus !== 'completed';

                  return (
                    <tr
                      key={person.id}
                      onClick={() => onSelectPerson(person)}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(e, person)}
                            className="text-[#C4BCB0] hover:text-[#D97706]"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                person.starred ? 'fill-[#D97706] text-[#D97706]' : ''
                              }`}
                            />
                          </button>
                          <span className="font-bold text-[#1F2B23] font-display text-sm">
                            {person.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#5B635D]">
                        <span className="font-medium text-[#1F2B23]">{person.company || '—'}</span>
                        {person.headline && (
                          <span className="block text-[11px] text-[#737C75] truncate max-w-xs">
                            {person.headline}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[#5B635D]">
                        <span>{person.eventName || '—'}</span>
                        <span className="block text-[11px] text-[#737C75] font-mono">
                          {person.meetingDate}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {person.followUpDueDate ? (
                          <span
                            className={`font-mono text-xs font-semibold ${
                              isOverdue ? 'text-[#B93815]' : 'text-[#264E36]'
                            }`}
                          >
                            {person.followUpDueDate}
                          </span>
                        ) : (
                          <span className="text-[#737C75]">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDraftEmail(person);
                          }}
                          className="px-2.5 py-1 bg-[#264E36] text-white rounded-lg text-xs font-medium hover:bg-[#1E3F2B] transition-colors"
                        >
                          Draft
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
