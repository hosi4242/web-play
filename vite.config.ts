import { defineConfig, loadEnv, type IndexHtmlTransformContext } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const defaultSiteUrl = mode === 'production'
    ? 'https://play.toolmingle.dev'
    : 'https://web-play.hosi4242.workers.dev';
  const siteUrl = (process.env.SITE_URL || env.SITE_URL || defaultSiteUrl).replace(/\/+$/, '');
  const robotsMode = process.env.ROBOTS_MODE || env.ROBOTS_MODE || (mode === 'production' ? 'index' : 'noindex');

  return {
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
      __ROBOTS_MODE__: JSON.stringify(robotsMode),
      __ADS_ENABLED__: JSON.stringify(process.env.ADS_ENABLED || env.ADS_ENABLED || 'false')
    },
    plugins: [{
      name: 'toolmingle-seo-meta',
      transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
        const path = (ctx.path || '/').split('?')[0];
        const normalizedPath = path.replace(/\/index\.html$/, '/');
        const canonicalPath = normalizedizedPath(normalizedPath);
        const canonical = new URL(canonicalPath, siteUrl + '/').toString();
        const robots = robotsMode === 'index' ? 'index,follow' : 'noindex,nofollow';
        const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || 'Toolmingle Play';
        const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
          || 'Play free casual browser games on Toolmingle Play.';
        const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const meta = [
          '<meta name="robots" content="' + robots + '">',
          '<link rel="canonical" href="' + escapeHtml(canonical) + '">',
          '<meta property="og:type" content="website">',
          '<meta property="og:site_name" content="Toolmingle Play">',
          '<meta property="og:title" content="' + escapeHtml(title) + '">',
          '<meta property="og:description" content="' + escapeHtml(description) + '">',
          '<meta property="og:url" content="' + escapeHtml(canonical) + '">',
          '<meta property="og:locale" content="en_US">',
          '<meta name="twitter:card" content="summary">',
          '<meta name="twitter:title" content="' + escapeHtml(title) + '">',
          '<meta name="twitter:description" content="' + escapeHtml(description) + '">'
        ];

        if (canonicalPath === '/') {
          meta.push('<script type="application/ld+json">' + JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Toolmingle Play',
            url: new URL('/', siteUrl + '/').toString(),
            description
          }) + '</script>');
        } else if (canonicalPath === '/zapdash/' || canonicalPath === '/prismerge/') {
          meta.push('<script type="application/ld+json">' + JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: title.split(' — ')[0],
            url: canonical,
            description,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
          }) + '</script>');
        }

        return html.replace('</head>', meta.join('') + '</head>');
      }
    }],
    build: {
      rollupOptions: {
        input: {
          main: resolve(root, 'index.html'),
          prismerge: resolve(root, 'prismerge/index.html'),
          zapdash: resolve(root, 'zapdash/index.html'),
          about: resolve(root, 'about/index.html'),
          privacy: resolve(root, 'privacy/index.html'),
          contact: resolve(root, 'contact/index.html')
        }
      }
    }
  };
});

function normalizedizedPath(path: string): string {
  return path.endsWith('/') ? path : path + '/';
}
