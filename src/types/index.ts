export type FollowUpStatus = 'none' | 'due' | 'sent' | 'scheduled' | 'completed';

export type FollowUpType = 'thank_you' | 'coffee_chat' | 'reconnect' | 'custom';

export type EventCategory = 'conference' | 'meetup' | 'coffee' | 'dinner' | 'workshop' | 'summit' | 'other';

export interface InteractionLog {
  id: string;
  date: string;
  type: string;
  summary: string;
}

export interface PersonRecord {
  id: string;
  name: string;
  headline: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  avatarColor?: string;
  eventId?: string;
  eventName?: string;
  meetingDate: string;
  meetingContext: string;
  topics: string[];
  notes: string;
  mutualConnections?: string;
  personalNotes?: string;
  followUpStatus: FollowUpStatus;
  followUpDueDate?: string; // YYYY-MM-DD
  followUpType?: FollowUpType;
  interactionHistory: InteractionLog[];
  tags: string[];
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time?: string;
  location: string;
  venue?: string;
  category: EventCategory;
  description: string;
  tags: string[];
  createdAt: string;
}

export interface FollowUpSummary {
  overdueCount: number;
  dueSoonCount: number;
  completedCount: number;
  totalPeople: number;
  totalEvents: number;
}

export interface GenerateEmailRequest {
  type: 'thank_you' | 'coffee_chat' | 'reconnect';
  tone: 'warm' | 'concise' | 'friendly_pro' | 'mentorship';
  person: {
    name: string;
    headline?: string;
    company?: string;
    email?: string;
    topics?: string[];
    notes?: string;
    meetingContext?: string;
    meetingDate?: string;
    eventName?: string;
  };
  event?: {
    title: string;
    date?: string;
    location?: string;
    description?: string;
  };
  writingSample?: string;
  userSenderName?: string;
  customGoal?: string;
}

export interface GenerateEmailResponse {
  subject: string;
  body: string;
  alternativeOpenings: string[];
  suggestedFollowUpDays?: number;
  callToAction?: string;
}
