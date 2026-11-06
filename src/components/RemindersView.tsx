import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Send,
  RotateCcw,
  User,
  Coffee,
  HeartHandshake,
} from 'lucide-react';
import { PersonRecord, FollowUpStatus } from '../types';
import { StorageService } from '../services/storage';

interface RemindersViewProps {
  people: PersonRecord[];
  onSelectPerson: (person: PersonRecord) => void;
  onDraftEmail: (person: PersonRecord) => void;
  onOpenNewPerson: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  people,
  onSelectPerson,
  onDraftEmail,
  onOpenNewPerson,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'due_soon' | 'completed'>('all');
  const today = new Date().toISOString().split('T')[0];

  // Helper date math
  const getDiffDays = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
  };

  const overdueList = people.filter(
    (p) => p.followUpStatus !== 'completed' && p.followUpDueDate && p.followUpDueDate < today
  );

  const dueSoonList = people.filter((p) => {
    if (p.followUpStatus === 'completed' || !p.followUpDueDate) return false;
    const diff = getDiffDays(p.followUpDueDate);
    return diff >= 0 && diff <= 5;
  });

  const upcomingList = people.filter((p) => {
    if (p.followUpStatus === 'completed' || !p.followUpDueDate) return false;
    const diff = getDiffDays(p.followUpDueDate);
    return diff > 5;
  });

  const completedList = people.filter((p) => p.followUpStatus === 'completed');

  const handleSnooze = (e: React.MouseEvent, person: PersonRecord, days: number) => {
    e.stopPropagation();
    const newDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const updated: PersonRecord = {
      ...person,
      followUpDueDate: newDueDate,
      interactionHistory: [
        {
          id: 'int-' + Date.now(),
          date: today,
          type: 'Rescheduled',
          summary: `Follow-up postponed by ${days} days (new target: ${newDueDate}).`,
        },
        ...person.interactionHistory,
      ],
    };
    StorageService.savePerson(updated);
  };

  const handleMarkComplete = (e: React.MouseEvent, person: PersonRecord) => {
    e.stopPropagation();
    const updated: PersonRecord = {
      ...person,
      followUpStatus: 'completed',
      interactionHistory: [
        {
          id: 'int-' + Date.now(),
          date: today,
          type: 'Completed',
          summary: 'Follow-up marked as completed.',
        },
        ...person.interactionHistory,
      ],
    };
    StorageService.savePerson(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2B23] font-display">
            Follow-up Reminders
          </h1>
          <p className="text-xs text-[#5B635D] mt-0.5">
            Never let a warm conversation go cold · Timely follow-ups organized by urgency
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E8E2D8] text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            All Active ({overdueList.length + dueSoonList.length + upcomingList.length})
          </button>
          <button
            onClick={() => setActiveFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeFilter === 'overdue'
                ? 'bg-[#B93815] text-white shadow-xs font-semibold'
                : 'text-[#B93815] hover:bg-[#FBECE7]'
            }`}
          >
            Overdue ({overdueList.length})
          </button>
          <button
            onClick={() => setActiveFilter('due_soon')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeFilter === 'due_soon'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            Due Soon ({dueSoonList.length})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeFilter === 'completed'
                ? 'bg-[#264E36] text-white shadow-xs font-semibold'
                : 'text-[#5B635D] hover:bg-[#F4EFEA]'
            }`}
          >
            Completed ({completedList.length})
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* 1. Overdue Section */}
        {(activeFilter === 'all' || activeFilter === 'overdue') && overdueList.length > 0 && (
          <div className="bg-[#FFF9F7] rounded-3xl border border-[#F2D1C8] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#B93815]" />
              <h2 className="text-base font-bold text-[#B93815] font-display">
                Overdue Follow-ups ({overdueList.length})
              </h2>
            </div>

            <div className="space-y-3">
              {overdueList.map((person) => {
                const diff = Math.abs(getDiffDays(person.followUpDueDate!));
                return (
                  <div
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    className="p-4 rounded-2xl bg-white border border-[#F2D1C8] hover:border-[#B93815] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display shrink-0 mt-0.5"
                        style={{ backgroundColor: person.avatarColor || '#264E36' }}
                      >
                        {person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1F2B23] font-display">
                            {person.name}
                          </h3>
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#FBECE7] text-[#B93815]">
                            {diff === 0 ? 'Due today' : `${diff} ${diff === 1 ? 'day' : 'days'} overdue`}
                          </span>
                        </div>

                        <p className="text-xs text-[#5B635D]">
                          {person.headline ? `${person.headline} · ` : ''}
                          {person.company || ''}
                        </p>

                        {person.notes && (
                          <p className="text-xs text-[#737C75] line-clamp-1 mt-1 italic">
                            "{person.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => handleSnooze(e, person, 3)}
                        title="Snooze 3 days"
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] text-xs font-medium text-[#5B635D] hover:bg-[#FAF8F5] transition-colors"
                      >
                        +3d
                      </button>

                      <button
                        onClick={(e) => handleMarkComplete(e, person)}
                        title="Mark Done"
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] text-xs font-medium text-[#5B635D] hover:bg-[#FAF8F5] transition-colors"
                      >
                        Done
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDraftEmail(person);
                        }}
                        className="px-3.5 py-1.5 bg-[#264E36] hover:bg-[#1E3F2B] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#CDE0D2]" />
                        <span>Draft Email</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Due Soon Section */}
        {(activeFilter === 'all' || activeFilter === 'due_soon') && dueSoonList.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E8E2D8] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#264E36]" />
              <h2 className="text-base font-bold text-[#1F2B23] font-display">
                Due Today & This Week ({dueSoonList.length})
              </h2>
            </div>

            <div className="space-y-3">
              {dueSoonList.map((person) => {
                const diff = getDiffDays(person.followUpDueDate!);
                const isToday = diff === 0;

                return (
                  <div
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#264E36] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display shrink-0 mt-0.5"
                        style={{ backgroundColor: person.avatarColor || '#264E36' }}
                      >
                        {person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1F2B23] font-display">
                            {person.name}
                          </h3>
                          <span
                            className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${
                              isToday
                                ? 'bg-[#FEF6EE] text-[#B54708]'
                                : 'bg-[#E9EFE9] text-[#264E36]'
                            }`}
                          >
                            {isToday ? 'Due Today' : `In ${diff} days (${person.followUpDueDate})`}
                          </span>
                        </div>

                        <p className="text-xs text-[#5B635D]">
                          {person.headline ? `${person.headline} · ` : ''}
                          {person.company || ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => handleSnooze(e, person, 7)}
                        title="Snooze 1 week"
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] text-xs font-medium text-[#5B635D] hover:bg-white transition-colors"
                      >
                        +1w
                      </button>

                      <button
                        onClick={(e) => handleMarkComplete(e, person)}
                        title="Mark Done"
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDD5C7] text-xs font-medium text-[#5B635D] hover:bg-white transition-colors"
                      >
                        Done
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDraftEmail(person);
                        }}
                        className="px-3.5 py-1.5 bg-[#264E36] hover:bg-[#1E3F2B] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#CDE0D2]" />
                        <span>Draft Email</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Later Upcoming Section */}
        {activeFilter === 'all' && upcomingList.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E8E2D8] p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-[#1F2B23] font-display">
              Later Scheduled Follow-ups ({upcomingList.length})
            </h2>

            <div className="space-y-2.5">
              {upcomingList.map((person) => (
                <div
                  key={person.id}
                  onClick={() => onSelectPerson(person)}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#264E36] transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[#1F2B23] font-display text-sm">
                      {person.name}
                    </span>
                    <span className="text-[#737C75]">· {person.company || 'Contact'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#5B635D]">
                      Target: {person.followUpDueDate}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDraftEmail(person);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#DDD5C7] rounded-lg text-xs font-medium text-[#264E36] hover:bg-[#FAF8F5]"
                    >
                      Draft Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Completed Section */}
        {(activeFilter === 'all' || activeFilter === 'completed') && completedList.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E8E2D8] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#264E36]" />
              <h2 className="text-base font-bold text-[#1F2B23] font-display">
                Completed Touchpoints ({completedList.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {completedList.map((person) => (
                <div
                  key={person.id}
                  onClick={() => onSelectPerson(person)}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#264E36] transition-all cursor-pointer flex items-center justify-between gap-3 text-xs opacity-85 hover:opacity-100"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#264E36]" />
                    <span className="font-bold text-[#1F2B23] font-display text-sm">
                      {person.name}
                    </span>
                    <span className="text-[#737C75]">· {person.company || ''}</span>
                  </div>

                  <span className="text-[11px] text-[#737C75] font-mono">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* When Empty */}
        {overdueList.length === 0 && dueSoonList.length === 0 && upcomingList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#DDD5C7] space-y-3">
            <CheckCircle className="w-10 h-10 text-[#264E36] mx-auto opacity-70" />
            <h3 className="text-base font-semibold text-[#1F2B23]">All caught up on follow-ups!</h3>
            <p className="text-xs text-[#5B635D] max-w-sm mx-auto">
              You have no pending follow-up reminders. When you meet people at events, set a follow-up due date to keep track.
            </p>
            <button
              onClick={onOpenNewPerson}
              className="px-4 py-2 bg-[#264E36] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1E3F2B]"
            >
              Add Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
