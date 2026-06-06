export type AdminRole = 'admin';

export type AdminSection =
  | 'overview'
  | 'products'
  | 'categories'
  | 'product-configs'
  | 'scans'
  | 'plans'
  | 'subscriptions'
  | 'access'
  | 'api-keys'
  | 'blog'
  | 'settings'
  | 'revenue';

export type AdminAuthUser = {
  app_metadata?: { role?: string | null };
  user_metadata?: { role?: string | null };
} | null;

export const adminSections: AdminSection[] = [
  'overview',
  'products',
  'categories',
  'product-configs',
  'scans',
  'plans',
  'subscriptions',
  'access',
  'api-keys',
  'blog',
  'settings',
  'revenue',
];

function normalizeRole(value?: string | null): AdminRole | null {
  const role = value?.toLowerCase().trim();
  if (!role) return null;
  return role === 'admin' ? 'admin' : null;
}

export function getAdminRole(user: AdminAuthUser): AdminRole | null {
  if (!user) return null;

  return normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);
}

export function isAdminUser(user: AdminAuthUser) {
  return getAdminRole(user) !== null;
}

export function getAdminSections(role: AdminRole | null) {
  if (role !== 'admin') return [];
  return adminSections;
}

export function canAccessAdminSection(role: AdminRole | null, _section: AdminSection) {
  return role === 'admin';
}

export function getAdminRoleLabel(role: AdminRole | null) {
  return role === 'admin' ? 'Admin' : 'User';
}
