import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ArrowRight, BadgeCheck, Building2, GraduationCap, MapPin } from 'lucide-react';
import JsonLd from '../../components/JsonLd';
import HeroPhoto from '../../components/HeroPhoto';
import HeroStats from '../../components/HeroStats';
import { breadcrumbJsonLd } from '../../lib/structured-data';
import { api, imageSrcSet, imageUrl, mediaUrl } from '../../lib/api';
import { getLinkableEntities } from '../../lib/linkable-entities';
import { LISTINGS_CACHE_VERSION, courseListingHref, getCourseFacets, getListingSummary, listingFetchOptions, parseCourseListingSegment, type CourseFacet } from '../../lib/listings';
import ListingGuide from '../../components/ListingGuide';
import { type ListedCollege, type ListPagination } from '../../components/CollegeListResults';
import LoadMoreColleges from '../../components/LoadMoreColleges';
import { getAdSlot } from '../../lib/ads';
import AdSlot from '../../components/ads/AdSlot';
import PercentileCollegesPage, { percentileMetadata } from '../../components/PercentileCollegesPage';
import { cutoffGroupsFor, getPercentileCombos, parsePercentileSegment } from '../../lib/percentile';
import { getClosingCombos, parseRankSegment } from '../../lib/closing';
import ClosingCollegesPage, { closingMetadata } from '../../components/ClosingCollegesPage';
import { CourseFilterMobileButton, CourseFilterSidebar, type CityPageOption, type StatePageOption } from '../../components/CourseFilterPanel';
import { staticImageUrl } from '../../lib/image';
import { LISTING_SEO_YEAR, buildCourseListingSeo, listingSeoInputFromPage } from '../../lib/listing-seo';
import LastUpdatedByline from '../../components/LastUpdatedByline';
import { jsonLdAuthor } from '../../lib/page-byline';

/**
 * Course listing pages: /{key}-colleges (e.g. /mba-colleges, /engineering-colleges).
 * Only keys returned by the backend's frozen course key map resolve; everything else 404s.
 * Static top-level routes (/colleges, /compare-colleges, ...) always take precedence over this segment.
 */

type Params = Promise<{ listing: string }>;
type SearchParams = Promise<{ page?: string } & Record<string, string | string[] | undefined>>;
type ListingImage = { path: string; width: number; height: number; updatedAt?: string };
type CourseListing = { course: CourseFacet; data: ListedCollege[]; pagination: ListPagination; image?: ListingImage | null; cityPage?: CityPageOption | null };

const PAGE_SIZE = 20;

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
  return {
    url,
    width: result.image.width || 1200,
    height: result.image.height || 675,
    alt: `${result.course.label} colleges in India by profile and budget`,
    src: imageUrl(result.image.path, 1200, { height: 675 }),
    srcSet: imageSrcSet(result.image.path, [480, 768, 1200], { aspect: 16 / 9 }),
    sizes: '(max-width: 760px) calc(100vw - 40px), 540px'
  };
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  {
    const [{ listing: seg }, q] = await Promise.all([params, searchParams]);
    // /{course}-colleges-accepting-{80|90|95}-percentile-{exam}
    if (parsePercentileSegment(seg)) return (await percentileMetadata(seg, q)) || (await closingMetadata(seg, q, 'percentile')) || { title: 'Page not found', robots: { index: false, follow: false } };
    if (parseRankSegment(seg)) { const cm = await closingMetadata(seg, q, 'rank'); return cm || { title: 'Page not found', robots: { index: false, follow: false } }; }
  }
  const { listing } = await params;
  // ?page= is 301'd to the clean URL in proxy.ts; further results load client-side, so only the first batch is a page.
  const page = 1;
  const result = await loadListing(listing, page);
  if (!result) notFound();
  const cityPage = result.cityPage || null;
  const statePage = cityPage ? null : stateCourseSegment(listing);
  const label = result.course.label;
  const path = cityPage || statePage ? `/${listing}` : courseListingHref(result.course.key);
  const cityName = cityPage?.cityName || '';
  const stateName = cityPage?.stateName || (statePage ? humanizeState(statePage.stateSlug) : '');
  const summary = await getListingSummary(result.course.courseSlug, cityPage?.stateSlug || statePage?.stateSlug || null, cityPage?.citySlug || null);
  const seo = buildCourseListingSeo({
    courseKey: result.course.key,
    courseLabel: label,
    scope: cityPage ? 'city' : statePage ? 'state' : 'national',
    cityName,
    stateName,
    collegeCount: result.pagination.total,
    cityNames: (summary?.cities || []).map((item) => item.name),
    stateNames: (summary?.states || []).map((item) => item.name),
    publicCount: summary?.publicCount ?? null,
    privateCount: summary?.privateCount ?? null,
    fees: summary?.fees ?? null
  });
  const title = seo.title;
  const pageDescription = seo.description;
  const image = heroImage(result);
  const ogImages = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }]
    : [{ url: staticImageUrl('/colleges-hero.webp'), width: 1200, height: 675, alt: `Students comparing ${label} colleges in India` }];
  return {
    // absolute: bypass the root layout's "%s | College Decision" template.
    title: { absolute: title },
    description: pageDescription,
    keywords: seo.keywords,
    other: { 'focus-keyword': seo.focusKeyword },
    // One URL per listing; further colleges load client-side ("Load more"), never via ?page=.
    alternates: { canonical: path },
    openGraph: {
      title,
      description: pageDescription,
      url: path,
      type: 'website',
      images: ogImages
    },
    twitter: { card: 'summary_large_image', title, description: pageDescription, images: ogImages.map((item) => item.url) },
    robots: { index: true, follow: true }
  };
}

