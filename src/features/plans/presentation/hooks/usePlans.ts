import { useEffect, useState } from "react";
import { useDependencies } from '@/app/providers/DependencyProvider'

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billing_interval: string;
  scan_limit: number;
  history_days: number;
  description: string | null;
  features: string[];
  badge: string | null;
  is_active: boolean;
}

interface UsePlansResult {
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

export function usePlans(): UsePlansResult {
  const { useCases } = useDependencies()
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    useCases.plans
      .listActivePlans()
      .then((items) => setPlans(items.map((plan) => ({
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        billing_interval: plan.billingInterval,
        scan_limit: plan.scanLimit,
        history_days: plan.historyDays,
        description: plan.description,
        features: plan.features,
        badge: plan.badge,
        is_active: plan.isActive,
      }))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [useCases.plans]);

  return { plans, loading, error };
}
