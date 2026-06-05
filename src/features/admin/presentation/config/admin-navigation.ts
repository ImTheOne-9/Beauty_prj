import {
  BadgeCheck,
  Camera,
  CreditCard,
  DollarSign,
  Key,
  LayoutGrid,
  ListChecks,
  Sparkles,
  Store,
  Users,
  Wrench,
} from 'lucide-react'
import type { AdminSection } from '@/core/entities'

export type AdminNavigationSection = {
  id: AdminSection
  label: string
  description: string
  icon: typeof LayoutGrid
}

export const adminNavigationSections: AdminNavigationSection[] = [
  { id: 'overview', label: 'Overview', description: 'System status and metrics', icon: LayoutGrid },
  { id: 'products', label: 'Products', description: 'Manage goods and catalog', icon: Store },
  { id: 'categories', label: 'Categories', description: 'Manage product categories', icon: ListChecks },
  { id: 'product-configs', label: 'Variants', description: 'Manage product shades and textures', icon: Sparkles },
  { id: 'scans', label: 'Scans', description: 'View scan history and simulation', icon: Camera },
  { id: 'access', label: 'Access', description: 'Roles and permissions', icon: Users },
  { id: 'plans', label: 'Plans', description: 'Manage subscription plans', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', description: 'Manage user subscriptions', icon: BadgeCheck },
  { id: 'api-keys', label: 'API Keys', description: 'Manage API Keys', icon: Key },
  { id: 'settings', label: 'Settings', description: 'Platform and environment', icon: Wrench },
  { id: 'revenue', label: 'Revenue', description: 'Orders and sales', icon: DollarSign },
]