export default async function CourseCollegesPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ listing }, query] = await Promise.all([params, searchParams]);
  if (parsePercentileSegment(listing)) return <PercentileCollegesPage segment={listing} query={query} />;
  if (parseRankSegment(listing)) return <ClosingCollegesPage segment={listing} query={query} kind="rank" />;
  const page = 1;
  const [result, linkableEntities, facets, statePages, cityPages, percentileCombos, closingCombos] = await Promise.all([
    loadListing(listing, page),
    getLinkableEntities(),
    getCourseFacets(),
    getStatePages(),
    getCityPages(),
    getPercentileCombos(),
    getClosingCombos()
  ]);
  if (!result) notFound();

  const { course, pagination } = result;
  const percentileGroups = cutoffGroupsFor(facets.data.find((f) => f.key === course.key) || null, percentileCombos, closingCombos);
  const cityPage = cityCoursePage(listing, facets.data, cityPages.data)?.page || null;
  const statePage = cityPage ? null : stateCourseSegment(listing);
  const label = course.label;
  const path = cityPage || statePage ? `/${listing}` : courseListingHref(course.key);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}${path}`;
  const pageUrl = canonicalUrl;
  const cityName = cityPage?.cityName || '';
  const stateName = cityPage?.stateName || (statePage ? humanizeState(statePage.stateSlug) : '');
  const totalLabel = pagination.total.toLocaleString('en-IN');
  const image = heroImage(result);
  const summary = await getListingSummary(course.courseSlug, cityPage?.stateSlug || statePage?.stateSlug || null, cityPage?.citySlug || null);
  const scope = cityPage ? 'city' as const : statePage ? 'state' as const : 'national' as const;
  const seo = listingSeoInputFromPage({
    courseKey: course.key,
    courseLabel: label,
    scope,
    cityName,
    stateName,
    collegeCount: pagination.total,
    cityNames: (summary?.cities || []).map((item) => item.name),
    stateNames: (summary?.states || []).map((item) => item.name),
    publicCount: summary?.publicCount ?? null,
    privateCount: summary?.privateCount ?? null,
    fees: summary?.fees ?? null
  });
  const heading = seo.title;
  const introParagraphs = seo.intro;
  const contentHeadings = seo.headings;
  const courseStates = statePages.data.filter((item) => item.courseSlug === course.courseSlug);
  const courseCities = cityPages.data.filter((item) => item.courseSlug === course.courseSlug);
  const stats = [
    pagination.total ? { icon: Building2, value: `${totalLabel}${pagination.total >= 20 ? '+' : ''}`, label: `${label} colleges` } : null,
    courseStates.length ? { icon: MapPin, value: `${courseStates.length}`, label: 'States covered' } : null,
    courseCities.length ? { icon: GraduationCap, value: `${courseCities.length}`, label: 'City pages' } : null
  ].filter((item): item is { icon: typeof Building2; value: string; label: string } => Boolean(item));
  const kicker = cityPage ? `${label} in ${cityName}` : statePage ? `${label} in ${stateName}` : `${label} college guides`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollectionPage', 'WebPage'],
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: heading,
        description: seo.description,
        isPartOf: { '@id': `${siteUrl}/#website` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#itemlist` },
        author: jsonLdAuthor(),
        ...(summary?.lastUpdated ? { dateModified: summary.lastUpdated } : {}),
        ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image.url, width: image.width, height: image.height, caption: image.alt }, image: image.url } : {})
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: contentHeadings.list,
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

  const listingAdFeed = await getAdSlot('listing_feed', { thin: !result.data.length });
  return <main className="section ls-page"><div className="wrap">
    <JsonLd data={jsonLd} />
    <JsonLd data={breadcrumbLd} />
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span aria-hidden="true">›</span><Link prefetch={false} href="/colleges">Colleges</Link><span aria-hidden="true">›</span><span aria-current="page">{cityPage ? `${label} Colleges in ${cityName}` : statePage ? `${label} Colleges in ${stateName}` : `${label} Colleges`}</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><BadgeCheck size={15} aria-hidden="true" /> {kicker}</span>
          <h1>{heading}</h1>
          <LastUpdatedByline updatedAt={summary?.lastUpdated} />
          {introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="ls-hero-actions">
            <Link prefetch={false} className="button ls-btn-primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={16} aria-hidden="true" /></Link>
            {course.courseSlug ? <Link prefetch={false} className="button ls-btn-ghost" href={`/courses/${course.courseSlug}`}>{label} course guide</Link> : <Link prefetch={false} className="button ls-btn-ghost" href="/courses">Browse courses</Link>}
          </div>
        </div>
        <div className="ls-hero-visual">
          {image
            ? <img src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt={image.alt} width={image.width} height={image.height} fetchPriority="high" loading="eager" decoding="async" />
            : <HeroPhoto src="/colleges-hero.webp" alt={`Students comparing ${label} colleges and courses`} />}
        </div>
      </div>
      <HeroStats prefix="ls" stats={stats} />
    </section>
    {summary ? <ListingGuide
      label={label}
      courseSlug={course.courseSlug}
      courseKey={course.key}
      placeName={cityPage ? cityName : statePage ? stateName : 'India'}
      placeKind={cityPage ? 'city' : statePage ? 'state' : 'india'}
      stateSlug={cityPage?.stateSlug || statePage?.stateSlug || null}
      siblingStates={courseStates.map((item) => ({ stateSlug: item.stateSlug, stateName: item.stateName, count: item.count, href: `/${course.key}-colleges-in-${item.stateSlug}` }))}
      summary={summary}
      year={LISTING_SEO_YEAR}
    /> : null}
    <AdSlot slotKey="listing_top" className="listing-ad" />
    <div className="listing-layout">
      <div className="listing-main">
        <CourseFilterMobileButton percentileGroups={percentileGroups} facets={facets.data} totalColleges={facets.totalColleges} selectedKey={course.key} selectedState={cityPage?.stateSlug || statePage?.stateSlug || null} selectedCity={cityPage?.citySlug || null} statePages={statePages.data} cityPages={cityPages.data} />
        <div className="ls-head">
          <p className="ls-eyebrow"><Building2 size={14} aria-hidden="true" /> College list</p>
          <h2>{contentHeadings.list}</h2>
        </div>
        <p className="ls-count">{totalLabel} {label} colleges · load more to continue</p>
        {statePage || cityPage
          ? <LoadMoreColleges initial={result.data} total={pagination.total} perPage={pagination.perPage} query={`course=${encodeURIComponent(course.courseSlug)}&state=${encodeURIComponent(cityPage?.stateSlug || statePage?.stateSlug || '')}${cityPage ? `&city=${encodeURIComponent(cityPage.citySlug)}` : ''}`} linkableEntities={linkableEntities} adFeed={listingAdFeed} />
          : <LoadMoreColleges initial={result.data} total={pagination.total} perPage={pagination.perPage} endpoint={`/api/course-listing/${encodeURIComponent(course.key)}`} linkableEntities={linkableEntities} adFeed={listingAdFeed} />}
        <p className="ls-note">Fees and placement figures are shown only where colleges have reported them; confirm the latest numbers on the official college website before applying.</p>
      </div>
      <CourseFilterSidebar percentileGroups={percentileGroups} facets={facets.data} totalColleges={facets.totalColleges} selectedKey={course.key} selectedState={cityPage?.stateSlug || statePage?.stateSlug || null} selectedCity={cityPage?.citySlug || null} statePages={statePages.data} cityPages={cityPages.data} />
    </div>
    <AdSlot slotKey="listing_bottom" className="listing-ad" />
  </div></main>;
}
