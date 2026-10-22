'use client';

import { useEffect } from 'react';
import { LEAD_PREFS_EVENT, readPrefs } from '../lib/student-lead';

/**
 * Moves the visitor's interest course group to the top of "Courses and Programmes Offered" and highlights it.
 * Server HTML stays in its normal order (good for indexing); this only adds a class (CSS `order: -1`) after load.
 */
export default function InterestCourseHighlight({ containerId }: { containerId: string }) {
  useEffect(() => {
    const apply = () => {
      const container = document.getElementById(containerId);
      if (!container) return;
      const courseId = readPrefs().courseId;
      container.querySelectorAll<HTMLElement>('.programme-group').forEach((group) => {
        const ids = (group.dataset.courseIds || '').split(',');
        const match = Boolean(courseId) && ids.includes(String(courseId));
        group.classList.toggle('is-interest', match);
        const heading = group.querySelector('h3');
        const tag = heading?.querySelector('.interest-tag');
        if (match && heading && !tag) {
          const span = document.createElement('span');
          span.className = 'interest-tag';
          span.textContent = 'Your interest';
          heading.appendChild(span);
        } else if (!match && tag) tag.remove();
      });
    };
    apply();
    window.addEventListener(LEAD_PREFS_EVENT, apply);
    return () => window.removeEventListener(LEAD_PREFS_EVENT, apply);
  }, [containerId]);
  return null;
}
