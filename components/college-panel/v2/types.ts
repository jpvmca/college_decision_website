/** Live data for panel v2 sections (backend getPanelData). Packages are LPA; fees are ₹. */
export type V2Programme = { id: number; name: string; course_name: string; course_id?: number; program_id?: number; duration: number | null; total_seats: number | null; eligibility: string | null; description: string | null };
export type V2Fee = { id: number; programme_id: number; fees_type_id: number; fee_type: string; duration: 'year' | 'semester' | 'total'; value: number; fees: number };
export type V2Placement = { id: number; programme_id: number; year: number; highest_package: number; average_package: number; lowest_package: number };
export type V2Recruiter = { id: number; recruiter_id: number; name: string; year: number | null; highest_package: number | null; average_package: number | null; students_placed: number | null };
export type V2Live = {
  programmes: V2Programme[]; fees: V2Fee[]; placements: V2Placement[]; recruiters: V2Recruiter[];
  feeTypes: Array<{ id: number; name: string }>; tuitionFeeTypeId: number; registrationFeeTypeId: number;
};
export type ProofFile = { id: number; originalName: string; mimeType: string; sizeBytes: number };

export const periodLabel = (d: string, v: number) => (d === 'year' ? `Year ${v}` : d === 'semester' ? `Semester ${v}` : 'Full course');
export const rupees = (n: number | null | undefined) => (n ? `₹${Number(n).toLocaleString('en-IN')}` : '—');
export const lpa = (n: number | null | undefined) => (n && Number(n) > 0 ? `${Number(n)} LPA` : '—');
