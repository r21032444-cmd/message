/**
 * Helper utility functions
 */

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export function getAvatarColor(name = '') {
  const colors = [
    'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    'linear-gradient(135deg, #065f46, #10b981)',
    'linear-gradient(135deg, #701a75, #ec4899)',
    'linear-gradient(135deg, #831843, #f43f5e)',
    'linear-gradient(135deg, #312e81, #6366f1)',
    'linear-gradient(135deg, #78350f, #f59e0b)',
    'linear-gradient(135deg, #134e4a, #14b8a6)',
    'linear-gradient(135deg, #0f172a, #475569)'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
