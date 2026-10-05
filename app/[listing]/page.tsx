import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';
import { ArrowRight } from 'lucide-react';
import JsonLd from '../../components/JsonLd';
import { breadcrumbJsonLd } from '../../lib/structured-data';
import { api, mediaUrl } from '../../lib/api';
import { getLinkableEntities } from '../../lib/linkable-entities';
import { LISTINGS_CACHE_VERSION, courseListingHref, getCourseFacets, listingFetchOptions, parseCourseListingSegment, type CourseFacet } from '../../lib/listings';
import { CollegeListResults, ListPaginationNav, type ListedCollege, type ListPagination } from '../../components/CollegeListResults';
import LoadMoreColleges from '../../components/LoadMoreColleges';
import { CourseFilterMobileButton, CourseFilterSidebar, type CityPageOption, type StatePageOption } from '../../components/CourseFilterPanel';

/**
 * Course listing pages: /{key}-colleges (e.g. /mba-colleges, /engineering-colleges).
 * Only keys returned by the backend's frozen course key map resolve; everything else 404s.
 * Static top-level routes (/colleges, /compare-colleges, ...) always take precedence over this segment.
 */

type Params = Promise<{ listing: string }>;
type SearchParams = Promise<{ page?: string }>;
type ListingImage = { path: string; width: number; height: number; updatedAt?: string };
type CourseListing = { course: CourseFacet; data: ListedCollege[]; pagination: ListPagination; image?: ListingImage | null; cityPage?: CityPageOption | null };

const PAGE_SIZE = 20;
const CURRENT_YEAR = new Date().getFullYear();

function stateCourseSegment(segment: string) {
  const match = /^(.+)-colleges-in-([a-z0-9-]+)$/.exec(segment);
  return match ? { courseKey: match[1], stateSlug: match[2] } : null;
}

function cityCoursePage(segment: string, facets: CourseFacet[], cityPages: CityPageOption[]) {
  for (const facet of facets) {
    const page = cityPages.find((item) => item.courseSlug === facet.courseSlug && `/${facet.key}-colleges-in-${item.citySlug}-${item.stateSlug}` === `/${segment}`);
    if (page) return { facet, page };
  }
  return null;
}

