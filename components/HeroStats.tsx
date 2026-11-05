import type { LucideIcon } from 'lucide-react';

type Stat = { icon: LucideIcon; value: string; label: string };

/** Overlapping hero stats. Uses divs instead of a definition list so decorative icons stay valid. */
export default function HeroStats({ prefix, stats }: { prefix: 'ls' | 'hp' | 'ex'; stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <div className={`${prefix}-stats`}>
      {stats.map((item) => (
        <div key={item.label}>
          <span className={`${prefix}-stat-icon`} aria-hidden="true"><item.icon size={18} /></span>
          <p className={`${prefix}-stat-value`}>{item.value}</p>
          <p className={`${prefix}-stat-label`}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
