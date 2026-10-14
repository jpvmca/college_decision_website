import type { CutoffRow } from './Cutoffs';

export const NOT_AVAILABLE = 'Not available';

export function rankText(value: unknown) {
  const n = Number(value);
  return value === null || value === undefined || value === '' || !Number.isFinite(n) || n <= 0 ? NOT_AVAILABLE : Math.round(n).toLocaleString('en-IN');
}
export function cutoffValue(row: Pick<CutoffRow, 'metric_type' | 'closing_rank' | 'cutoff_score' | 'cutoff_percentile'>) {
  if (row.metric_type === 'score') return row.cutoff_score == null ? NOT_AVAILABLE : `${Number(row.cutoff_score)} (score)`;
  if (row.metric_type === 'percentile') return row.cutoff_percentile == null ? NOT_AVAILABLE : `${Number(row.cutoff_percentile)} %ile`;
  return rankText(row.closing_rank);
}

