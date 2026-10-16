import { NOT_AVAILABLE, rankText } from './cutoff-format';

export type YearRow = {
  program_name: string; round: number; quota: string | null; category_code: string | null; gender_pool: string | null;
  metric_type: string | null; cutoff_type: string | null; opening_rank: number | null; closing_rank: number | null;
  cutoff_score: string | number | null; cutoff_percentile: string | number | null; source_url: string | null; quality_flag: string | null; exam_year: number;
};

const MAIN = [['OPEN', 'General'], ['EWS', 'EWS'], ['OBC_NCL', 'OBC-NCL'], ['SC', 'SC'], ['ST', 'ST']] as const;
const PWD = [['OPEN_PWD', 'General PwD'], ['EWS_PWD', 'EWS PwD'], ['OBC_NCL_PWD', 'OBC-NCL PwD'], ['SC_PWD', 'SC PwD'], ['ST_PWD', 'ST PwD'], ['PWD', 'PwD']] as const;
const QUOTA: Record<string, string> = { AI: 'All India quota', HS: 'Home State quota', OS: 'Other State quota', JK: 'J&K quota', LA: 'Ladakh quota', GO: 'Goa quota', STATE: 'State quota' };
const GENDER: Record<string, string> = { GENDER_NEUTRAL: 'Gender-neutral seats', FEMALE_ONLY: 'Female-only seats (including supernumerary)' };

function cell(r: YearRow | undefined) {
  if (!r) return NOT_AVAILABLE;
  if (r.metric_type === 'score') return r.cutoff_score == null || Number(r.cutoff_score) <= 0 ? NOT_AVAILABLE : String(Number(r.cutoff_score));
  if (r.metric_type === 'percentile') return r.cutoff_percentile == null ? NOT_AVAILABLE : String(Number(r.cutoff_percentile));
  return rankText(r.closing_rank);
}
const group = <T,>(items: T[], key: (t: T) => string) => items.reduce((m, it) => { const k = key(it); (m.get(k) || m.set(k, []).get(k)!).push(it); return m; }, new Map<string, T[]>());

function PivotTable({ rows, cols, caption }: { rows: YearRow[]; cols: ReadonlyArray<readonly [string, string]>; caption: string }) {
  const present = cols.filter(([c]) => rows.some((r) => r.category_code === c));
  if (!present.length) return null;
  const byProg = group(rows, (r) => r.program_name);
  return <div className="detail-table-wrap"><table className="detail-table cutoff-table">
    <caption className="muted">{caption}</caption>
    <thead><tr><th scope="col">Programme</th>{present.map(([, l]) => <th scope="col" key={l}>{l}</th>)}</tr></thead>
    <tbody>{Array.from(byProg, ([prog, list]) => <tr key={prog}><th scope="row">{prog}</th>
      {present.map(([c]) => <td key={c}>{cell(list.find((r) => r.category_code === c))}</td>)}</tr>)}</tbody>
  </table></div>;
}

/** Server-rendered tables for one college + exam + year (final round). */
export default function CollegeCutoffYearTables({ rows, metric }: { rows: YearRow[]; metric: string }) {
  const qualifying = rows.some((r) => /^(qualifying|shortlist|reported)/.test(r.cutoff_type || ''));
  if (qualifying) {
    const cats = [...MAIN, ...PWD].filter(([c]) => rows.some((r) => r.category_code === c));
    const find = (c: string, re: RegExp) => rows.find((r) => r.category_code === c && re.test(r.program_name));
    const hasSplit = rows.some((r) => /(VARC|DILR|QA) sectional/.test(r.program_name));
    const src = rows.find((r) => r.source_url);
    const agg = rows.some((r) => r.quality_flag === 'source_aggregator');
    return <>
      <div className="detail-table-wrap"><table className="detail-table cutoff-table">
        <thead><tr><th scope="col">Category</th><th scope="col">Overall percentile</th>{hasSplit ? <><th scope="col">VARC</th><th scope="col">DILR</th><th scope="col">QA</th></> : <th scope="col">Sectional (each section)</th>}</tr></thead>
        <tbody>{cats.map(([c, l]) => <tr key={c}><th scope="row">{l}</th>
          <td>{cell(find(c, /overall/))}</td>
          {hasSplit ? ['VARC', 'DILR', 'QA'].map((s) => <td key={s}>{cell(find(c, new RegExp(`${s} sectional`)) || find(c, /each of/))}</td>) : <td>{cell(find(c, /each of/))}</td>}
        </tr>)}</tbody></table></div>
      {src?.source_url && <p className="muted">Source: <a href={src.source_url} target="_blank" rel="noopener nofollow">{agg ? 'secondary (aggregator) source*' : 'official institute admission policy'}</a>. {rows.every((r) => r.cutoff_type === 'reported') ? 'These are cutoffs reported by a secondary publication and have not been checked against the institute’s own document.' : 'These are minimum percentiles for shortlisting, not final admission cutoffs.'}</p>}
    </>;
  }
  const label = metric === 'score' ? 'Closing score' : 'Closing rank';
  const byQuota = group(rows, (r) => r.quota || '');
  const qOrder = ['AI', 'OS', 'HS'];
  return <>{Array.from(byQuota).sort(([a], [b]) => ((qOrder.indexOf(a) + 1 || 9) - (qOrder.indexOf(b) + 1 || 9))).map(([quota, qRows]) => <div key={quota || 'all'}>
    {byQuota.size > 1 && <h4>{QUOTA[quota] || quota || 'All seats'}</h4>}
    {Array.from(group(qRows, (r) => r.gender_pool || 'GENDER_NEUTRAL')).sort(([a], [b]) => (a === 'GENDER_NEUTRAL' ? -1 : b === 'GENDER_NEUTRAL' ? 1 : a.localeCompare(b))).map(([g, gRows]) => <div key={g}>
      <PivotTable rows={gRows} cols={MAIN} caption={`${label}s by category · ${GENDER[g] || g}${byQuota.size === 1 && quota ? ` · ${QUOTA[quota] || quota}` : ''}`} />
      <PivotTable rows={gRows} cols={PWD} caption={`${label}s for PwD seats · ${GENDER[g] || g}`} />
    </div>)}
  </div>)}</>;
}
