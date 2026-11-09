// Pure helpers for the Transaction Vault, Goals and Dashboard figures (kept testable).
import type { PaypalTransaction, SavingsGoal } from '@/lib/ledger';

export type DateRange = 'all' | '7d' | '30d' | '90d';

const RANGE_DAYS: Record<Exclude<DateRange, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** Keeps transactions created within the last N days of `now` (inclusive). */
export function filterByDateRange<T extends Pick<PaypalTransaction, 'created_at'>>(rows: T[], range: DateRange, now: Date): T[] {
  if (range === 'all') return rows;
  const cutoff = now.getTime() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
  return rows.filter((row) => new Date(row.created_at).getTime() >= cutoff);
}

export interface TimelineStep {
  label: string;
  at: string | null;
  state: 'done' | 'current' | 'failed' | 'upcoming';
}

/** Status timeline for one PayPal order: started -> approved/capturing -> verified (or the end state). */
export function buildTimeline(tx: Pick<PaypalTransaction, 'status' | 'created_at' | 'updated_at' | 'captured_at'>): TimelineStep[] {
  const started: TimelineStep = { label: 'Order started', at: tx.created_at, state: 'done' };
  switch (tx.status) {
    case 'completed':
      return [started, { label: 'Approved on PayPal', at: null, state: 'done' }, { label: 'Verified by server', at: tx.captured_at ?? tx.updated_at, state: 'done' }];
    case 'refunded':
      return [started, { label: 'Verified by server', at: tx.captured_at, state: 'done' }, { label: 'Refunded', at: tx.updated_at, state: 'failed' }];
    case 'cancelled':
      return [started, { label: 'Cancelled', at: tx.updated_at, state: 'failed' }];
    case 'failed':
      return [started, { label: 'Payment failed', at: tx.updated_at, state: 'failed' }];
    case 'capturing':
    case 'pending':
      return [started, { label: 'Approved on PayPal', at: tx.updated_at, state: 'done' }, { label: 'Waiting for verification', at: null, state: 'current' }];
    default:
      return [started, { label: 'Waiting for PayPal approval', at: null, state: 'current' }, { label: 'Verified by server', at: null, state: 'upcoming' }];
  }
}

/** Splits goals into active and completed lists. */
export function splitGoals<T extends Pick<SavingsGoal, 'completed_at'>>(goals: T[]): { active: T[]; completed: T[] } {
  return { active: goals.filter((goal) => !goal.completed_at), completed: goals.filter((goal) => goal.completed_at) };
}
