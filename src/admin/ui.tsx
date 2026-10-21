import React from 'react';
import { Loader2 } from 'lucide-react';
import { InquiryStatus } from '../types';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`bg-[#111218] border border-[#22232D] rounded-lg ${className}`}>{children}</section>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action
}) => (
  <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
    <div>
      <h2 className="text-sm font-semibold text-[#ECEAE5]">{title}</h2>
      {subtitle && <p className="text-xs text-[#8B8D98] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action
}) => (
  <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#ECEAE5]">{title}</h1>
      {subtitle && <p className="text-sm text-[#8B8D98] mt-1">{subtitle}</p>}
    </div>
    {action}
  </header>
);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#C9A96E] text-[#0B0C10] hover:bg-[#D9B97E] font-semibold',
  secondary: 'bg-[#16171F] text-[#ECEAE5] border border-[#2E3040] hover:border-[#C9A96E]/60',
  ghost: 'text-[#A6A8B3] hover:text-[#ECEAE5] hover:bg-[#16171F]',
  danger: 'text-[#F87171] hover:bg-[#2A1215] border border-[#3F1D22]'
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }
> = ({ variant = 'secondary', loading, className = '', children, disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[variant]} ${className}`}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({
  label,
  className = '',
  id,
  ...rest
}) => (
  <label className="block space-y-1.5" htmlFor={id}>
    {label && <span className="text-xs font-medium text-[#A6A8B3]">{label}</span>}
    <input
      id={id}
      {...rest}
      className={`w-full px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#6E7180] outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/40 ${className}`}
    />
  </label>
);

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#8B8D98]" role="status">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>{label}</span>
  </div>
);

export const ErrorNote: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <p role="alert" className="text-sm text-[#FCA5A5] bg-[#2A1215] border border-[#3F1D22] px-3 py-2 rounded-md">
      {message}
    </p>
  ) : null;

export const STATUS_META: Record<InquiryStatus, { label: string; dot: string }> = {
  new: { label: 'New', dot: 'bg-[#60A5FA]' },
  reviewed: { label: 'Reviewed', dot: 'bg-[#FBBF24]' },
  contacted: { label: 'Contacted', dot: 'bg-[#4ADE80]' }
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateTime(iso);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