function humanizeState(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

const getStatePages = cache(async () => api<{ data: StatePageOption[] }>('/colleges/state-pages', listingFetchOptions(['listings:locations'])).catch(() => ({ data: [] })));
const getCityPages = cache(async () => api<{ data: CityPageOption[] }>('/colleges/city-pages', listingFetchOptions(['listings:locations'])).catch(() => ({ data: [] })));

const loadListing = cache(async (segment: string, page: number): Promise<CourseListing | null> => {
  const facets = await getCourseFacets();
  const cityPages = segment.includes('-colleges-in-')
    ? (await getCityPages()).data
    : [];
  const cityMatch = cityCoursePage(segment, facets.data, cityPages);
  const statePage = cityMatch ? null : stateCourseSegment(segment);
  if (cityMatch) {
    const { facet, page: cityPage } = cityMatch;
    try {
      const result = await api<{ data: ListedCollege[]; pagination: ListPagination }>(
        `/colleges?page=${page}&perPage=${PAGE_SIZE}&course=${encodeURIComponent(facet.courseSlug)}&state=${encodeURIComponent(cityPage.stateSlug)}&city=${encodeURIComponent(cityPage.citySlug)}`,
        listingFetchOptions([`colleges:${facet.courseSlug}:${cityPage.stateSlug}:${cityPage.citySlug}`])
      );
      if (result.pagination.total < 15) return null;
      return { course: facet, data: result.data, pagination: result.pagination, cityPage };
    } catch {
      return null;
    }
  }
  if (statePage) {
    const statePages = await getStatePages();
    const facet = facets.data.find((item) => item.key === statePage.courseKey);
    if (!facet || !statePages.data.some((item) => item.courseSlug === facet.courseSlug && item.stateSlug === statePage.stateSlug)) return null;
    try {
      const result = await api<{ data: ListedCollege[]; pagination: ListPagination }>(
        `/colleges?page=${page}&perPage=${PAGE_SIZE}&course=${encodeURIComponent(facet.courseSlug)}&state=${encodeURIComponent(statePage.stateSlug)}`,
        listingFetchOptions([`colleges:${facet.courseSlug}:${statePage.stateSlug}`])
      );
      if (result.pagination.total < 15) return null;
      return {
        course: facet,
        data: result.data,
        pagination: result.pagination
      };
    } catch {
      return null;
    }
  }
  const key = parseCourseListingSegment(segment);
  if (!key) return null;
  try {
    const result = await api<CourseListing>(`/listings/courses/${encodeURIComponent(key)}?page=${page}&perPage=${PAGE_SIZE}&v=${LISTINGS_CACHE_VERSION}`, listingFetchOptions([`listing:${key}`]));
    if (!result?.course || result.course.key !== key) return null;
    if (page > 1 && page > result.pagination.totalPages) return null;
    return result;
  } catch {
    return null;
  }
});

/** Hero image for a listing (backend reports it when uploads/listings/{key}-colleges.webp exists). */
function heroImage(result: CourseListing) {
  if (!result.image?.path) return null;
  const url = mediaUrl(result.image.path);
  if (!url) return null;
  const sized = (width: number) => `${url}${url.includes('?') ? '&' : '?'}w=${width}&h=${Math.round(width * 0.5625)}&q=82&convert=webp`;
  return {
    url,
    width: result.image.width || 1200,
    height: result.image.height || 675,
    alt: `${result.course.label} colleges in India by profile and budget`,
    src: sized(1200),
    srcSet: [480, 768, 1200].map((width) => `${sized(width)} ${width}w`).join(', '),
    sizes: '(max-width: 760px) calc(100vw - 40px), 540px'
  };
}

function seoTitle(label: string) {
  return `${label} Colleges by Profile & Budget: Fees & Placements`;
}

function seoDescription(label: string) {
  return `Compare ${label} colleges in India based on your profile and budget. Explore fees, course focus and placement outcomes to shortlist the right college.`;
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const [{ listing }, query] = await Promise.all([params, searchParams]);
  const page = pageNumber(query.page);
  const result = await loadListing(listing, page);
  if (!result) notFound();
  const cityPage = result.cityPage || null;
  const statePage = cityPage ? null : stateCourseSegment(listing);
  const label = result.course.label;
  const path = cityPage || statePage ? `/${listing}` : courseListingHref(result.course.key);
  const cityName = cityPage?.cityName || '';
  const stateName = cityPage?.stateName || (statePage ? humanizeState(statePage.stateSlug) : '');
  const baseTitle = cityPage
    ? `${label} Colleges in ${cityName} (${stateName}) ${CURRENT_YEAR} – Fees, Admission & Placement`
    : statePage
      ? `${label} Colleges in ${stateName} ${CURRENT_YEAR}: Fees, Admission & Placements`
    : seoTitle(label);
  const title = page === 1 ? baseTitle : `${baseTitle} – Page ${page}`;
  const description = seoDescription(label);
  const pageDescription = cityPage
    ? `Explore ${result.pagination.total.toLocaleString('en-IN')}+ ${label.toLowerCase()} colleges in ${cityName}, ${stateName}. Compare fees, courses, admission process, cut-offs, placements and rankings. Filter by locality, budget and exam to shortlist the best ${label.toLowerCase()} colleges in ${cityName} for ${CURRENT_YEAR}.`
    : statePage
      ? `Explore ${result.pagination.total.toLocaleString('en-IN')}+ ${label.toLowerCase()} colleges in ${stateName}. Compare fees, courses, admission process, cut-offs, placements and rankings. Filter by locality and course to shortlist the best ${label.toLowerCase()} colleges in ${stateName} for ${CURRENT_YEAR}.`
      : description;
  const image = heroImage(result);
  const ogImages = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }]
    : [{ url: '/colleges-hero.webp', width: 1200, height: 675, alt: `Students comparing ${label} colleges in India` }];
  return {
    // absolute: bypass the root layout's "%s | College Decision" template.
    title: { absolute: title },
    description: pageDescription,
    ...((cityPage || statePage) ? {
      keywords: [
        ...(cityPage ? [
          `${label} colleges in ${cityName} ${stateName}`,
          `${label} colleges in ${cityName}`,
          `${cityName} ${label} colleges`,
          `${label} admission ${cityName}`,
          `${label} fees ${cityName}`,
          `best ${label} colleges in ${cityName}`,
          `top ${label} colleges ${cityName}`,
          `${label} colleges ${cityName} ${CURRENT_YEAR}`,
          `${label} placement ${cityName}`
        ] : [
          `${stateName} ${label} colleges`,
          `${label} admission ${stateName}`,
          `${label} fees ${stateName}`,
          `best ${label} colleges ${stateName}`,
          `${label} colleges ${stateName} ${CURRENT_YEAR}`,
          `top ${label} colleges in ${stateName}`,
          `${label} placement ${stateName}`
        ])
      ]
    } : {}),
    // Same rule as the /colleges hub: every paginated page canonicalises to page 1.
    alternates: { canonical: path },
    openGraph: {
      title: baseTitle,
      description: pageDescription,
      url: path,
      type: 'website',
      images: ogImages
    },
    twitter: { card: 'summary_large_image', title: baseTitle, description: pageDescription, images: ogImages.map((item) => item.url) },
    robots: { index: true, follow: true }
  };
}

