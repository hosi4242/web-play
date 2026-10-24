import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const mode = process.argv[2] || 'production';
const envPath = `.env.${mode}`;
const env = {};
if (existsSync(envPath)) for (const line of (await readFile(envPath, 'utf8')).split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}
const siteUrl = (process.env.SITE_URL || env.SITE_URL || 'https://web-play.hosi4242.workers.dev').replace(/\/$/, '');
const robotsMode = process.env.ROBOTS_MODE || env.ROBOTS_MODE || (mode === 'production' ? 'index' : 'noindex');
await mkdir('dist', { recursive: true });
const robots = robotsMode === 'index'
  ? 'User-agent: *\nAllow: /\nSitemap: ' + siteUrl + '/sitemap.xml\n'
  : 'User-agent: *\nAllow: /\n';
const urls = ['/', '/prismerge/', '/zapdash/', '/about/', '/privacy/', '/contact/'];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(path => '  <url><loc>' + siteUrl + path + '</loc></url>').join('\n') + '\n</urlset>\n';
await writeFile('dist/robots.txt', robots);
await writeFile('dist/sitemap.xml', sitemap);
const headers = ['/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '  X-Frame-Options: DENY', '  Permissions-Policy: camera=(), microphone=(), geolocation=()'];
if (robotsMode !== 'index') headers.push('  X-Robots-Tag: noindex');
await writeFile('dist/_headers', headers.join('\n') + '\n');
console.log('Generated SEO files for ' + siteUrl + ' (' + robotsMode + ')');
