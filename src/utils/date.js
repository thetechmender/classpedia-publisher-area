import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Unified date formatting utility for consistent date display across the app
 */

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
};

export const formatRelative = (dateString) => {
  if (!dateString) return '—';
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

export const formatShort = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'MMM d');
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'MMMM yyyy');
  } catch {
    return dateString;
  }
};