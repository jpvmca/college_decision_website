'use client';

import CollegeViewDetailsModal from '../../../components/CollegeViewDetailsModal';

type Props = { instituteId: number; courseId: number; courseName: string };

/** Shared college details popup used by article lists and other unpublished college views. */
export default function CollegeDetailsModal({ instituteId, courseId, courseName }: Props) {
  return <CollegeViewDetailsModal instituteId={instituteId} courseId={courseId} courseName={courseName} buttonLabel="View college details" buttonClassName="view-button" />;
}
