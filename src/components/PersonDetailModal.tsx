import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Coffee,
  MessageSquare,
} from 'lucide-react';
import { PersonRecord, EventRecord } from '../types';
import { StorageService } from '../services/storage';

interface PersonDetailModalProps {
  person: PersonRecord | null;
  events: EventRecord[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (person: PersonRecord) => void;
  onDraftEmail: (person: PersonRecord) => void;
  onViewEvent?: (eventId: string) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  events,
  isOpen,
  onClose,
  onEdit,
  onDraftEmail,
  onViewEvent,
}) => {
  const [newLogType, setNewLogType] = useState('Call / Coffee Chat');
  const [newLogSummary, setNewLogSummary] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);

  if (!isOpen || !person) return null;

  const linkedEvent = person.eventId ? events.find((e) => e.id === person.eventId) : undefined;
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = person.followUpDueDate && person.followUpDueDate < today && person.followUpStatus !== 'completed';
  const isDueToday = person.followUpDueDate === today && person.followUpStatus !== 'completed';

  const handleToggleStar = () => {
    const updated = { ...person, starred: !person.starred };
    StorageService.savePerson(updated);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogSummary.trim()) return;

    const newLog = {
      id: 'int-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: newLogType,
      summary: newLogSummary.trim(),
    };

    const updated = {
      ...person,
      interactionHistory: [newLog, ...person.interactionHistory],
    };
    StorageService.savePerson(updated);
    setNewLogSummary('');
    setIsAddingLog(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${person.name} from your connections?`)) {
      StorageService.deletePerson(person.id);
      onClose();
    }
  };

  const handleMarkCompleted = () => {
    const updated = {
      ...person,
      followUpStatus: 'completed' as const,
      interactionHistory: [
        {
          id: 'int-' + Date.now(),
          date: today,
          type: 'Marked Completed',
          summary: 'Follow-up cycle completed.',
        },
        ...person.interactionHistory,
      ],
    };
    StorageService.savePerson(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-up">
        {/* Header with profile hero */}
        <div className="p-6 bg-white border-b border-[#E8E2D8] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-display shadow-xs shrink-0"
              style={{ backgroundColor: person.avatarColor || '#264E36' }}
            >
              {person.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1F2B23] font-display">
                  {person.name}
                </h2>
                <button
                  type="button"
                  onClick={handleToggleStar}
                  className="p-1 text-[#C4BCB0] hover:text-[#D97706] transition-colors focus:outline-none"
                  title={person.starred ? 'Starred connection' : 'Star connection'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      person.starred ? 'fill-[#D97706] text-[#D97706]' : ''
                    }`}
                  />
                </button>
              </div>

              {person.headline && (
                <p className="text-sm font-medium text-[#3E4A41] mt-0.5">
                  {person.headline}
                </p>
              )}

              {person.company && (
                <p className="text-xs text-[#5B635D] mt-0.5">
                  at <span className="font-semibold text-[#1F2B23]">{person.company}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(person)}
              title="Edit Profile"
              className="p-2 rounded-lg text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Connection"
              className="p-2 rounded-lg text-[#5B635D] hover:text-[#B93815] hover:bg-[#FBECE7] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#232724]">
          {/* Quick Contact Bar */}
          <div className="flex flex-wrap items-center gap-3 py-2 border-b border-[#E8E2D8] text-xs">
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[#1F2B23] hover:border-[#264E36] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#264E36]" />
                <span className="font-mono">{person.email}</span>
              </a>
            )}
            {person.phone && (
              <a
                href={`tel:${person.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[#1F2B23] hover:border-[#264E36] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#264E36]" />
                <span className="font-mono">{person.phone}</span>
              </a>
            )}
            {person.linkedin && (
              <a
                href={person.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DDD5C7] text-[#1F2B23] hover:border-[#264E36] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#264E36]" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-[#737C75]" />
              </a>
            )}
            {person.twitter && (
              <span className="text-xs text-[#5B635D] font-mono py-1">
                {person.twitter}
              </span>
            )}
          </div>

          {/* Follow-up Action Callout */}
          <div className="bg-white rounded-xl border border-[#E8E2D8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#264E36]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B635D]">
                  Follow-up Status
                </h4>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className="font-semibold text-sm capitalize text-[#1F2B23]">
                  {person.followUpStatus === 'due' ? 'Action Due' : person.followUpStatus}
                </span>

                {person.followUpDueDate && (
                  <span
                    className={`text-xs font-mono font-medium ${
                      isOverdue
                        ? 'text-[#B93815]'
                        : isDueToday
                        ? 'text-[#D97706]'
                        : 'text-[#5B635D]'
                    }`}
                  >
                    · {isOverdue ? 'Overdue: ' : 'Target: '}
                    {person.followUpDueDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDraftEmail(person)}
                className="px-4 py-2 bg-[#264E36] hover:bg-[#1E3F2B] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#CDE0D2]" />
                <span>Draft Email with Gemini</span>
              </button>

              {person.followUpStatus !== 'completed' && (
                <button
                  type="button"
                  onClick={handleMarkCompleted}
                  className="px-3 py-2 bg-white border border-[#DDD5C7] text-xs font-medium text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] rounded-lg transition-colors cursor-pointer"
                >
                  Mark Done
                </button>
              )}
            </div>
          </div>

          {/* Meeting Context */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
              Meeting Context & Origin
            </h4>
            <div className="p-3 bg-white rounded-xl border border-[#E8E2D8] text-xs space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[#5B635D]">
                <span>Met on <strong className="text-[#1F2B23] font-mono">{person.meetingDate}</strong></span>
                {linkedEvent && (
                  <>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => onViewEvent && onViewEvent(linkedEvent.id)}
                      className="text-[#264E36] hover:underline font-semibold"
                    >
                      {linkedEvent.title}
                    </button>
                  </>
                )}
              </div>
              {person.meetingContext && (
                <p className="text-[#232724] leading-relaxed">
                  {person.meetingContext}
                </p>
              )}
            </div>
          </div>

          {/* Topics & Conversation Notes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
              Conversation Notes & Topics
            </h4>

            {person.topics && person.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#3E4A41]">
                <span className="text-[#737C75]">Discussed:</span>
                {person.topics.map((t, idx) => (
                  <React.Fragment key={idx}>
                    <span className="font-medium text-[#1F2B23]">{t}</span>
                    {idx < person.topics.length - 1 && (
                      <span aria-hidden="true" className="text-[#C4BCB0]">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {person.notes ? (
              <div className="p-3.5 bg-white rounded-xl border border-[#E8E2D8] text-xs text-[#232724] leading-relaxed whitespace-pre-wrap">
                {person.notes}
              </div>
            ) : (
              <p className="text-xs text-[#737C75] italic">No detailed notes recorded yet.</p>
            )}
          </div>

          {/* Personal Notes / Mutual Connections */}
          {(person.mutualConnections || person.personalNotes) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
                Personal Nuances & Connections
              </h4>
              <div className="p-3 bg-white rounded-xl border border-[#E8E2D8] text-xs space-y-1.5">
                {person.mutualConnections && (
                  <p>
                    <strong className="text-[#5B635D]">Mutual:</strong> {person.mutualConnections}
                  </p>
                )}
                {person.personalNotes && (
                  <p>
                    <strong className="text-[#5B635D]">Personal touch:</strong> {person.personalNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Interaction History Log */}
          <div className="space-y-3 pt-2 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
                Interaction History
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingLog(!isAddingLog)}
                className="text-xs text-[#264E36] font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingLog ? 'Cancel' : 'Log touchpoint'}</span>
              </button>
            </div>

            {isAddingLog && (
              <form onSubmit={handleAddLog} className="p-3 bg-white rounded-xl border border-[#DDD5C7] space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newLogType}
                    onChange={(e) => setNewLogType(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg p-1.5 text-xs text-[#1F2B23]"
                  >
                    <option value="Call / Coffee Chat">Call / Coffee Chat</option>
                    <option value="Email Sent">Email Sent</option>
                    <option value="LinkedIn Message">LinkedIn Message</option>
                    <option value="Met In-Person">Met In-Person</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Summary of touchpoint or note..."
                  value={newLogSummary}
                  onChange={(e) => setNewLogSummary(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-2.5 py-1.5 text-xs text-[#1F2B23]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#264E36] text-white text-xs font-medium rounded-lg hover:bg-[#1E3F2B]"
                >
                  Save Log
                </button>
              </form>
            )}

            <div className="space-y-2">
              {person.interactionHistory && person.interactionHistory.length > 0 ? (
                person.interactionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-[#E8E2D8] text-xs"
                  >
                    <span className="font-mono text-[11px] text-[#737C75] shrink-0 mt-0.5">
                      {item.date}
                    </span>
                    <div>
                      <span className="font-semibold text-[#1F2B23]">{item.type}: </span>
                      <span className="text-[#3E4A41]">{item.summary}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#737C75]">No logged interactions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
