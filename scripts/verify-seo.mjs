import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const mode = process.argv[2] || 'beta';
const siteUrl = (process.env.SITE_URL || (mode === 'production'
  ? 'https://play.toolmingle.dev'
  : 'https://web-play.hosi4242.workers.dev')).replace(/\/+$/, '');
const robotsMode = process.env.ROBOTS_MODE || (mode === 'production' ? 'index' : 'noindex');
const pages = [
  ['index.html', '/'],
  ['prismerge/index.html', '/prismerge/'],
  ['zapdash/index.html', '/zapdash/'],
  ['about/index.html', '/about/'],
  ['privacy/index.html', '/privacy/'],
  ['contact/index.html', '/contact/']
];

for (const [file, route] of pages) {
  const html = await readFile(`dist/${file}`, 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/i, `${file}: title missing`);
  assert.match(html, /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i, `${file}: description missing`);
  const canonicals = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)];
  assert.equal(canonicals.length, 1, `${file}: expected exactly one canonical URL`);
  assert.equal(canonicals[0][1], siteUrl + route, `${file}: canonical URL mismatch`);
  const robots = [...html.matchAll(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/gi)];
  assert.equal(robots.length, 1, `${file}: expected exactly one robots meta tag`);
  assert.equal(robots[0][1], robotsMode === 'index' ? 'index,follow' : 'noindex,nofollow', `${file}: robots meta mismatch`);
}

const robotsTxt = await readFile('dist/robots.txt', 'utf8');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const headers = await readFile('dist/_headers', 'utf8');

if (robotsMode === 'index') {
  assert.match(robotsTxt, /Allow:\s*\//, 'production robots.txt must allow crawling');
  assert.doesNotMatch(robotsTxt, /Disallow:\s*\//, 'production robots.txt must not block the whole site');
  assert.ok(robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt sitemap URL mismatch');
  assert.doesNotMatch(headers, /X-Robots-Tag:\s*noindex/i, 'production headers must not set noindex');
} else {
  assert.match(robotsTxt, /Disallow:\s*\//, 'beta robots.txt must block crawling');
  assert.match(headers, /X-Robots-Tag:\s*noindex/i, 'beta headers must set noindex');
}

assert.match(sitemap, /<urlset\s+xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/, 'sitemap XML namespace missing');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(sitemapUrls.length, pages.length, 'sitemap must contain all six public pages');
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap contains duplicate URLs');
for (const [, route] of pages) assert.ok(sitemapUrls.includes(siteUrl + route), `sitemap missing ${siteUrl + route}`);

console.log(`SEO verification passed: ${pages.length} pages, canonical URLs, robots.txt, sitemap.xml and _headers (${mode}/${robotsMode})`);
