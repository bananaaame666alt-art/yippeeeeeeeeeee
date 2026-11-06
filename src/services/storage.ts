import { EventRecord, PersonRecord, FollowUpSummary } from '../types';

const STORAGE_KEYS = {
  PEOPLE: 'afterhello_people_v1',
  EVENTS: 'afterhello_events_v1',
  WRITING_SAMPLE: 'afterhello_user_writing_sample_v1',
  USER_NAME: 'afterhello_user_name_v1',
};

// Initial realistic fictional events (anchored around Nov 2026)
export const INITIAL_EVENTS: EventRecord[] = [
  {
    id: 'evt-saas-2026',
    title: 'SaaS Frontier Summit 2026',
    date: '2026-11-03',
    endDate: '2026-11-04',
    time: '09:00',
    location: 'San Francisco, CA',
    venue: 'Yerba Buena Center for the Arts',
    category: 'conference',
    description: 'Annual gathering of product leaders, founders, and engineers scaling B2B SaaS platforms. Focus on enterprise readiness and human-AI workflows.',
    tags: ['SaaS', 'B2B', 'Product Strategy', 'San Francisco'],
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'evt-design-systems',
    title: 'Design Systems & UI Engineering Meetup',
    date: '2026-11-04',
    time: '18:30',
    location: 'Oakland, CA',
    venue: 'Kapor Center Rooftop',
    category: 'meetup',
    description: 'Casual evening meetup on multi-brand tokens, accessibility governance, and cross-platform design orchestration.',
    tags: ['Design Systems', 'Design Tokens', 'Figma', 'Accessibility'],
    createdAt: '2026-11-02T12:00:00Z',
  },
  {
    id: 'evt-climate-breakfast',
    title: 'Climate Tech Founders Breakfast',
    date: '2026-10-28',
    time: '08:00',
    location: 'Palo Alto, CA',
    venue: 'HanaHaus Cafe',
    category: 'coffee',
    description: 'Intimate breakfast discussion with hardware founders working on battery telemetry, smart grid balancing, and clean infrastructure.',
    tags: ['Climate Tech', 'Hardware', 'Energy', 'Early Stage'],
    createdAt: '2026-10-25T08:00:00Z',
  },
  {
    id: 'evt-ai-builders',
    title: 'AI Builders & Applied GenAI Showcase',
    date: '2026-11-12',
    time: '17:00',
    location: 'San Francisco, CA',
    venue: 'The Foundry @ SOMA',
    category: 'summit',
    description: 'Live interactive product demos from teams deploying generative models in developer tooling, healthcare workflows, and creative tooling.',
    tags: ['GenAI', 'AI Tooling', 'Hackathon', 'Demos'],
    createdAt: '2026-11-03T15:00:00Z',
  },
];

