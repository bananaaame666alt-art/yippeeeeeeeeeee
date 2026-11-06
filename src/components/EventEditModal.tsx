import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, FileText } from 'lucide-react';
import { EventRecord, EventCategory } from '../types';
import { StorageService } from '../services/storage';

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventRecord | null;
  onSaved: (event: EventRecord) => void;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState<EventCategory>('conference');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date);
      setEndDate(eventToEdit.endDate || '');
      setTime(eventToEdit.time || '');
      setLocation(eventToEdit.location);
      setVenue(eventToEdit.venue || '');
      setCategory(eventToEdit.category);
      setDescription(eventToEdit.description || '');
      setTagsInput(eventToEdit.tags ? eventToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setTime('09:00');
      setLocation('');
      setVenue('');
      setCategory('conference');
      setDescription('');
      setTagsInput('');
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Event title is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const newEvent: EventRecord = {
      id: eventToEdit?.id || 'evt-' + Date.now(),
      title: title.trim(),
      date: date || now.split('T')[0],
      endDate: endDate || undefined,
      time: time.trim() || undefined,
      location: location.trim() || 'TBD',
      venue: venue.trim() || undefined,
      category,
      description: description.trim(),
      tags,
      createdAt: eventToEdit?.createdAt || now,
    };

    StorageService.saveEvent(newEvent);
    onSaved(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#1F2B23]">
              {eventToEdit ? 'Edit Event' : 'Add New Event'}
            </h2>
            <p className="text-xs text-[#5B635D]">
              Keep track of where you met contacts and export to .ics calendar
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SaaS Frontier Summit 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] font-mono focus:ring-2 focus:ring-[#264E36]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B635D] mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] font-mono focus:ring-2 focus:ring-[#264E36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#5B635D] mb-1">
                Time (e.g. 09:00)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] font-mono focus:ring-2 focus:ring-[#264E36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              >
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="summit">Summit</option>
                <option value="coffee">Coffee Chat</option>
                <option value="dinner">Dinner / Mixer</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B635D] mb-1">
                Venue / Building
              </label>
              <input
                type="text"
                placeholder="e.g. Yerba Buena Center"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
              Description & Topics
            </label>
            <textarea
              rows={3}
              placeholder="What was this event about? Focus areas, keynotes, key takeaways..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#DDD5C7] rounded-lg p-3 text-sm text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5B635D] mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. SaaS, Product Strategy, San Francisco"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
            />
          </div>

          {/* Actions */}
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
              {eventToEdit ? 'Save Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
