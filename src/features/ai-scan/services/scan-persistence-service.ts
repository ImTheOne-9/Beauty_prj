import { type ScanResult } from "@/shared/lib/types";
import { dependencies } from '@/app/providers/DependencyProvider';

export async function persistScan(userId: string, result: ScanResult) {
  return dependencies.useCases.scans.persistScan(userId, result);
}
