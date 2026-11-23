import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import JsonLd from './JsonLd';
import CollapsibleContent from './CollapsibleContent';
import { faqJsonLd } from '../lib/cutoffs';
import type { ListingSummary } from '../lib/listings';
import { courseListingHref } from '../lib/listings';
import { listingContentHeadings, listingSeoCourseName } from '../lib/listing-seo';

function inr(n: number) {
  if (n >= 100000) {
    const lakh = Math.round((n / 100000) * 10) / 10;
    return `₹${lakh.toLocaleString('en-IN')} lakh`;
  }
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function listNames(items: Array<{ name: string; count?: number }>, withCounts = true) {
  return items
    .map((item) => (withCounts && typeof item.count === 'number' ? `${item.name} (${item.count.toLocaleString('en-IN')})` : item.name))
    .join(', ');
}

export default function ListingGuide({
  label,
  courseSlug,
  courseKey,
  placeName,
  placeKind,
  stateSlug,
  siblingStates,
  summary,
  year
}: {
  label: string;
  courseSlug: string;
  courseKey: string;
  placeName: string;
  placeKind: 'state' | 'city' | 'india';
  stateSlug?: string | null;
  siblingStates: Array<{ stateSlug: string; stateName: string; count: number | string; href: string }>;
  summary: ListingSummary;
  year: number;
}) {
  const total = Number(summary.total || 0);
  const loc = placeKind === 'india' ? 'India' : placeName;
  const topCities = (summary.cities || []).slice(0, 6);
  const topStates = (summary.states || []).slice(0, 6);
  const exams = (summary.exams || []).slice(0, 6);
  const directoryColleges = (summary.topColleges || []).slice(0, 5);
  const cityBit = topCities.length ? listNames(topCities.slice(0, 4)) : '';
  const stateBit = topStates.length ? listNames(topStates.slice(0, 4)) : '';
  const typeBit = summary.privateCount || summary.publicCount
    ? `${summary.privateCount.toLocaleString('en-IN')} private and ${summary.publicCount.toLocaleString('en-IN')} public`
    : '';
  const feeBit = summary.fees && summary.fees.n >= 3
    ? `Among ${summary.fees.n.toLocaleString('en-IN')} colleges with a published annual “Total Fees” figure, the median is ${inr(summary.fees.median || 0)} (range ${inr(summary.fees.min)}–${inr(summary.fees.max)}).`
    : summary.fees && summary.fees.n > 0
      ? `Only ${summary.fees.n.toLocaleString('en-IN')} college${summary.fees.n === 1 ? '' : 's'} in this list currently have a published annual fee, so we do not quote a typical range.`
      : 'Most colleges in this list have not published an annual fee on College Decision yet; confirm fees on the official website.';

  const courseName = listingSeoCourseName(courseKey, label);
  const scope = placeKind === 'india' ? 'national' : placeKind;
  const headings = listingContentHeadings(courseName, loc, scope, year, courseKey);
  const isOnlineMba = courseKey === 'online-mba';
  const typeSentence = typeBit
    ? (placeKind === 'india'
      ? ` ${typeBit[0].toUpperCase()}${typeBit.slice(1)} institutes appear in this list.`
      : ` Of these, ${typeBit}.`)
    : '';
  const introParagraphs = (() => {
    if (total === 0) {
      return [`This page does not currently list any published ${courseName} colleges in ${loc}. The snapshot is kept so the record stays honest; it does not invent colleges, fees or exams.`];
    }
    if (isOnlineMba && placeKind === 'india') {
      const paras: string[] = [];
      paras.push(`This snapshot covers the ${total.toLocaleString('en-IN')} published Online MBA colleges in India on this list.${typeSentence}`);
      paras.push(`These are online or blended programmes. The city or state beside a name is usually the university's registered office, not a campus you need to relocate to.`);
      if (stateBit) paras.push(`In our records the listings are spread across ${stateBit}, among other states, each with only a small number of published profiles.`);
      paras.push('Only three colleges on this list currently have a published total fee, and those three are Online PGDM records (MDI Gurgaon, Great Lakes Gurgaon and IMI Bhubaneswar). That is too thin to quote a typical Online MBA fee range.');
      return paras.filter((paragraph) => paragraph && paragraph.trim());
    }
    const paras: string[] = [];
    if (placeKind === 'india') {
      paras.push(`The table below is a snapshot of the ${total.toLocaleString('en-IN')} published ${courseName} colleges in India on this list.${typeSentence}`);
      if (stateBit && cityBit) paras.push(`The states with the most listings in our records are ${stateBit}. The busiest cities on the list are ${cityBit}.`);
      else if (stateBit) paras.push(`The states with the most listings in our records are ${stateBit}.`);
      else if (cityBit) paras.push(`The cities with the most listings are ${cityBit}.`);
    } else if (placeKind === 'state') {
      paras.push(`${total.toLocaleString('en-IN')} published ${courseName} colleges in ${loc} appear in this snapshot.${typeSentence}`);
      if (cityBit) paras.push(`The largest clusters in our records are ${cityBit}.`);
    } else {
      paras.push(`Here is a snapshot of the ${total.toLocaleString('en-IN')} published ${courseName} colleges in ${loc} that are on this page.${typeSentence}`);
    }
    paras.push(feeBit);
    return paras.filter((paragraph) => paragraph && paragraph.trim());
  })();

  const faqs = [
    {
      question: `How many ${courseName} colleges are there in ${loc}?`,
      answer: total === 0
        ? `We do not currently list any published ${courseName} colleges in ${loc}. Official or state lists may still show programmes that are not yet live on College Decision.`
        : `We currently list ${total.toLocaleString('en-IN')} published ${courseName} colleges in ${loc}. The count is only of colleges that are live on College Decision with an active ${courseName} programme, so official or state lists may show a different total.`
    },
    ...(typeBit && total > 0 ? [{ question: `Are ${courseName} colleges in ${loc} mostly private or public?`, answer: `In this listing, ${typeBit} ${courseName} colleges are published. Institute type comes from our college records and should be checked against the official college or university page.` }] : []),
    ...(isOnlineMba
      ? [{ question: `Where can I find fees for Online MBA colleges in India?`, answer: `A published annual total fee is available for only three colleges in this list, and those three are Online PGDM records (MDI Gurgaon, Great Lakes Gurgaon and IMI Bhubaneswar). That is not enough, and not the right mix, to quote a typical Online MBA fee. Open the official university fee notice before you apply.` }]
      : summary.fees && summary.fees.n >= 3
      ? [{ question: `What is the fee range for ${courseName} colleges in ${loc}?`, answer: `For the ${summary.fees.n.toLocaleString('en-IN')} colleges that publish an annual Total Fees figure, the median is ${inr(summary.fees.median || 0)} and the recorded range is ${inr(summary.fees.min)} to ${inr(summary.fees.max)}. Fees change by quota and year — confirm the current brochure before you apply.` }]
      : [{ question: `Where can I find fees for ${courseName} colleges in ${loc}?`, answer: summary.fees && summary.fees.n > 0
        ? `A published annual fee is available for only ${summary.fees.n.toLocaleString('en-IN')} college${summary.fees.n === 1 ? '' : 's'} in this list, which is too few for a reliable typical figure. Open the college profile and the official site for the latest fee notice.`
        : `No published annual Total Fees figure is stored for ${courseName} colleges in ${loc} yet. Open a college profile, if one is listed, and confirm the official fee notice.` }]),
    ...(topStates.length && placeKind === 'india' ? [{ question: `Which states have the most ${courseName} colleges on this list?`, answer: `Based on published profiles, the states with the most ${courseName} colleges here are ${listNames(topStates)}.` }] : []),
    ...(topCities.length ? [{ question: `Which cities in ${loc} have the most ${courseName} colleges?`, answer: `Based on published profiles, the cities with the most ${courseName} colleges here are ${listNames(topCities)}.` }] : []),
    ...(exams.length ? [{ question: `Which entrance exams are mapped to ${courseName} colleges in ${loc}?`, answer: `In our records, published ${courseName} programmes in ${loc} are mapped to ${listNames(exams)}. Confirm the exam actually used in the latest official admission notice, because mappings can lag behind a new counselling cycle.` }] : []),
    ...(isOnlineMba ? [{
      question: `How do I check if an Online MBA college in India is UGC-DEB entitled?`,
      answer: `We do not store a UGC-DEB flag on this listing yet. Open the official UGC-DEB entitled higher educational institutions list and match the university name for the current academic year before you pay a fee. An Online PGDM, where one is listed, follows a different approval route (typically AICTE) and is not the same as a UGC-entitled Online MBA degree.`
    }] : []),
    { question: `How should I shortlist a ${courseName} college in ${loc}?`, answer: total === 0
      ? `Until published ${courseName} colleges appear on this page, start from the official counselling or university list for ${loc}, then confirm eligibility, fees and recognition on the official college site.`
      : isOnlineMba
        ? `Start with UGC-DEB entitlement on the official list, the exact award (Online MBA or Online PGDM), and eligibility for the latest cycle. Then compare published fees where they exist, and confirm every figure on the official site. Treat placement claims as marketing unless the university publishes a verifiable record.`
        : `Start with the course and eligibility on the official site, then compare published fees, entrance tests accepted, and location. Use the ${courseName} course guide for the academic pattern, and treat placement figures as historical records, not a promise.` }
  ];
  const faqLd = faqJsonLd(faqs);
  const nearby = siblingStates.filter((s) => s.stateSlug !== stateSlug).slice(0, 8);

  return (
    <section className="cutoff-section listing-guide is-compact">
      {faqLd && <JsonLd data={faqLd} />}
      <CollapsibleContent collapsedHeight={150}>
      <h2>{headings.snapshot}</h2>
      {introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <div className="detail-table-wrap">
        <table className="detail-table">
          <caption className="muted">{courseName} listing snapshot on College Decision ({year})</caption>
          <tbody>
            <tr><th scope="row">Published colleges</th><td>{total.toLocaleString('en-IN')}</td></tr>
            {(summary.privateCount || summary.publicCount) ? <tr><th scope="row">Private / public</th><td>{summary.privateCount.toLocaleString('en-IN')} / {summary.publicCount.toLocaleString('en-IN')}</td></tr> : null}
            {topStates.length && placeKind === 'india' ? <tr><th scope="row">States with most listings</th><td>{listNames(topStates)}</td></tr> : null}
            {topCities.length ? <tr><th scope="row">Cities with most listings</th><td>{listNames(topCities)}</td></tr> : null}
            {exams.length ? <tr><th scope="row">Exams mapped in this list</th><td>{exams.map((exam, i) => <span key={exam.slug}>{i ? ', ' : ''}<Link prefetch={false} href={`/exams/${exam.slug}`}>{exam.name}</Link> ({exam.count.toLocaleString('en-IN')})</span>)}</td></tr> : null}
            {isOnlineMba ? <tr><th scope="row">Annual fee</th><td>{total === 0 ? 'No colleges are listed, so no fee range is shown' : 'Only 3 published total-fee records, all Online PGDM (MDI Gurgaon, Great Lakes Gurgaon, IMI Bhubaneswar) — not quoted as a typical Online MBA range'}</td></tr> : summary.fees && summary.fees.n >= 3 ? <tr><th scope="row">Annual fee (published sample)</th><td>Median {inr(summary.fees.median || 0)} · {inr(summary.fees.min)}–{inr(summary.fees.max)} ({summary.fees.n.toLocaleString('en-IN')} colleges)</td></tr> : <tr><th scope="row">Annual fee</th><td>{total === 0 ? 'No colleges are listed, so no fee range is shown' : 'Too few published fee records for a range'}</td></tr>}
            {directoryColleges.length ? <tr><th scope="row">Colleges listed first on this page</th><td>{directoryColleges.map((college, i) => {
              const place = [college.city, college.state].filter(Boolean).join(', ');
              return <span key={college.slug}>{i ? '; ' : ''}<Link prefetch={false} href={`/colleges/${college.slug}`}>{college.name}</Link>{place ? ` (${place})` : ''}</span>;
            })}</td></tr> : null}
          </tbody>
        </table>
      </div>
      <h2>{headings.choose}</h2>
      {total === 0
        ? <p>There are no published {courseName} colleges in {loc} on this page yet, so there is no shortlist to work from. Use an official counselling or university list, then confirm recognition, eligibility and fees with the college.</p>
        : isOnlineMba ? <>
          <p>Use the list below to open profiles, then confirm every figure with the university. A useful shortlist for the best Online MBA colleges in India usually checks:</p>
          <ul>
            <li>Whether the university is on the current official UGC-DEB entitled list for online programmes. We do not store a DEB flag here, so this check has to be done on the official list for the current academic year.</li>
            <li>The exact award on the official site. Some profiles in this listing are Online PGDM, which is not the same as a UGC-entitled Online MBA degree and typically follows an AICTE approval route instead.</li>
            <li>Eligibility for the latest cycle — graduation marks, work-experience rules, and whether a test or interview is required.</li>
            <li>The official fee notice, including examination and first-semester charges. A “total fees” row on a profile can be incomplete or missing.</li>
          </ul>
        </> : <>
          <p>{placeKind === 'city'
            ? 'Open a few profiles from the list, then confirm every figure with the college. A useful city shortlist usually checks:'
            : placeKind === 'state'
              ? 'Use the list below to open profiles, then confirm every figure with the college. A useful state shortlist usually checks:'
              : 'Use the list below to open profiles, then confirm every figure with the college. A useful shortlist usually checks:'}</p>
          <ul>
            <li>Whether the {courseName} programme is the exact award you want (honours, specialisation, duration) and is currently offered.</li>
            <li>Entrance tests or merit routes actually used for the latest admission cycle — not just historic exam names on a profile.</li>
            <li>The official fee schedule for your quota, including hostel and one-time charges that a “total fees” row may omit.</li>
            <li>Location and daily commute or hostel, especially if the listing is spread across several cities.</li>
          </ul>
        </>}
      {placeKind === 'india'
        ? <p>See the <Link prefetch={false} href={`/courses/${courseSlug}`}>{courseName} course guide</Link> for eligibility and subject pattern{nearby.length && !isOnlineMba ? ', and the related state lists below if you want to compare in one state' : ''}.</p>
        : <p>See the <Link prefetch={false} href={`/courses/${courseSlug}`}>{courseName} course guide</Link> for eligibility and subject pattern, and the all-India <Link prefetch={false} href={courseListingHref(courseKey)}>{courseName} college list</Link> if you want to compare outside {loc}.</p>}
      {nearby.length && !isOnlineMba ? <p>Related state lists: {nearby.map((s, i) => <span key={s.stateSlug}>{i ? ', ' : ''}<Link prefetch={false} href={s.href}>{courseName} colleges in {s.stateName}</Link></span>)}.</p> : null}
      <h2>{headings.faqs}</h2>
      <div className="cp-faq">{faqs.map((f) => <details className="cp-faq-item" key={f.question}><summary><h3>{f.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{f.answer}</p></details>)}</div>
      </CollapsibleContent>
    </section>
  );
}
