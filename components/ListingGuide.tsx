import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import JsonLd from './JsonLd';
import { faqJsonLd } from '../lib/cutoffs';
import type { ListingSummary } from '../lib/listings';
import { courseListingHref } from '../lib/listings';

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

  const intro = total === 0
    ? `College Decision does not currently list any published ${label} colleges in ${loc}. This snapshot is kept so the page stays honest about empty records; it does not invent colleges, fees or exams.`
    : placeKind === 'india'
      ? `College Decision lists ${total.toLocaleString('en-IN')} published ${label} colleges in India.${typeBit ? ` ${typeBit[0].toUpperCase()}${typeBit.slice(1)} institutes appear in the directory.` : ''}${stateBit ? ` The states with the most listings in our records are ${stateBit}.` : ''}${cityBit ? ` The cities with the most listings are ${cityBit}.` : ''} ${feeBit}`
      : `College Decision lists ${total.toLocaleString('en-IN')} published ${label} colleges in ${loc}.${typeBit ? ` Of these, ${typeBit}.` : ''}${cityBit ? ` The largest clusters in our records are ${cityBit}.` : ''} ${feeBit}`;

  const faqs = [
    {
      question: `How many ${label} colleges are there in ${loc}?`,
      answer: total === 0
        ? `We do not currently list any published ${label} colleges in ${loc}. Official or state directories may still show programmes that are not yet live on College Decision.`
        : `We currently list ${total.toLocaleString('en-IN')} published ${label} colleges in ${loc}. The count is only of colleges that are live on College Decision with an active ${label} programme, so official or state directories may show a different total.`
    },
    ...(typeBit && total > 0 ? [{ question: `Are ${label} colleges in ${loc} mostly private or public?`, answer: `In this listing, ${typeBit} ${label} colleges are published. Institute type comes from our college records and should be checked against the official college or university page.` }] : []),
    ...(summary.fees && summary.fees.n >= 3
      ? [{ question: `What is the fee range for ${label} colleges in ${loc}?`, answer: `For the ${summary.fees.n.toLocaleString('en-IN')} colleges that publish an annual Total Fees figure, the median is ${inr(summary.fees.median || 0)} and the recorded range is ${inr(summary.fees.min)} to ${inr(summary.fees.max)}. Fees change by quota and year — confirm the current brochure before you apply.` }]
      : [{ question: `Where can I find fees for ${label} colleges in ${loc}?`, answer: summary.fees && summary.fees.n > 0
        ? `A published annual fee is available for only ${summary.fees.n.toLocaleString('en-IN')} college${summary.fees.n === 1 ? '' : 's'} in this list, which is too few for a reliable typical figure. Open the college profile and the official site for the latest fee notice.`
        : `No published annual Total Fees figure is stored for ${label} colleges in ${loc} yet. Open a college profile, if one is listed, and confirm the official fee notice.` }]),
    ...(topStates.length && placeKind === 'india' ? [{ question: `Which states have the most ${label} colleges on this list?`, answer: `Based on published profiles, the states with the most ${label} colleges here are ${listNames(topStates)}.` }] : []),
    ...(topCities.length ? [{ question: `Which cities in ${loc} have the most ${label} colleges?`, answer: `Based on published profiles, the cities with the most ${label} colleges here are ${listNames(topCities)}.` }] : []),
    ...(exams.length ? [{ question: `Which entrance exams are mapped to ${label} colleges in ${loc}?`, answer: `In our records, published ${label} programmes in ${loc} are mapped to ${listNames(exams)}. Confirm the exam actually used in the latest official admission notice, because mappings can lag behind a new counselling cycle.` }] : []),
    { question: `How should I shortlist a ${label} college in ${loc}?`, answer: total === 0
      ? `Until published ${label} colleges appear in this directory, start from the official counselling or university list for ${loc}, then confirm eligibility, fees and recognition on the official college site.`
      : `Start with the course and eligibility on the official site, then compare published fees, entrance tests accepted, and location. Use the ${label} course guide for the academic pattern, and treat placement figures as historical records, not a promise.` }
  ];
  const faqLd = faqJsonLd(faqs);
  const nearby = siblingStates.filter((s) => s.stateSlug !== stateSlug).slice(0, 8);

  return (
    <section className="cutoff-section listing-guide">
      {faqLd && <JsonLd data={faqLd} />}
      <h2>{label} colleges in {loc}: at a glance</h2>
      <p>{intro}</p>
      <div className="detail-table-wrap">
        <table className="detail-table">
          <caption className="muted">{label} listing snapshot on College Decision ({year})</caption>
          <tbody>
            <tr><th scope="row">Published colleges</th><td>{total.toLocaleString('en-IN')}</td></tr>
            {(summary.privateCount || summary.publicCount) ? <tr><th scope="row">Private / public</th><td>{summary.privateCount.toLocaleString('en-IN')} / {summary.publicCount.toLocaleString('en-IN')}</td></tr> : null}
            {topStates.length && placeKind === 'india' ? <tr><th scope="row">States with most listings</th><td>{listNames(topStates)}</td></tr> : null}
            {topCities.length ? <tr><th scope="row">Cities with most listings</th><td>{listNames(topCities)}</td></tr> : null}
            {exams.length ? <tr><th scope="row">Exams mapped in this list</th><td>{exams.map((exam, i) => <span key={exam.slug}>{i ? ', ' : ''}<Link href={`/exams/${exam.slug}`}>{exam.name}</Link> ({exam.count.toLocaleString('en-IN')})</span>)}</td></tr> : null}
            {summary.fees && summary.fees.n >= 3 ? <tr><th scope="row">Annual fee (published sample)</th><td>Median {inr(summary.fees.median || 0)} · {inr(summary.fees.min)}–{inr(summary.fees.max)} ({summary.fees.n.toLocaleString('en-IN')} colleges)</td></tr> : <tr><th scope="row">Annual fee</th><td>{total === 0 ? 'No colleges are listed, so no fee range is shown' : 'Too few published fee records for a range'}</td></tr>}
            {directoryColleges.length ? <tr><th scope="row">Colleges listed first in this directory</th><td>{directoryColleges.map((college, i) => {
              const place = [college.city, college.state].filter(Boolean).join(', ');
              return <span key={college.slug}>{i ? '; ' : ''}<Link href={`/colleges/${college.slug}`}>{college.name}</Link>{place ? ` (${place})` : ''}</span>;
            })}</td></tr> : null}
          </tbody>
        </table>
      </div>
      <h2>How to choose a {label} college in {loc}</h2>
      {total === 0
        ? <p>There are no published {label} colleges in {loc} on this page yet, so there is no directory shortlist to work from. Use an official counselling or university list, then confirm recognition, eligibility and fees with the college.</p>
        : <>
          <p>Use the directory below to open profiles, then confirm every figure with the college. A useful shortlist usually checks:</p>
          <ul>
            <li>Whether the {label} programme is the exact award you want (honours, specialisation, duration) and is currently offered.</li>
            <li>Entrance tests or merit routes actually used for the latest admission cycle — not just historic exam names on a profile.</li>
            <li>The official fee schedule for your quota, including hostel and one-time charges that a “total fees” row may omit.</li>
            <li>Location and daily commute or hostel, especially if the listing is spread across several cities.</li>
          </ul>
        </>}
      {placeKind === 'india'
        ? <p>See the <Link href={`/courses/${courseSlug}`}>{label} course guide</Link> for eligibility and subject pattern{nearby.length ? ', and the related state lists below if you want to compare in one state' : ''}.</p>
        : <p>See the <Link href={`/courses/${courseSlug}`}>{label} course guide</Link> for eligibility and subject pattern, and the all-India <Link href={courseListingHref(courseKey)}>{label} college list</Link> if you want to compare outside {loc}.</p>}
      {nearby.length ? <p>Related state lists: {nearby.map((s, i) => <span key={s.stateSlug}>{i ? ', ' : ''}<Link href={s.href}>{label} colleges in {s.stateName}</Link></span>)}.</p> : null}
      <h2>{label} colleges in {loc}: FAQs</h2>
      <div className="cp-faq">{faqs.map((f) => <details className="cp-faq-item" key={f.question}><summary><h3>{f.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{f.answer}</p></details>)}</div>
    </section>
  );
}
