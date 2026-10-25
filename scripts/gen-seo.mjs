import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const mode = process.argv[2] || 'beta';
const envPath = `.env.${mode}`;
const env = {};
if (existsSync(envPath)) {
  for (const line of (await readFile(envPath, 'utf8')).split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const defaultSiteUrl = mode === 'production'
  ? 'https://play.toolmingle.dev'
  : 'https://web-play.hosi4242.workers.dev';
const siteUrl = (process.env.SITE_URL || env.SITE_URL || defaultSiteUrl).replace(/\/+$/, '');
const robotsMode = process.env.ROBOTS_MODE || env.ROBOTS_MODE || (mode === 'production' ? 'index' : 'noindex');

if (!['index', 'noindex'].includes(robotsMode)) {
  throw new Error(`Invalid ROBOTS_MODE "${robotsMode}". Use "index" or "noindex".`);
}
const parsedSiteUrl = new URL(siteUrl);
if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.pathname !== '/' || parsedSiteUrl.search || parsedSiteUrl.hash) {
  throw new Error(`SITE_URL must be an HTTPS origin without a path, query, or fragment: ${siteUrl}`);
}

await mkdir('dist', { recursive: true });
const robots = robotsMode === 'index'
  ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n';
const urls = ['/', '/prismerge/', '/zapdash/', '/about/', '/privacy/', '/contact/'];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(path => '  <url><loc>' + siteUrl + path + '</loc></url>').join('\n') + '\n</urlset>\n';
await writeFile('dist/robots.txt', robots);
await writeFile('dist/sitemap.xml', sitemap);
const headers = ['/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '  X-Frame-Options: DENY', '  Permissions-Policy: camera=(), microphone=(), geolocation=()'];
if (robotsMode !== 'index') headers.push('  X-Robots-Tag: noindex');
await writeFile('dist/_headers', headers.join('\n') + '\n');
console.log(`Generated SEO files for ${siteUrl} (${robotsMode})`);
