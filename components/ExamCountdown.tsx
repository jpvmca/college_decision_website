'use client';

import { useEffect, useState } from 'react';

function remaining(target: string) {
  const value = new Date(`${target}T00:00:00`).getTime() - Date.now();
  return Math.max(0, Math.ceil(value / 86400000));
}

export default function ExamCountdown({ date }: { date: string }) {
  const [days, setDays] = useState(() => remaining(date));

  useEffect(() => {
    const update = () => setDays(remaining(date));
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [date]);

  if (days <= 0) return null;
  return <span className="exam-countdown" aria-label={`${days} days until the exam`}>Starts in {days} {days === 1 ? 'day' : 'days'}</span>;
}
