import { ChatTurn, Currency, LeadInput, MediaKind } from '../types';

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
