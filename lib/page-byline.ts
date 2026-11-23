export const TEAM_BYLINE = 'CollegeDecision Editorial Team';
export const ORG_AUTHOR_NAME = 'CollegeDecision.in';

const IST_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function formatLastUpdatedIst(input: string | Date | null | undefined): { label: string; dateTime: string } | null {
  if (input == null || input === '') return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const isoParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Calcutta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date).map((part) => [part.type, part.value])
  );
  const month = IST_MONTHS[Number(isoParts.month) - 1];
  if (!isoParts.day || !month || !isoParts.year) return null;
  const day = String(Number(isoParts.day));
  return {
    label: `${day} ${month} ${isoParts.year}`,
    dateTime: `${isoParts.year}-${isoParts.month}-${isoParts.day}`
  };
}

export function jsonLdAuthor(personName?: string | null) {
  const name = personName?.trim();
  if (name) return { '@type': 'Person' as const, name };
  return { '@type': 'Organization' as const, name: ORG_AUTHOR_NAME };
}
