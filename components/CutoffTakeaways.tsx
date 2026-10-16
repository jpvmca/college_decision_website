import type { ExamCutoffResponse } from './Cutoffs';

type Row = ExamCutoffResponse['data'][number];

const IIM = /\bIIM\b|^Indian Institute of Management(?!\s+(and|Sciences|Studies|Training))/i;
const fmt = (v: number) => String(Number(v.toFixed(2)));
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
/** Short readable name: "IIM Rohtak", "IIT Madras"; falls back to the full display name. */
const shortName = (r: Row) => {
  const n = r.institute_name;
  const tag = n.match(/\b(II[MT])\s+([A-Z][a-z]+)/);
  if (tag) return `${tag[1]} ${tag[2]}`;
  if (IIM.test(n)) { const place = n.split(',').pop()?.trim() || r.city || ''; return place && !IIM.test(place) ? `IIM ${place}` : n; }
  return n.replace(/,\s*[^,]+$/, '').trim();
};

/**
 * "Key takeaways" for a percentile exam year page, computed only from the rows in our own table (never copied text).
 * Returns null when there is too little data to say anything useful.
 */
export default function CutoffTakeaways({ name, examYear, rows }: { name: string; examYear: number; rows: Row[] }) {
  const general = rows.map((r) => ({ r, v: Number(r.qualifying?.overall?.OPEN ?? r.best_value) })).filter((x) => Number.isFinite(x.v) && x.v > 0);
  if (general.length < 3) return null;
  const sorted = [...general].sort((a, b) => b.v - a.v);
  const top = sorted[0].v;
  const atTop = sorted.filter((x) => x.v === top).map((x) => shortName(x.r));
  const iim = general.filter((x) => IIM.test(x.r.institute_name)).map((x) => x.v);
  const other = general.filter((x) => !IIM.test(x.r.institute_name)).map((x) => x.v);
  const gaps = (code: string) => rows.map((r) => { const o = r.qualifying?.overall; return o && o.OPEN && o[code] ? o.OPEN - o[code] : null; }).filter((g): g is number => g !== null);
  const sc = gaps('SC'), st = gaps('ST');
  const reported = rows.filter((r) => r.qualifying?.source_flag === 'source_aggregator' || r.best?.cutoff_type === 'reported').length;
  const points: string[] = [];
  points.push(`The highest General-category overall figure on this page is ${fmt(top)} percentile (${atTop.slice(0, 3).join(', ')}${atTop.length > 3 ? ` and ${atTop.length - 3} more` : ''}). Half of the ${general.length} colleges with an overall figure ask for ${fmt(sorted[Math.floor((sorted.length - 1) / 2)].v)} or more.`);
  if (iim.length >= 2 && other.length >= 2) {
    const d = avg(iim) - avg(other);
    points.push(`IIMs average ${fmt(avg(iim))} for General candidates against ${fmt(avg(other))} for the other colleges listed${Math.abs(d) < 1 ? ', so the two groups are close' : d > 0 ? `, about ${fmt(d)} points higher` : `, about ${fmt(-d)} points lower`}.`);
  }
  else if (iim.length && !other.length) points.push(`Every college listed for ${name} ${examYear} is an IIM, so this year does not yet compare IIMs with other schools.`);
  if (sc.length >= 3) points.push(`Reserved categories have lower thresholds: on average ${fmt(avg(sc))} points lower for SC${st.length >= 3 ? ` and ${fmt(avg(st))} points lower for ST` : ''} than for General at the same college.`);
  points.push(`For a student, these figures are mostly the line to clear before a college looks at the rest of your profile. Clearing one does not guarantee an interview call, so aim a few percentile points above it and check the college's own policy.`);
  return <section className="cutoff-section cutoff-takeaways">
    <h2>{name} {examYear} cutoff: key takeaways</h2>
    <ul>{points.map((p) => <li key={p.slice(0, 40)}>{p}</li>)}</ul>
    {reported > 0 && <p className="muted">{reported === 1 ? 'One college’s figures are' : `${reported} colleges’ figures are`} reported by secondary publications (marked in the table), not taken from the institute’s own document.</p>}
  </section>;
}
