import type { Metadata } from 'next';
import { SAATHI_HREF, SAATHI_NAME } from '../../lib/site-nav';
import CdSaathiPageClient from '../../components/cd-saathi/CdSaathiPageClient';
import './saathi.css';

export const metadata: Metadata = {
  title: `${SAATHI_NAME} | AI college counsellor`,
  description:
    'Chat with CollegeDecision Saathi for college shortlists, fees, exams and courses from published records — with logos, placements and entrance exams on each card.',
  alternates: { canonical: SAATHI_HREF }
};

const HOW_TO_USE = [
  {
    title: 'Name a city first',
    text: 'Try “show me Lucknow colleges” or “top colleges in Pune”. Saathi shortlists from published records for that place — no guessing other cities.'
  },
  {
    title: 'Add course, exam or budget',
    text: 'Follow up with MBA, BTech, CAT, JEE, or “fees under ₹10L”. Each message tightens the shortlist instead of starting over.'
  },
  {
    title: 'Ask about one college',
    text: 'Paste a full college name for fees, exams, type and placements from our records. Cards show logos and key facts when available.'
  },
  {
    title: 'Use chips, then counselling',
    text: 'Tap the suggestion chips under replies. When you’re ready for human help, choose counselling — it opens the same enquiry form used on the site.'
  }
];

const FAQS = [
  {
    q: 'What is CollegeDecision Saathi?',
    a: 'CollegeDecision Saathi is our AI college buddy on CollegeDecision.in. It helps you explore colleges, courses, exams, fees and placements using published records — then points you to counselling when you want a human conversation.'
  },
  {
    q: 'Are the shortlists official rankings?',
    a: 'No. Shortlists are ranked from our published fees, placement and popularity signals for your filters. They are not NIRF or counselling allotment lists. Always confirm current details with the college or exam authority.'
  },
  {
    q: 'Why do some cards show a logo and others don’t?',
    a: 'Logos appear when the institute has one on file. If a logo is missing, Saathi still shows the college name and available facts (fees, exams, placement, type).'
  },
  {
    q: 'Can Saathi guarantee admission or placement?',
    a: 'No. Saathi shares verified information from our database to help you compare options. Admission seats, cutoffs and packages change every year — confirm on official sources before you decide.'
  },
  {
    q: 'Is chatting free? Do you sell my data?',
    a: 'Using Saathi on CollegeDecision.in is free for students researching options. We use first-party journey analytics to improve the product; we do not sell your browsing data. See our privacy policy for details.'
  },
  {
    q: 'When should I talk to a counsellor?',
    a: 'When you want personalised guidance, document checks, or help shortlisting against your rank, budget and city — tap “Yes, for counselling” in chat or use Find your best-fit college from the header.'
  }
];

export default function SaathiPage() {
  return (
    <main className="saathi-page">
      <section className="saathi-hero">
        <div className="wrap saathi-hero-inner">
          <div className="saathi-title-row">
            <h1>{SAATHI_NAME}</h1>
            <span className="saathi-kicker">College Decision AI buddy</span>
          </div>
        </div>
      </section>

      <section className="saathi-chat-section" aria-label={`${SAATHI_NAME} chat`}>
        <div className="wrap">
          <CdSaathiPageClient />
        </div>
      </section>

      <section className="saathi-below" aria-label="About Saathi">
        <div className="wrap">
          <p className="saathi-lead">
            Ask for colleges by city, compare fees and exams, or explore a course path. Answers stay grounded in our
            published records — with logos, placements and entrance exams on each card.
          </p>

          <div className="saathi-block">
            <h2>How to use</h2>
            <p className="saathi-block-lead">A few habits that get the best shortlists from Saathi.</p>
            <ol className="saathi-how">
              {HOW_TO_USE.map((item, i) => (
                <li key={item.title}>
                  <span className="saathi-how-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="saathi-block">
            <h2>FAQs</h2>
            <p className="saathi-block-lead">Quick answers before you start chatting.</p>
            <div className="saathi-faq">
              {FAQS.map((faq, index) => (
                <details className="saathi-faq-item" key={faq.q} open={index === 0}>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
