# College Decision Website

Next.js App Router website with server-rendered SEO metadata and JSON-LD.

## Run locally

```bash
cp .env.example .env
npm run dev
```

Pages:

- `/` home
- `/about`
- `/contact`
- `/articles?page=1` article listing with 20-per-page pagination
- `/articles/{course-slug}-colleges-under-{lakh}-lakh` generated course-budget article

The website reads public data from `BACKEND_API_URL`. Article detail pages generate canonical
metadata, Open Graph metadata and Article JSON-LD from the API response. Fee and placement values
are displayed with verification warnings because the source database contains unit-sensitive data.
