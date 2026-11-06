import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Mail,
  Check,
  ChevronDown,
  RefreshCw,
  Clock,
  Send,
  MessageSquare,
  Coffee,
  HeartHandshake,
  User,
  Calendar,
  AlertCircle,
  Settings2,
} from 'lucide-react';
import { PersonRecord, EventRecord, GenerateEmailResponse } from '../types';
import { StorageService } from '../services/storage';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: PersonRecord | null;
  event?: EventRecord | null;
  allPeople: PersonRecord[];
  allEvents: EventRecord[];
  onSelectPerson?: (person: PersonRecord) => void;
  onFollowUpLogged?: () => void;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  person,
  event,
  allPeople,
  allEvents,
  onSelectPerson,
  onFollowUpLogged,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(person?.id || '');
  const [draftType, setDraftType] = useState<'thank_you' | 'coffee_chat' | 'reconnect'>(
    person?.followUpType && person.followUpType !== 'custom' ? person.followUpType : 'thank_you'
  );
  const [tone, setTone] = useState<'warm' | 'concise' | 'friendly_pro' | 'mentorship'>('warm');
  const [writingSample, setWritingSample] = useState<string>('');
  const [userSenderName, setUserSenderName] = useState<string>('');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [showStyleSettings, setShowStyleSettings] = useState<boolean>(false);

  // Draft state
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [alternativeOpenings, setAlternativeOpenings] = useState<string[]>([]);
  const [suggestedDays, setSuggestedDays] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loggedSent, setLoggedSent] = useState<boolean>(false);

  // Sync when prop person changes
  useEffect(() => {
    if (person) {
      setSelectedPersonId(person.id);
      if (person.followUpType && person.followUpType !== 'custom') {
        setDraftType(person.followUpType);
      }
    } else if (allPeople.length > 0 && !selectedPersonId) {
      setSelectedPersonId(allPeople[0].id);
    }
  }, [person, allPeople]);

  // Load saved writing sample & name
  useEffect(() => {
    setWritingSample(StorageService.getUserWritingSample());
    setUserSenderName(StorageService.getUserSenderName());
  }, []);

  if (!isOpen) return null;

  const currentPerson = allPeople.find((p) => p.id === selectedPersonId) || person;
  const currentEvent = currentPerson?.eventId
    ? allEvents.find((e) => e.id === currentPerson.eventId)
    : event;

  const handleGenerate = async () => {
    if (!currentPerson) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCopied(false);

    // Save preferences
    StorageService.saveUserWritingSample(writingSample);
    StorageService.saveUserSenderName(userSenderName);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: draftType,
          tone,
          person: {
            name: currentPerson.name,
            headline: currentPerson.headline,
            company: currentPerson.company,
            email: currentPerson.email,
            topics: currentPerson.topics,
            notes: currentPerson.notes,
            meetingContext: currentPerson.meetingContext,
            meetingDate: currentPerson.meetingDate,
            eventName: currentPerson.eventName || currentEvent?.title,
          },
          event: currentEvent ? {
            title: currentEvent.title,
            date: currentEvent.date,
            location: currentEvent.location,
            description: currentEvent.description,
          } : undefined,
          writingSample: writingSample.trim() || undefined,
          userSenderName: userSenderName.trim() || undefined,
          customGoal: customGoal.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: GenerateEmailResponse = await response.json();
      setSubject(data.subject);
      setBody(data.body);
      setAlternativeOpenings(data.alternativeOpenings || []);
      setSuggestedDays(data.suggestedFollowUpDays || 4);
    } catch (err: any) {
      console.error('Email generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate email draft.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!body) return;
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleOpenInMailApp = () => {
    if (!currentPerson) return;
    const recipient = currentPerson.email || '';
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
  };

  const handleSwapOpening = (newOpening: string) => {
    if (!body) return;
    // Replace first sentence or paragraph with newOpening
    const paragraphs = body.split('\n\n');
    if (paragraphs.length > 0) {
      // If first paragraph starts with a greeting like "Hi Name,", keep it
      const firstPara = paragraphs[0];
      const greetingMatch = firstPara.match(/^(Hi|Hello|Dear)\s+[^,]+,\s*/i);
      if (greetingMatch) {
        paragraphs[0] = `${greetingMatch[0]}\n\n${newOpening}`;
      } else {
        paragraphs[0] = newOpening;
      }
      setBody(paragraphs.join('\n\n'));
    }
  };

  const handleLogAsSent = () => {
    if (!currentPerson) return;
    const today = new Date().toISOString().split('T')[0];

    const updatedPerson: PersonRecord = {
      ...currentPerson,
      followUpStatus: 'sent',
      followUpDueDate: new Date(Date.now() + suggestedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interactionHistory: [
        {
          id: 'int-' + Date.now(),
          date: today,
          type: 'Follow-up Email Sent',
          summary: `Sent follow-up draft: "${subject}". Next check-in set in ${suggestedDays} days.`,
        },
        ...currentPerson.interactionHistory,
      ],
      updatedAt: new Date().toISOString(),
    };

    StorageService.savePerson(updatedPerson);
    setLoggedSent(true);
    if (onFollowUpLogged) onFollowUpLogged();
    setTimeout(() => {
      setLoggedSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E9EFE9] flex items-center justify-center text-[#264E36]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1F2B23]">
                Draft Follow-up Email
              </h2>
              <p className="text-xs text-[#5B635D]">
                AI-assisted drafting with Gemini · You review & send via your mail client
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737C75] hover:text-[#1F2B23] hover:bg-[#F4EFEA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Recipient Picker & Event Context Banner */}
          <div className="bg-white rounded-xl border border-[#E8E2D8] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#5B635D] mb-1">
                  Recipient
                </label>
                <div className="relative">
                  <select
                    value={selectedPersonId}
                    onChange={(e) => {
                      setSelectedPersonId(e.target.value);
                      const p = allPeople.find((item) => item.id === e.target.value);
                      if (p && onSelectPerson) onSelectPerson(p);
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1F2B23] font-medium focus:ring-2 focus:ring-[#264E36] focus:border-transparent appearance-none pr-8 cursor-pointer"
                  >
                    {allPeople.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.headline ? `· ${p.headline}` : ''} {p.company ? `(${p.company})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-[#737C75] pointer-events-none" />
                </div>
              </div>

              {currentPerson?.email && (
                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] text-[#737C75] block">Direct email</span>
                  <a
                    href={`mailto:${currentPerson.email}`}
                    className="text-xs font-mono text-[#264E36] hover:underline"
                  >
                    {currentPerson.email}
                  </a>
                </div>
              )}
            </div>

            {/* Context details preview */}
            {currentPerson && (
              <div className="text-xs text-[#5B635D] pt-2 border-t border-[#F2ECE3] flex flex-wrap gap-x-4 gap-y-1">
                {currentPerson.eventName && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#264E36]" />
                    <span>Met at <strong>{currentPerson.eventName}</strong></span>
                  </span>
                )}
                {currentPerson.meetingContext && (
                  <span>· {currentPerson.meetingContext}</span>
                )}
                {currentPerson.topics && currentPerson.topics.length > 0 && (
                  <span className="text-[#3E4A41]">
                    · Topics: {currentPerson.topics.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Follow-up Type & Tone Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1.5">
                Goal / Draft Type
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4EFEA] rounded-xl border border-[#E3DCD2]">
                <button
                  type="button"
                  onClick={() => setDraftType('thank_you')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-all ${
                    draftType === 'thank_you'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Thank You</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDraftType('coffee_chat')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-all ${
                    draftType === 'coffee_chat'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Coffee Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDraftType('reconnect')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg flex flex-col items-center gap-1 transition-all ${
                    draftType === 'reconnect'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reconnect</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2B23] mb-1.5">
                Tone & Voice
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4EFEA] rounded-xl border border-[#E3DCD2]">
                <button
                  type="button"
                  onClick={() => setTone('warm')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    tone === 'warm'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  Warm & Personable
                </button>
                <button
                  type="button"
                  onClick={() => setTone('concise')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    tone === 'concise'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  Crisp (&lt;90 words)
                </button>
                <button
                  type="button"
                  onClick={() => setTone('friendly_pro')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    tone === 'friendly_pro'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  Friendly Pro
                </button>
                <button
                  type="button"
                  onClick={() => setTone('mentorship')}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    tone === 'mentorship'
                      ? 'bg-white text-[#264E36] shadow-xs font-semibold'
                      : 'text-[#5B635D] hover:text-[#1F2B23]'
                  }`}
                >
                  Mentorship
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Style & Voice Customization */}
          <div>
            <button
              type="button"
              onClick={() => setShowStyleSettings(!showStyleSettings)}
              className="text-xs text-[#264E36] font-medium flex items-center gap-1.5 hover:underline"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>
                {showStyleSettings ? 'Hide voice & signature settings' : 'Personalize voice, signature & custom notes'}
              </span>
            </button>

            {showStyleSettings && (
              <div className="mt-3 p-4 bg-white rounded-xl border border-[#E8E2D8] space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5B635D] mb-1">
                      Your Name / Sign-off
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jordan Miller"
                      value={userSenderName}
                      onChange={(e) => setUserSenderName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-1.5 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5B635D] mb-1">
                      Custom angle or specific detail to include
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mention that I sent over the PDF we discussed"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-1.5 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5B635D] mb-1">
                    Your Writing Style Sample (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Paste a few sentences showing how you typically write emails or your personal sign-off style..."
                    value={writingSample}
                    onChange={(e) => setWritingSample(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1F2B23] focus:ring-2 focus:ring-[#264E36]"
                  />
                  <p className="text-[11px] text-[#737C75] mt-1">
                    Saved in your browser so future drafts match your authentic voice.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !currentPerson}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#264E36] hover:bg-[#1E3F2B] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#CDE0D2]" />
                  <span>{body ? 'Regenerate Draft' : 'Generate Email Draft'}</span>
                </>
              )}
            </button>

            {body && (
              <span className="text-xs text-[#737C75] hidden sm:inline">
                Suggested follow-up: in <strong className="text-[#1F2B23]">{suggestedDays} days</strong>
              </span>
            )}
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl text-xs text-[#9E2A2B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Draft generation note</p>
                <p>{errorMessage}</p>
                <p className="mt-1 text-[11px] text-[#737C75]">
                  You can edit the draft manually below or click Regenerate.
                </p>
              </div>
            </div>
          )}

          {/* Output Editor: Subject & Body */}
          {(body || subject || isLoading) && (
            <div className="space-y-4 pt-2 border-t border-[#E8E2D8] animate-fade-in">
              {/* Alternative Openings */}
              {alternativeOpenings && alternativeOpenings.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[#5B635D] mb-1.5">
                    Click to swap first sentence:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {alternativeOpenings.map((opening, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSwapOpening(opening)}
                        className="text-left text-xs bg-white hover:bg-[#F2ECE3] border border-[#DDD5C7] rounded-lg px-3 py-1.5 text-[#333D35] transition-colors cursor-pointer"
                      >
                        "{opening}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2B23] mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line will appear here..."
                  className="w-full bg-white border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#1F2B23] font-medium focus:ring-2 focus:ring-[#264E36]"
                />
              </div>

              {/* Body Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1F2B23]">
                    Email Body (Review & Edit)
                  </label>
                  <span className="text-[11px] text-[#737C75]">
                    {body.length} characters · {body.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Generated draft body will appear here..."
                  className="w-full bg-white border border-[#DDD5C7] rounded-xl p-3.5 text-sm text-[#232724] leading-relaxed font-sans focus:ring-2 focus:ring-[#264E36] resize-y"
                />
              </div>

              {/* Safety notice */}
              <div className="p-3 bg-[#F4EFEA] rounded-xl border border-[#E3DCD2] text-xs text-[#5B635D] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#7A6B56] shrink-0" />
                <span>
                  AfterHello never sends emails automatically. Review and adjust your message, then copy or launch in your preferred email client.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E2D8] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#5B635D] hover:text-[#1F2B23] hover:bg-[#F4EFEA] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!body}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-[#E9EFE9] text-[#264E36] font-semibold'
                  : 'bg-white border border-[#DDD5C7] text-[#1F2B23] hover:bg-[#F4EFEA] disabled:opacity-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#264E36]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#737C75]" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenInMailApp}
              disabled={!body}
              className="px-3.5 py-2 bg-white border border-[#DDD5C7] text-[#1F2B23] hover:bg-[#F4EFEA] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#264E36]" />
              <span>Open in Mail App</span>
            </button>

            <button
              type="button"
              onClick={handleLogAsSent}
              disabled={!body}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                loggedSent
                  ? 'bg-[#264E36] text-white'
                  : 'bg-[#264E36] hover:bg-[#1E3F2B] text-white disabled:opacity-50'
              }`}
            >
              {loggedSent ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Logged as Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Log as Sent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
