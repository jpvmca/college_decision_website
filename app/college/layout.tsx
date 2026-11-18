import type { Metadata } from 'next';
import './college-panel.css';
import './college-panel-v3.css';
import './college-support.css';

// The college panel is private: never indexed, never followed.
export const metadata: Metadata = {
  title: { default: 'College panel', template: '%s · College panel | College Decision' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
};

export default function CollegePanelRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