export default async function CourseCollegesPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ listing }, query] = await Promise.all([params, searchParams]);
  if (listing.includes('-colleges-in-') && query.page !== undefined) {
    permanentRedirect(`/${listing}`);
  }
  const page = pageNumber(query.page);
  const [result, linkableEntities, facets, statePages, cityPages] = await Promise.all([
    loadListing(listing, page),
    getLinkableEntities(),
    getCourseFacets(),
    getStatePages(),
    getCityPages()
  ]);
  if (!result) notFound();

  const { course, pagination } = result;
  const cityPage = cityCoursePage(listing, facets.data, cityPages.data)?.page || null;
  const statePage = cityPage ? null : stateCourseSegment(listing);
  const label = course.label;
  const path = cityPage || statePage ? `/${listing}` : courseListingHref(course.key);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}${path}`;
  const pageUrl = page === 1 ? canonicalUrl : `${canonicalUrl}?page=${page}`;
  const cityName = cityPage?.cityName || '';
  const stateName = cityPage?.stateName || (statePage ? humanizeState(statePage.stateSlug) : '');
  const heading = cityPage
    ? `${label} Colleges in ${cityName} (${stateName}) ${CURRENT_YEAR}`
    : statePage
      ? `${label} Colleges in ${stateName} ${CURRENT_YEAR}`
    : seoTitle(label);
  const totalLabel = pagination.total.toLocaleString('en-IN');
  const image = heroImage(result);
  const heroCopy = <>
    <p className="eyebrow">COLLEGE GUIDES</p>
    <h1>{heading}</h1>
    <p className="listing-intro">{cityPage
      ? `Explore ${totalLabel}+ ${label.toLowerCase()} colleges in ${cityName}, ${stateName}. Compare fees, admission routes, cut-offs, placements and rankings before shortlisting.`
      : statePage
      ? `Explore ${totalLabel}+ ${label.toLowerCase()} colleges in ${stateName}. Compare fees, admission routes, cut-offs, placements and rankings before shortlisting.`
      : `Find ${label} colleges for different profiles and budgets. India has ${totalLabel} active colleges offering ${label} in our database, listed with the most complete fee, course and placement information first so you can shortlist faster.`}</p>
    <p><Link className="button primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={16} aria-hidden="true" /></Link></p>
  </>;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollectionPage', 'WebPage'],
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page === 1 ? heading : `${heading} – Page ${page}`,
        description: cityPage
          ? `Explore ${totalLabel}+ ${label.toLowerCase()} colleges in ${cityName}, ${stateName}. Compare fees, courses, admission process, cut-offs, placements and rankings.`
          : seoDescription(label),
        isPartOf: { '@id': `${siteUrl}/#website` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#itemlist` },
        ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image.url, width: image.width, height: image.height, caption: image.alt }, image: image.url } : {})
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: cityPage ? `${label} colleges in ${cityName}, ${stateName}` : `${label} colleges in India`,
        numberOfItems: pagination.total,
        itemListElement: result.data.map((college, index) => {
          const collegeUrl = college.published_slug ? `${siteUrl}/colleges/${college.published_slug}` : `${pageUrl}#college-${index + 1}`;
          return {
            '@type': 'ListItem',
            position: (page - 1) * pagination.perPage + index + 1,
            url: collegeUrl,
            item: {
              '@type': 'CollegeOrUniversity',
              '@id': collegeUrl,
              name: college.display_name || college.full_name,
              address: {
                '@type': 'PostalAddress',
                addressLocality: college.city || undefined,
                addressRegion: college.state || undefined,
                addressCountry: 'IN'
              }
            }
          };
        })
      }
    ]
  };
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', url: `${siteUrl}/` },
    { name: 'Colleges', url: `${siteUrl}/colleges` },
    { name: cityPage ? `${label} Colleges in ${cityName}` : `${label} Colleges`, url: canonicalUrl }
  ], `${pageUrl}#breadcrumb`);

  return <main className="section"><div className="wrap">
    <JsonLd data={jsonLd} />
    <JsonLd data={breadcrumbLd} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/colleges">Colleges</Link><span aria-hidden="true">›</span><span aria-current="page">{cityPage ? `${label} Colleges in ${cityName}` : `${label} Colleges`}</span></nav>
    {image ? <section className="articles-hero listing-hero">
      <div className="articles-hero-copy">{heroCopy}</div>
      <img src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt={image.alt} width={image.width} height={image.height} fetchPriority="high" loading="eager" decoding="async" />
    </section> : <section className="hero-inline">{heroCopy}</section>}
    <div className="listing-layout">
      <div className="listing-main">
        <CourseFilterMobileButton facets={facets.data} totalColleges={facets.totalColleges} selectedKey={course.key} selectedState={cityPage?.stateSlug || statePage?.stateSlug || null} selectedCity={cityPage?.citySlug || null} statePages={statePages.data} cityPages={cityPages.data} />
        <div className="article-card-top">
          <p className="muted">{totalLabel} {label} colleges · 20 per page{page > 1 ? ` · Page ${page} of ${pagination.totalPages}` : ''}</p>
        </div>
        <h2>Browse {label} Colleges</h2>
        {statePage || cityPage
          ? <LoadMoreColleges initial={result.data} total={pagination.total} perPage={pagination.perPage} query={`course=${encodeURIComponent(course.courseSlug)}&state=${encodeURIComponent(cityPage?.stateSlug || statePage?.stateSlug || '')}${cityPage ? `&city=${encodeURIComponent(cityPage.citySlug)}` : ''}`} linkableEntities={linkableEntities} />
          : <>
            <CollegeListResults colleges={result.data} total={pagination.total} linkableEntities={linkableEntities} />
            {pagination.totalPages > 1 && <ListPaginationNav page={page} totalPages={pagination.totalPages} basePath={path} label={`${label} college pages`} />}
          </>}
        <p className="muted">Fees and placement figures are shown only where colleges have reported them; confirm the latest numbers on the official college website before applying.</p>
      </div>
      <CourseFilterSidebar facets={facets.data} totalColleges={facets.totalColleges} selectedKey={course.key} selectedState={cityPage?.stateSlug || statePage?.stateSlug || null} selectedCity={cityPage?.citySlug || null} statePages={statePages.data} cityPages={cityPages.data} />
    </div>
  </div></main>;
}
