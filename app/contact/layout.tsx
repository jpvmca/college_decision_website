import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact CollegeDecision.in',
  description: 'Contact CollegeDecision.in to report an outdated college fee, course detail, admission rule or source.',
  alternates: { canonical: '/contact' }
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
