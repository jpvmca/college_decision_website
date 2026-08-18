# College Decision Website TODO

## Completed in this pass

- [x] Remove database/backend wording from the public article detail page.
- [x] Use student-facing language: fees to verify, admission route, eligibility and decision guidance.
- [x] Add title, description, keywords, canonical URL, Open Graph and Twitter metadata.
- [x] Add Article and BreadcrumbList JSON-LD.
- [x] Add `robots.txt` and `sitemap.xml`.
- [x] Keep article pagination at 20 items per page.

## Next implementation order

1. [ ] Add a reusable public article content model for course, budget, state, exam and institute templates.
2. [ ] Add FAQ data and FAQ JSON-LD per article from approved content, not copied boilerplate.
3. [ ] Add source dates, confidence labels and an editorial review status to each public number.
4. [ ] Add course landing pages with internal links to relevant articles.
5. [ ] Add breadcrumbs and related-article links based on the course and location.
6. [ ] Add XML sitemap pagination so every generated article is included, not only the first 50.
7. [ ] Add analytics/search-console measurement after the public domain is configured.
8. [ ] Review thin or empty pages and return 404/noindex instead of publishing them.

## Editorial rule

Every page must answer a real student question in original wording, use current source evidence,
explain limitations, and help the reader choose between alternatives. URL combinations alone are
not a reason to publish a page.
