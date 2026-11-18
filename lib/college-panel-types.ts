/** Shapes returned by the backend college panel API (/api/v1/college/*). */
export type ChangeItem = {
  id: number;
  entity_type: string;
  entity_id: number | null;
  field_name: string;
  action: 'update' | 'create' | 'delete';
  label: string | null;
  old_value: unknown;
  new_value: unknown;
  status: string;
};

export type ChangeRequest = {
  id: number;
  institute_id: number;
  section: string;
  status: string;
  summary: string | null;
  note: string | null;
  review_reason: string | null;
  requested_by_email: string;
  created_at: string;
  reviewed_at: string | null;
  applied_at: string | null;
  items?: ChangeItem[];
  item_count?: number;
};

export type SectionResponse<L> = { data: { section: string; label: string; live: L; pending: (ChangeRequest & { items: ChangeItem[] }) | null; pendingText: string | null; pendingHtml?: string | null } };

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Waiting for review',
  approved: 'Approved · live',
  partially_approved: 'Partly approved',
  rejected: 'Not approved',
  withdrawn: 'Withdrawn',
  superseded: 'Replaced by a newer request'
};

export const SECTION_LABEL: Record<string, string> = {
  about: 'About', contact: 'Contact details', admissions: 'Admissions', gallery: 'Photo gallery', logo: 'Logo', courses: 'Courses',
  fees: 'Fees', exams: 'Entrance exams', placements: 'Placements', recruiters: 'Recruiters', faculty: 'Faculty'
};

export function formatIst(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })} IST`;
}
