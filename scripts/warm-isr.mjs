#!/usr/bin/env node
// Post-deploy ISR warm-up. A deploy swaps in a fresh .next, so every on-demand ISR page (articles have
// generateStaticParams() = []) is cold until its first visitor; Googlebot was hitting those cold renders.
// Reads URLs from the site's sitemaps and requests each one once, slowly, against the local Next server.
//
// Usage (on the server, after the swap + cache clear):
//   node scripts/warm-isr.mjs                       # articles sitemap only
//   WARM_SITEMAPS=articles,pages node scripts/warm-isr.mjs
// Env: WARM_ORIGIN (default http://127.0.0.1:9105), WARM_CONCURRENCY (default 2), WARM_LIMIT (default 1000 URLs).
const origin = (process.env.WARM_ORIGIN || 'http://127.0.0.1:9105').replace(/\/$/, '');
const sitemaps = (process.env.WARM_SITEMAPS || 'articles').split(',').map((s) => s.trim()).filter(Boolean);
const concurrency = Math.max(1, Math.min(4, Number(process.env.WARM_CONCURRENCY || 2)));
const limit = Math.max(1, Number(process.env.WARM_LIMIT || 1000));

async function urlsFrom(name) {
  const response = await fetch(`${origin}/sitemaps/${name}.xml`);
  if (!response.ok) throw new Error(`sitemap ${name}: HTTP ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const urls = [...new Set((await Promise.all(sitemaps.map(urlsFrom))).flat())]
  // Sitemap <loc>s carry the public site URL; request the same path on the local Next server.
  .map((url) => { try { const parsed = new URL(url); return origin + parsed.pathname + parsed.search; } catch { return null; } })
  .filter(Boolean)
  .slice(0, limit);

let next = 0, ok = 0, failed = 0, slow = 0;
const started = Date.now();
async function worker() {
  while (next < urls.length) {
    const url = urls[next++];
    const t = Date.now();
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'cd-isr-warm/1.0' } });
      await response.arrayBuffer();
      if (response.ok) ok += 1; else { failed += 1; console.log(`HTTP ${response.status} ${url}`); }
    } catch (error) {
      failed += 1;
      console.log(`ERR ${url} ${error instanceof Error ? error.message : error}`);
    }
    if (Date.now() - t > 3000) slow += 1;
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
console.log(`warm-isr: ${urls.length} urls, ${ok} ok, ${failed} failed, ${slow} over 3s, ${Math.round((Date.now() - started) / 1000)}s`);
