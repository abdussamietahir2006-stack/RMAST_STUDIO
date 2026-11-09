import { ChatTurn, Currency, LeadInput, MediaKind } from '../types';
import type { AuditAnswers } from '../data/audit/questions';
import type { BookingPrefill, PublicBooking } from '../data/records';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'same-origin',
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) }
    });
  } catch {
    throw new ApiError('Network error. Please check your connection.', 0);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function submitLead(lead: LeadInput): Promise<{ id: string; stored: boolean; emailed: boolean }> {
  return request('/api/leads', { method: 'POST', body: JSON.stringify(lead) });
}

export function askAssistant(messages: ChatTurn[], currency: Currency): Promise<{ reply: string }> {
  return request('/api/assistant', { method: 'POST', body: JSON.stringify({ messages, currency }) });
}

export function fetchSiteContent(): Promise<{ media: Record<string, { url: string; kind: MediaKind; poster?: string }> }> {
  return request('/api/content');
}

// ---------------------------------------------------------------------------
// Free Audit and call booking
// ---------------------------------------------------------------------------

export function submitAudit(payload: {
  answers: AuditAnswers;
  png: string | null;
  pageUrl: string;
  referrer: string;
  fax: string;
}): Promise<{ id: string; token: string }> {
  return request('/api/audits', { method: 'POST', body: JSON.stringify(payload) });
}

export const fetchBookingPrefill = (token: string) => request<BookingPrefill>(`/api/audits/prefill/${encodeURIComponent(token)}`);

export const fetchSlots = () => request<{ slots: string[]; slotMinutes: number }>('/api/booking/slots');

export interface BookingRequest {
  name: string;
  business: string;
  email: string;
  phone: string;
  role: string;
  topics: string[];
  meetingType: string;
  slotStart: string;
  timezone: string;
  notes: string;
  consent: boolean;
  auditToken?: string;
  fax: string;
}

export const createBooking = (body: BookingRequest) =>
  request<{ id: string; slotStart: string; slotEnd: string; meetingType: string }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body)
  });

const manageUrl = (token: string) => `/api/bookings/manage/${encodeURIComponent(token)}`;
export const fetchManagedBooking = (token: string) => request<PublicBooking>(manageUrl(token));
export const fetchRescheduleSlots = (token: string) => request<{ slots: string[]; slotMinutes: number }>(`${manageUrl(token)}/slots`);
export const cancelManagedBooking = (token: string) => request<PublicBooking>(`${manageUrl(token)}/cancel`, { method: 'POST' });
export const rescheduleManagedBooking = (token: string, slotStart: string) =>
  request<PublicBooking>(`${manageUrl(token)}/reschedule`, { method: 'POST', body: JSON.stringify({ slotStart }) });
