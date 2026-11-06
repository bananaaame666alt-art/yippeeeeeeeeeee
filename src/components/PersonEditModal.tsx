import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Globe, Calendar, Tag, Check, Sparkles, Building, Bookmark } from 'lucide-react';
import { PersonRecord, EventRecord, FollowUpStatus, FollowUpType } from '../types';
import { StorageService } from '../services/storage';

interface PersonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: PersonRecord | null;
  events: EventRecord[];
  defaultEventId?: string;
  onSaved: (person: PersonRecord) => void;
}

const AVATAR_COLORS = [
  '#264E36',
  '#36604D',
  '#466B53',
  '#1E3F2F',
  '#2B4D3C',
  '#5C7A58',
  '#3F6B52',
  '#546A5B',
];

export const PersonEditModal: React.FC<PersonEditModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
  events,
  defaultEventId,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [eventId, setEventId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingContext, setMeetingContext] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [mutualConnections, setMutualConnections] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('due');
  const [followUpDueDate, setFollowUpDueDate] = useState('');
  const [followUpType, setFollowUpType] = useState<FollowUpType>('thank_you');
  const [tagsInput, setTagsInput] = useState('');
  const [starred, setStarred] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setHeadline(personToEdit.headline || '');
      setCompany(personToEdit.company || '');
      setEmail(personToEdit.email || '');
      setPhone(personToEdit.phone || '');
      setLinkedin(personToEdit.linkedin || '');
      setTwitter(personToEdit.twitter || '');
      setWebsite(personToEdit.website || '');
      setEventId(personToEdit.eventId || '');
      setMeetingDate(personToEdit.meetingDate || new Date().toISOString().split('T')[0]);
      setMeetingContext(personToEdit.meetingContext || '');
      setTopicsInput(personToEdit.topics ? personToEdit.topics.join(', ') : '');
      setNotes(personToEdit.notes || '');
      setMutualConnections(personToEdit.mutualConnections || '');
      setPersonalNotes(personToEdit.personalNotes || '');
      setFollowUpStatus(personToEdit.followUpStatus || 'due');
      setFollowUpDueDate(personToEdit.followUpDueDate || '');
      setFollowUpType(personToEdit.followUpType || 'thank_you');
      setTagsInput(personToEdit.tags ? personToEdit.tags.join(', ') : '');
      setStarred(Boolean(personToEdit.starred));
      setAvatarColor(personToEdit.avatarColor || AVATAR_COLORS[0]);
    } else {
      // New Person Defaults
      setName('');
      setHeadline('');
      setCompany('');
      setEmail('');
      setPhone('');
      setLinkedin('');
      setTwitter('');
      setWebsite('');
      setEventId(defaultEventId || (events[0]?.id || ''));
      setMeetingDate(new Date().toISOString().split('T')[0]);
      setMeetingContext('');
      setTopicsInput('');
      setNotes('');
      setMutualConnections('');
      setPersonalNotes('');
      setFollowUpStatus('due');
      // Default due date: in 2 days
      const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFollowUpDueDate(inTwoDays);
      setFollowUpType('thank_you');
      setTagsInput('');
      setStarred(false);
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  }, [personToEdit, defaultEventId, events, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    const linkedEvent = events.find((e) => e.id === eventId);
    const topics = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const newPerson: PersonRecord = {
      id: personToEdit?.id || 'per-' + Date.now(),
      name: name.trim(),
      headline: headline.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      twitter: twitter.trim() || undefined,
      website: website.trim() || undefined,
      avatarColor,
      eventId: eventId || undefined,
      eventName: linkedEvent?.title || undefined,
      meetingDate: meetingDate || now.split('T')[0],
      meetingContext: meetingContext.trim(),
      topics,
      notes: notes.trim(),
      mutualConnections: mutualConnections.trim() || undefined,
      personalNotes: personalNotes.trim() || undefined,
      followUpStatus,
      followUpDueDate: followUpDueDate || undefined,
      followUpType,
      interactionHistory: personToEdit?.interactionHistory || [
        {
          id: 'int-' + Date.now(),
          date: meetingDate || now.split('T')[0],
          type: 'Met In-Person',
          summary: `Met at ${linkedEvent?.title || 'event'}.`,
        },
      ],
      tags,
      starred,
      createdAt: personToEdit?.createdAt || now,
      updatedAt: now,
    };

    StorageService.savePerson(newPerson);
    onSaved(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#1F2B23]">
              {personToEdit ? 'Edit Connection Profile' : 'Add New Person Met'}
            </h2>
            <p className="text-xs text-[#5B635D]">
              Record context, conversation notes, and follow-up intentions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737C75] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Basic Identity */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
              Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Role / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Principal Design Technologist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Northwind Design Systems"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="elena@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B635D] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (415) 555-0182"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B635D] mb-1">
                  LinkedIn URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>
            </div>
          </div>

          {/* Meeting Context & Event Link */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
              Meeting Context & Event Link
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Linked Event
                </label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                >
                  <option value="">No specific event linked</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Date Met
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] font-mono focus:ring-2 focus:ring-[#264E36]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                Where & how did you meet?
              </label>
              <input
                type="text"
                placeholder="e.g. Stood in line for coffee after the keynote; talked about token migrations"
                value={meetingContext}
                onChange={(e) => setMeetingContext(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                Topics Discussed (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Design Tokens, Style Dictionary, Trail Running"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              />
            </div>
          </div>

          {/* Conversation Notes & Takeaways */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
              Notes & Follow-up Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                Conversation Notes & What They Care About
              </label>
              <textarea
                rows={3}
                placeholder="Key things they mentioned, advice given, projects they are working on, challenges they face..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg p-3 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              />
              <p className="text-[11px] text-[#737C75] mt-1">
                Gemini uses these notes to craft genuine, personalized follow-up emails.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5B635D] mb-1">
                  Mutual Connections
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mutual friend with Alex at Stripe"
                  value={mutualConnections}
                  onChange={(e) => setMutualConnections(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B635D] mb-1">
                  Personal Details (Hobbies, Pets, Travel)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Loves oolong tea; has an Aussie shepherd"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                />
              </div>
            </div>
          </div>

          {/* Follow-up Planner */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737C75]">
              Follow-up Action
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Status
                </label>
                <select
                  value={followUpStatus}
                  onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                >
                  <option value="due">Action Due</option>
                  <option value="sent">Email Sent</option>
                  <option value="scheduled">Meeting Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="none">No Follow-up Needed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={followUpDueDate}
                  onChange={(e) => setFollowUpDueDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] font-mono focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Intended Draft Type
                </label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                >
                  <option value="thank_you">Thank You Note</option>
                  <option value="coffee_chat">Coffee Chat Request</option>
                  <option value="reconnect">Reconnect / Check-in</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B635D] mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Founder, Investor, Design Systems, Priority"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#264E36] hover:bg-[#1E3F2B] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {personToEdit ? 'Save Changes' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
