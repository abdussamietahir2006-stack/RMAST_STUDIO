// Single source of truth for studio contact channels.
export const CONTACT = {
  email: 'rmaststudio@gmail.com',
  whatsappNumber: '923199564685',
  whatsappDisplay: '+92 319 9564 685',
  instagramHandle: 'rmaststudio2026',
  instagramUrl: 'https://instagram.com/rmaststudio2026',
  founderLinkedIn: 'https://www.linkedin.com/in/raja-muhammad-abdussamie-tahir/'
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT.email}${params.length ? `?${params.join('&')}` : ''}`;
}
