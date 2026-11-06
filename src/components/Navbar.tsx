import React from 'react';
import {
  Compass,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'people' | 'events' | 'reminders';
  setActiveTab: (tab: 'dashboard' | 'people' | 'events' | 'reminders') => void;
  onOpenNewPerson: () => void;
  onOpenSearch: () => void;
  overdueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewPerson,
  onOpenSearch,
  overdueCount,
}) => {
  return (
    <>
      {/* Desktop / Tablet Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#264E36] flex items-center justify-center text-[#F5F2EB] shadow-xs group-hover:bg-[#1E3F2B] transition-colors">
              <Sparkles className="w-4 h-4 text-[#CDE0D2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1F2B23] font-display">
                AfterHello
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-[#264E36] text-[#264E36] font-semibold'
                  : 'border-transparent text-[#5B635D] hover:text-[#1F2B23]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'people'
                  ? 'border-[#264E36] text-[#264E36] font-semibold'
                  : 'border-transparent text-[#5B635D] hover:text-[#1F2B23]'
              }`}
            >
              People Met
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'events'
                  ? 'border-[#264E36] text-[#264E36] font-semibold'
                  : 'border-transparent text-[#5B635D] hover:text-[#1F2B23]'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`relative transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reminders'
                  ? 'border-[#264E36] text-[#264E36] font-semibold'
                  : 'border-transparent text-[#5B635D] hover:text-[#1F2B23]'
              }`}
            >
              <span>Follow-ups</span>
              {overdueCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-mono font-medium rounded bg-[#FBECE7] text-[#B93815]">
                  {overdueCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Search & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenSearch}
              title="Search people, notes, events (Cmd+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E3DCD2] bg-[#F4EFEA]/80 hover:bg-[#EFE9E2] text-xs text-[#5B635D] transition-colors focus-visible:ring-2 focus-visible:ring-[#264E36]"
            >
              <Search className="w-3.5 h-3.5 text-[#737C75]" />
              <span className="whitespace-nowrap">Search records...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#DDD5C7] rounded text-[#808982]">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={onOpenSearch}
              title="Search"
              className="sm:hidden p-2 rounded-lg text-[#5B635D] hover:bg-[#EFE9E2] focus:outline-none"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenNewPerson}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#264E36] rounded-lg hover:bg-[#1E3F2B] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#264E36]"
            >
              <Plus className="w-4 h-4" />
              <span>New Connection</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar (Thumb Zone) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E2D8] shadow-lg pb-safe"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'dashboard' ? 'text-[#264E36]' : 'text-[#737C75]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('people')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'people' ? 'text-[#264E36]' : 'text-[#737C75]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">People</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'events' ? 'text-[#264E36]' : 'text-[#737C75]'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">Events</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'reminders' ? 'text-[#264E36]' : 'text-[#737C75]'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">Follow-ups</span>
            {overdueCount > 0 && (
              <span className="absolute top-2 right-6 w-2 h-2 rounded-full bg-[#B93815]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
