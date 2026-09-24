import { api } from './api';
import type { LinkableEntity } from './auto-link-entities';
import { flattenLinkableEntities, findPublishedHref, findPublishedHrefByName } from './auto-link-entities';

export type { LinkableEntity };
export { findPublishedHref, findPublishedHrefByName };

type LinkableEntitiesResponse = {
  data: {
    exams: LinkableEntity[];
    courses: LinkableEntity[];
  };
};

export async function getLinkableEntities(): Promise<LinkableEntity[]> {
  try {
    const response = await api<LinkableEntitiesResponse>('/seo/linkable-entities', {
      next: { revalidate: 300, tags: ['seo:linkable-entities'] }
    });
    return flattenLinkableEntities(response.data);
  } catch {
    return [];
  }
}
