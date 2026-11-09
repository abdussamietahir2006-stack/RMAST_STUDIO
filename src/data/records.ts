// Shapes of saved Free Audits and call bookings, as the dashboard receives them.
import type { AssistantId } from './assistantsData.js';
import type { AuditAnswers } from './audit/questions.js';
import type { AuditResult } from './audit/scoring.js';
import type { BookingStatus, MeetingType } from './booking/calendar.js';

export const AUDIT_STATUSES = ['new', 'contacted', 'meeting-booked', 'proposal-sent', 'won', 'lost'] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];
export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  'meeting-booked': 'Meeting booked',
  'proposal-sent': 'Proposal sent',
  won: 'Won',
  lost: 'Lost'
};

export interface AuditLead {
  id: string;
  createdAt: string;
  businessName: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  businessType: string;
  website: string;
  socials: Record<string, string>;
  answers: AuditAnswers;
  result: AuditResult;
  overallScore: number;
  mainAssistant: AssistantId;
  pngUrl: string | null;
  status: AuditStatus;
  notes: string;
  consent: boolean;
  meta: { pageUrl: string; referrer: string; userAgent: string; country: string };
}

// List rows leave out the full answers and audit text
export type AuditLeadRow = Omit<AuditLead, 'answers' | 'result' | 'meta' | 'notes'>;

export interface AuditListResponse {
  items: AuditLeadRow[];
  total: number;
  page: number;
  pageSize: number;
  counters: { total: number; thisWeek: number; new: number; byAssistant: Record<AssistantId, number> };
}

export interface CallBooking {
  id: string;
  createdAt: string;
  auditLeadId: string | null;
  name: string;
  business: string;
  email: string;
  phone: string;
  role: string;
  topics: string[];
  meetingType: MeetingType;
  slotStart: string; // ISO, UTC
  slotEnd: string;
  visitorTimezone: string;
  notes: string;
  status: BookingStatus;
  adminNotes: string;
  meetingLink: string;
  meetingLinkSentAt: string | null;
  // Joined for the dashboard
  auditScore?: number | null;
  auditMainAssistant?: AssistantId | null;
}

// What the public manage-booking page sees (no admin fields)
export interface PublicBooking {
  name: string;
  business: string;
  meetingType: MeetingType;
  slotStart: string;
  slotEnd: string;
  visitorTimezone: string;
  status: BookingStatus;
  canChange: boolean;
}

// Prefill for the booking popup from a finished audit
export interface BookingPrefill {
  name: string;
  business: string;
  email: string;
  phone: string;
  role: string;
  country: string;
  city: string;
  mainAssistant: AssistantId | null;
  auditToken: string;
}
