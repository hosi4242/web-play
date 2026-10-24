import { defineConfig, loadEnv, type IndexHtmlTransformContext } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.SITE_URL || 'https://web-play.hosi4242.workers.dev').replace(/\/$/, '');
  const robotsMode = env.ROBOTS_MODE || (mode === 'production' ? 'index' : 'noindex');
  return {
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
      __ROBOTS_MODE__: JSON.stringify(robotsMode),
      __ADS_ENABLED__: JSON.stringify(env.ADS_ENABLED || 'false')
    },
    plugins: [{
      name: 'toolmingle-seo-meta',
      transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
        const path = (ctx.path || '/').split('?')[0];
        const normalized = path.endsWith('.html') ? path.replace(/index\\.html$/, '') : path;
        const canonicalPath = normalized.endsWith('/') ? normalized : normalized + '/';
        const canonical = siteUrl + canonicalPath;
        const robots = robotsMode === 'index' ? 'index,follow' : 'noindex,nofollow';
        const tags = '<meta name="robots" content="' + robots + '"><link rel="canonical" href="' + canonical + '"><meta property="og:url" content="' + canonical + '">';
        return html.replace('</head>', tags + '</head>');
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