// Initial realistic fictional people met
export const INITIAL_PEOPLE: PersonRecord[] = [
  {
    id: 'per-elena-rostova',
    name: 'Elena Rostova',
    headline: 'Principal Design Technologist',
    company: 'Northwind Design Systems',
    email: 'elena.rostova@example-northwind.com',
    phone: '+1 (415) 555-0182',
    linkedin: 'https://linkedin.com/in/example-elena-rostova',
    twitter: '@elenar_design',
    website: 'https://elenarostova.design',
    avatarColor: '#2D5A43',
    eventId: 'evt-design-systems',
    eventName: 'Design Systems & UI Engineering Meetup',
    meetingDate: '2026-11-04',
    meetingContext: 'Met by the patio heaters during the token pipeline discussion. She led their migration to semantic color scales.',
    topics: ['Multi-brand token pipelines', 'Style Dictionary v4', 'Design token QA testing'],
    notes: 'Elena shared how Northwind automated 90% of token validation using custom style-dictionary transforms. Mentioned she is looking for feedback on a token linter open-source project. Very warm and articulate.',
    mutualConnections: 'Mutual colleague with Dev Patel at Stripe.',
    personalNotes: 'Loves specialty loose-leaf oolong and has an Australian Shepherd named Barnaby.',
    followUpStatus: 'due',
    followUpDueDate: '2026-11-05', // Due today!
    followUpType: 'thank_you',
    interactionHistory: [
      {
        id: 'int-1',
        date: '2026-11-04',
        type: 'Met In-Person',
        summary: 'Met at Design Systems Meetup; discussed token tooling and recommended catching up about their open-source linter.',
      },
    ],
    tags: ['Design Systems', 'Tokens', 'Potential Collaborator'],
    starred: true,
    createdAt: '2026-11-04T21:00:00Z',
    updatedAt: '2026-11-04T21:00:00Z',
  },
  {
    id: 'per-marcus-chen',
    name: 'Marcus Chen',
    headline: 'Co-Founder & CEO',
    company: 'Leaflet Robotics',
    email: 'marcus@example-leafletrobotics.io',
    phone: '+1 (650) 555-0149',
    linkedin: 'https://linkedin.com/in/example-marcus-chen',
    twitter: '@marcus_leaflet',
    avatarColor: '#466B53',
    eventId: 'evt-saas-2026',
    eventName: 'SaaS Frontier Summit 2026',
    meetingDate: '2026-11-03',
    meetingContext: 'Sat next to each other at the Founders Lunch table in Hall B.',
    topics: ['Fleet management telemetry', 'Seed fundraising round', 'Sensor calibration'],
    notes: 'Marcus is building robotics dispatch software for indoor vertical farming. Currently closing their $3M seed round. Looking for advisors with experience in real-time streaming dashboards.',
    mutualConnections: 'Angel investor Maya Thorne.',
    personalNotes: 'Avid road cyclist, doing the Marin Century next spring.',
    followUpStatus: 'due',
    followUpDueDate: '2026-11-04', // Overdue by 1 day!
    followUpType: 'coffee_chat',
    interactionHistory: [
      {
        id: 'int-2',
        date: '2026-11-03',
        type: 'Met In-Person',
        summary: 'Connected at Founders Lunch. Discussed real-time telematics architecture and agreed to schedule a 30-min coffee chat.',
      },
    ],
    tags: ['Robotics', 'Founder', 'Fundraising', 'High Priority'],
    starred: true,
    createdAt: '2026-11-03T14:30:00Z',
    updatedAt: '2026-11-03T14:30:00Z',
  },
  {
    id: 'per-sarah-jenkins',
    name: 'Sarah Jenkins',
    headline: 'VP of Ecosystem Partnerships',
    company: 'Horizon Cloud Platforms',
    email: 'sjenkins@example-horizoncloud.net',
    phone: '+1 (415) 555-0193',
    linkedin: 'https://linkedin.com/in/example-sarah-jenkins',
    avatarColor: '#1E3F2F',
    eventId: 'evt-saas-2026',
    eventName: 'SaaS Frontier Summit 2026',
    meetingDate: '2026-11-03',
    meetingContext: 'Introduced right after the afternoon keynote on API marketplaces.',
    topics: ['Integration partner programs', 'App store co-marketing', 'Developer grants'],
    notes: 'Sarah manages developer relations and marketplace rev-share. She was intrigued by developer-first workflows and suggested applying for the Horizon Accelerator grants program closing at end of month.',
    mutualConnections: 'Met via Alex Miller at AWS alumni network.',
    personalNotes: 'Recently moved from Seattle to San Francisco, enjoys trail running in the Presidio.',
    followUpStatus: 'due',
    followUpDueDate: '2026-11-03', // Overdue!
    followUpType: 'thank_you',
    interactionHistory: [
      {
        id: 'int-3',
        date: '2026-11-03',
        type: 'Met In-Person',
        summary: 'Brief 15-minute conversation regarding marketplace integration and grants.',
      },
    ],
    tags: ['Partnerships', 'Grant', 'Cloud Platform'],
    starred: false,
    createdAt: '2026-11-03T17:15:00Z',
    updatedAt: '2026-11-03T17:15:00Z',
  },
  {
    id: 'per-tariq-mansoor',
    name: 'Tariq Al-Mansoor',
    headline: 'Partner & Seed Investor',
    company: 'Oasis Capital Ventures',
    email: 'tariq@example-oasiscap.vc',
    linkedin: 'https://linkedin.com/in/example-tariq-mansoor',
    twitter: '@tariq_ventures',
    avatarColor: '#5C7A58',
    eventId: 'evt-climate-breakfast',
    eventName: 'Climate Tech Founders Breakfast',
    meetingDate: '2026-10-28',
    meetingContext: 'Shared coffee around the communal table at HanaHaus.',
    topics: ['Microgrid energy storage', 'Series A round metrics', 'Supply chain derisking'],
    notes: 'Tariq invests in early-stage industrial hardware and SaaS bridges. Very thoughtful perspective on capital efficiency. Mentioned he loves seeing 3-bullet monthly updates from founders.',
    mutualConnections: 'Friend of Samira at Khosla.',
    personalNotes: 'Collector of vintage mechanical wristwatches (Grand Seiko fan).',
    followUpStatus: 'sent',
    followUpDueDate: '2026-11-18',
    followUpType: 'reconnect',
    interactionHistory: [
      {
        id: 'int-4',
        date: '2026-10-28',
        type: 'Met In-Person',
        summary: 'Met at breakfast. Exchanged thoughts on industrial software markets.',
      },
      {
        id: 'int-5',
        date: '2026-10-29',
        type: 'Email Sent',
        summary: 'Sent thank-you note sharing the article on distributed battery storage.',
      },
    ],
    tags: ['Investor', 'Climate', 'Advisory'],
    starred: true,
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-29T11:00:00Z',
  },
  {
    id: 'per-chloe-vance',
    name: 'Chloe Vance',
    headline: 'Senior Engineering Manager',
    company: 'Starlight Media',
    email: 'chloe.vance@example-starlightmedia.com',
    linkedin: 'https://linkedin.com/in/example-chloe-vance',
    avatarColor: '#36604D',
    eventId: 'evt-design-systems',
    eventName: 'Design Systems & UI Engineering Meetup',
    meetingDate: '2026-11-04',
    meetingContext: 'Chatted during the demo Q&A session on web components.',
    topics: ['Micro-frontends', 'Engineering culture', 'Remote team rituals'],
    notes: 'Chloe manages a distributed team of 14 front-end engineers. Discussed strategies for keeping design system adoption high across siloed business units.',
    mutualConnections: 'Attended UC Berkeley EECS program.',
    personalNotes: 'Plays cello in a community orchestra.',
    followUpStatus: 'due',
    followUpDueDate: '2026-11-06', // Due tomorrow
    followUpType: 'coffee_chat',
    interactionHistory: [
      {
        id: 'int-6',
        date: '2026-11-04',
        type: 'Met In-Person',
        summary: 'Engaged talk about engineering leadership and component governance.',
      },
    ],
    tags: ['Engineering Leadership', 'Mentorship', 'Oakland'],
    starred: false,
    createdAt: '2026-11-04T20:30:00Z',
    updatedAt: '2026-11-04T20:30:00Z',
  },
  {
    id: 'per-david-kalu',
    name: 'David Kalu',
    headline: 'Head of Growth Marketing',
    company: 'MetricPulse Analytics',
    email: 'david@example-metricpulse.io',
    phone: '+1 (510) 555-0164',
    linkedin: 'https://linkedin.com/in/example-david-kalu',
    avatarColor: '#2B4D3C',
    eventId: 'evt-saas-2026',
    eventName: 'SaaS Frontier Summit 2026',
    meetingDate: '2026-11-03',
    meetingContext: 'Stood in line together for morning espresso.',
    topics: ['Product-led onboarding', 'Cold outbound strategy', 'Substack newsletters'],
    notes: 'David writes a popular weekly breakdown of SaaS viral loops. Offered to introduce his growth agency partner if we need audit help.',
    mutualConnections: 'Both follow Lenny Rachitsky newsletter community.',
    personalNotes: 'Huge fan of Premier League soccer (Arsenal supporter).',
    followUpStatus: 'completed',
    followUpDueDate: '2026-11-04',
    followUpType: 'thank_you',
    interactionHistory: [
      {
        id: 'int-7',
        date: '2026-11-03',
        type: 'Met In-Person',
        summary: 'Quick coffee chat queue conversation about PLG onboarding teardowns.',
      },
      {
        id: 'int-8',
        date: '2026-11-04',
        type: 'Email Sent',
        summary: 'Sent quick follow-up with feedback on his latest Substack issue. Received friendly reply!',
      },
    ],
    tags: ['Marketing', 'PLG', 'Content'],
    starred: false,
    createdAt: '2026-11-03T10:15:00Z',
    updatedAt: '2026-11-04T16:00:00Z',
  },
  {
    id: 'per-priya-patel',
    name: 'Priya Patel',
    headline: 'Staff ML Research Engineer',
    company: 'Apex Intelligence Labs',
    email: 'priya.patel@example-apexintel.ai',
    linkedin: 'https://linkedin.com/in/example-priya-patel',
    twitter: '@priya_ml',
    avatarColor: '#3F6B52',
    eventId: 'evt-ai-builders',
    eventName: 'AI Builders & Applied GenAI Showcase',
    meetingDate: '2026-11-01',
    meetingContext: 'Connected online ahead of the upcoming showcase on applied reasoning models.',
    topics: ['Structured output extraction', 'Small language models', 'Latency optimization'],
    notes: 'Priya is presenting a lightning talk on low-latency tool calling with lightweight models. Exchanged notes on edge deployment architectures.',
    mutualConnections: 'Stanford AI Lab alumni.',
    personalNotes: 'Passionate sourdough bread baker.',
    followUpStatus: 'scheduled',
    followUpDueDate: '2026-11-13',
    followUpType: 'coffee_chat',
    interactionHistory: [
      {
        id: 'int-9',
        date: '2026-11-01',
        type: 'Virtual Introduction',
        summary: 'Exchanged messages regarding model latency benchmarks. Agreed to meet at the AI Builders showcase next week.',
      },
    ],
    tags: ['AI/ML', 'Speaker', 'Research'],
    starred: true,
    createdAt: '2026-11-01T14:00:00Z',
    updatedAt: '2026-11-01T14:00:00Z',
  },
  {
    id: 'per-liam-oconnor',
    name: 'Liam O’Connor',
    headline: 'Founder & Hardware Architect',
    company: 'VoltGrid Dynamics',
    email: 'liam@example-voltgrid.tech',
    phone: '+1 (408) 555-0131',
    avatarColor: '#284635',
    eventId: 'evt-climate-breakfast',
    eventName: 'Climate Tech Founders Breakfast',
    meetingDate: '2026-10-28',
    meetingContext: 'Sat across during breakfast table introduction round.',
    topics: ['Battery cell testing', 'UL certification', 'Clean energy incentives'],
    notes: 'Liam has 10 years experience in hardware engineering at Tesla. Now building modular energy storage for small commercial buildings.',
    mutualConnections: 'Connected with hardware angel network.',
    personalNotes: 'Former collegiate rower.',
    followUpStatus: 'completed',
    followUpDueDate: '2026-10-30',
    followUpType: 'thank_you',
    interactionHistory: [
      {
        id: 'int-10',
        date: '2026-10-28',
        type: 'Met In-Person',
        summary: 'Breakfast introduction and discussion of commercial storage.',
      },
      {
        id: 'int-11',
        date: '2026-10-29',
        type: 'Email Sent',
        summary: 'Sent thank-you email and exchanged contact cards.',
      },
    ],
    tags: ['Climate', 'Hardware', 'Hardware Engineering'],
    starred: false,
    createdAt: '2026-10-28T11:00:00Z',
    updatedAt: '2026-10-29T15:00:00Z',
  },
];

