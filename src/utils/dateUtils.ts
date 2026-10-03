import { format, formatDistanceToNow, isAfter, isBefore, addDays, parseISO, differenceInHours, differenceInDays } from 'date-fns';

export function formatDate(isoStr?: string): string {
  if (!isoStr) return 'No deadline';
  try {
    const d = parseISO(isoStr);
    return format(d, 'MMM d, yyyy h:mm a');
  } catch {
    return isoStr;
  }
}

export function formatTimeRelative(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = parseISO(isoStr);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return isoStr;
  }
}

export function getDeadlineProximity(isoStr?: string): 'URGENT' | 'WARNING' | 'UPCOMING' | 'EXPIRED' | 'NONE' {
  if (!isoStr) return 'NONE';
  try {
    const now = new Date();
    const d = parseISO(isoStr);
    if (isBefore(d, now)) return 'EXPIRED';

    const hours = differenceInHours(d, now);
    if (hours <= 3) return 'URGENT';
    if (hours <= 24) return 'WARNING';
    if (hours <= 72) return 'UPCOMING';
    return 'NONE';
  } catch {
    return 'NONE';
  }
}
