/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PersonRecord, EventRecord, FollowUpSummary } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { StorageNoticeBanner } from './components/StorageNoticeBanner';
import { DashboardView } from './components/DashboardView';
import { PeopleView } from './components/PeopleView';
import { EventsView } from './components/EventsView';
import { RemindersView } from './components/RemindersView';
import { PersonDetailModal } from './components/PersonDetailModal';
import { PersonEditModal } from './components/PersonEditModal';
import { EventEditModal } from './components/EventEditModal';
import { EmailComposerModal } from './components/EmailComposerModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'people' | 'events' | 'reminders'>('dashboard');
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [summary, setSummary] = useState<FollowUpSummary>({
    overdueCount: 0,
    dueSoonCount: 0,
    completedCount: 0,
    totalPeople: 0,
    totalEvents: 0,
  });

  // Modals state
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<PersonRecord | null>(null);
  const [personToEdit, setPersonToEdit] = useState<PersonRecord | null>(null);
  const [isPersonEditOpen, setIsPersonEditOpen] = useState(false);
  const [defaultEventIdForPerson, setDefaultEventIdForPerson] = useState<string | undefined>(undefined);

  const [eventToEdit, setEventToEdit] = useState<EventRecord | null>(null);
  const [isEventEditOpen, setIsEventEditOpen] = useState(false);

  const [emailComposerPerson, setEmailComposerPerson] = useState<PersonRecord | null>(null);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load and refresh state from StorageService
  const refreshData = useCallback(() => {
    const loadedPeople = StorageService.getPeople();
    const loadedEvents = StorageService.getEvents();
    const calculatedSummary = StorageService.getFollowUpSummary();

    setPeople(loadedPeople);
    setEvents(loadedEvents);
    setSummary(calculatedSummary);

    // Keep detail modal synced if open
    setSelectedPersonForDetail((prev) => {
      if (!prev) return null;
      return loadedPeople.find((p) => p.id === prev.id) || null;
    });
  }, []);

  useEffect(() => {
    refreshData();

    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('afterhello_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('afterhello_storage_change', handleStorageChange);
    };
  }, [refreshData]);

  // Global keyboard shortcuts (Cmd+K for search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for opening modals
  const handleOpenNewPerson = (defaultEventId?: string) => {
    setPersonToEdit(null);
    setDefaultEventIdForPerson(defaultEventId);
    setIsPersonEditOpen(true);
  };

  const handleEditPerson = (p: PersonRecord) => {
    setPersonToEdit(p);
    setIsPersonEditOpen(true);
  };

  const handleOpenNewEvent = () => {
    setEventToEdit(null);
    setIsEventEditOpen(true);
  };

  const handleEditEvent = (ev: EventRecord) => {
    setEventToEdit(ev);
    setIsEventEditOpen(true);
  };

  const handleDraftEmail = (p: PersonRecord) => {
    setEmailComposerPerson(p);
    setIsEmailComposerOpen(true);
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedPersonForDetail(null);
    setActiveTab('events');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#232724] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPerson={() => handleOpenNewPerson()}
        onOpenSearch={() => setIsSearchOpen(true)}
        overdueCount={summary.overdueCount}
      />

      {/* Storage and transparency notice banner */}
      <StorageNoticeBanner />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            people={people}
            events={events}
            summary={summary}
            onOpenNewPerson={() => handleOpenNewPerson()}
            onOpenNewEvent={handleOpenNewEvent}
            onSelectPerson={(p) => setSelectedPersonForDetail(p)}
            onDraftEmail={handleDraftEmail}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'people' && (
          <PeopleView
            people={people}
            events={events}
            onSelectPerson={(p) => setSelectedPersonForDetail(p)}
            onEditPerson={handleEditPerson}
            onDraftEmail={handleDraftEmail}
            onOpenNewPerson={() => handleOpenNewPerson()}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            people={people}
            onOpenNewEvent={handleOpenNewEvent}
            onEditEvent={handleEditEvent}
            onSelectPerson={(p) => setSelectedPersonForDetail(p)}
            onAddPersonToEvent={(eventId) => handleOpenNewPerson(eventId)}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            people={people}
            onSelectPerson={(p) => setSelectedPersonForDetail(p)}
            onDraftEmail={handleDraftEmail}
            onOpenNewPerson={() => handleOpenNewPerson()}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D8] bg-[#F5F1EA] py-6 text-xs text-[#5B635D] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1F2B23] font-display">AfterHello</span>
            <span aria-hidden="true">·</span>
            <span>Follow-up & Networking CRM</span>
            <span aria-hidden="true">·</span>
            <span>Stored in browser · RFC 5545 iCalendar compatible</span>
          </div>

          <div className="flex items-center gap-4 text-[#737C75]">
            <span>Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#DDD5C7] rounded">⌘K</kbd> to search</span>
            <span>·</span>
            <span>Emails sent manually via your mail client</span>
          </div>
        </div>
      </footer>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPersonForDetail}
        events={events}
        isOpen={Boolean(selectedPersonForDetail)}
        onClose={() => setSelectedPersonForDetail(null)}
        onEdit={(p) => {
          setSelectedPersonForDetail(null);
          handleEditPerson(p);
        }}
        onDraftEmail={(p) => {
          setSelectedPersonForDetail(null);
          handleDraftEmail(p);
        }}
        onViewEvent={handleViewEvent}
      />

      {/* Person Edit / Create Modal */}
      <PersonEditModal
        isOpen={isPersonEditOpen}
        onClose={() => setIsPersonEditOpen(false)}
        personToEdit={personToEdit}
        events={events}
        defaultEventId={defaultEventIdForPerson}
        onSaved={(savedPerson) => {
          refreshData();
          setSelectedPersonForDetail(savedPerson);
        }}
      />

      {/* Event Edit / Create Modal */}
      <EventEditModal
        isOpen={isEventEditOpen}
        onClose={() => setIsEventEditOpen(false)}
        eventToEdit={eventToEdit}
        onSaved={() => {
          refreshData();
        }}
      />

      {/* AI Email Composer Modal */}
      <EmailComposerModal
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        person={emailComposerPerson}
        allPeople={people}
        allEvents={events}
        onSelectPerson={(p) => setEmailComposerPerson(p)}
        onFollowUpLogged={() => refreshData()}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        people={people}
        events={events}
        onSelectPerson={(p) => setSelectedPersonForDetail(p)}
        onSelectEvent={(eventId) => {
          setActiveTab('events');
        }}
        onDraftEmail={handleDraftEmail}
      />
    </div>
  );
}