// Helper to notify listeners across the app
function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('afterhello_storage_change'));
  }
}

export const StorageService = {
  getPeople(): PersonRecord[] {
    if (typeof window === 'undefined') return INITIAL_PEOPLE;
    const raw = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (!raw) {
      this.resetToSampleData();
      return INITIAL_PEOPLE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEOPLE;
    }
  },

  getPerson(id: string): PersonRecord | undefined {
    return this.getPeople().find((p) => p.id === id);
  },

  savePerson(person: PersonRecord): void {
    const people = this.getPeople();
    const index = people.findIndex((p) => p.id === person.id);
    const updatedPerson = {
      ...person,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      people[index] = updatedPerson;
    } else {
      people.unshift(updatedPerson);
    }

    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    notifyChange();
  },

  deletePerson(id: string): void {
    const people = this.getPeople().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    notifyChange();
  },

  getEvents(): EventRecord[] {
    if (typeof window === 'undefined') return INITIAL_EVENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      this.resetToSampleData();
      return INITIAL_EVENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EVENTS;
    }
  },

  getEvent(id: string): EventRecord | undefined {
    return this.getEvents().find((e) => e.id === id);
  },

  saveEvent(event: EventRecord): void {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === event.id);

    if (index >= 0) {
      events[index] = event;
    } else {
      events.unshift(event);
    }

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    notifyChange();
  },

  deleteEvent(id: string): void {
    const events = this.getEvents().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    notifyChange();
  },

  getUserWritingSample(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.WRITING_SAMPLE) || '';
  },

  saveUserWritingSample(sample: string): void {
    localStorage.setItem(STORAGE_KEYS.WRITING_SAMPLE, sample);
  },

  getUserSenderName(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
  },

  saveUserSenderName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(INITIAL_PEOPLE));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    notifyChange();
  },

  exportBackupJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      people: this.getPeople(),
      events: this.getEvents(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): { success: boolean; message: string; peopleCount?: number; eventsCount?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed.people) || !Array.isArray(parsed.events)) {
        return { success: false, message: 'Invalid backup structure. Expected people and events arrays.' };
      }
      localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(parsed.people));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(parsed.events));
      notifyChange();
      return {
        success: true,
        message: `Successfully restored ${parsed.people.length} people and ${parsed.events.length} events!`,
        peopleCount: parsed.people.length,
        eventsCount: parsed.events.length,
      };
    } catch (err: any) {
      return { success: false, message: 'Failed to parse JSON file: ' + (err.message || 'Unknown error') };
    }
  },

  getFollowUpSummary(): FollowUpSummary {
    const people = this.getPeople();
    const events = this.getEvents();
    const today = new Date().toISOString().split('T')[0];

    let overdueCount = 0;
    let dueSoonCount = 0;
    let completedCount = 0;

    for (const person of people) {
      if (person.followUpStatus === 'completed') {
        completedCount++;
      } else if (person.followUpDueDate) {
        if (person.followUpDueDate < today) {
          overdueCount++;
        } else {
          // If within 5 days
          const diffDays = Math.ceil((new Date(person.followUpDueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 4) {
            dueSoonCount++;
          }
        }
      }
    }

    return {
      overdueCount,
      dueSoonCount,
      completedCount,
      totalPeople: people.length,
      totalEvents: events.length,
    };
  },
};
