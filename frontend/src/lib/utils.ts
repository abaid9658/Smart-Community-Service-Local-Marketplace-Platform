// ─── Utility helpers ────────────────────────────────────────────

export const formatPrice = (price: number, currency = 'PKR'): string => {
  if (price >= 1000000) return `${currency} ${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${currency} ${(price / 1000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const getStatusBadge = (status: string): { label: string; class: string } => {
  const map: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: 'Active', class: 'badge-green' },
    PENDING_APPROVAL: { label: 'Pending', class: 'badge-yellow' },
    REJECTED: { label: 'Rejected', class: 'badge-red' },
    DRAFT: { label: 'Draft', class: 'badge-gray' },
    ARCHIVED: { label: 'Archived', class: 'badge-gray' },
    PENDING: { label: 'Pending', class: 'badge-yellow' },
    ACCEPTED: { label: 'Accepted', class: 'badge-blue' },
    IN_PROGRESS: { label: 'In Progress', class: 'badge-purple' },
    COMPLETED: { label: 'Completed', class: 'badge-green' },
    CANCELLED: { label: 'Cancelled', class: 'badge-red' },
  };
  return map[status] || { label: status, class: 'badge-gray' };
};

export const classNames = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');

export const truncate = (str: string, maxLength: number): string =>
  str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-amber-500';
  return 'text-red-500';
};

export const buildQueryString = (params: Record<string, unknown>): string => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  return new URLSearchParams(filtered as Record<string, string>).toString();
};
