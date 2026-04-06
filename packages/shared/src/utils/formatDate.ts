/**
 * Formats an ISO date string or timestamp to a readable date
 */
export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats date with time
 */
export function formatDateTime(input: string | number | Date): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
