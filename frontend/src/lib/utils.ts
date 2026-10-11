import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Completed'
      };
    case 'EN_ROUTE':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
        label: 'En Route'
      };
    case 'ARRIVED':
    case 'SERVICE_IN_PROGRESS':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'In Progress'
      };
    case 'BIDDING':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Bids Open'
      };
    case 'REQUESTED':
    case 'SEARCHING':
    case 'PENDING':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        label: 'Searching / Pending'
      };
    case 'CANCELLED':
    case 'REJECTED':
    case 'SUSPENDED':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        label: status
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        label: status
      };
  }
}
