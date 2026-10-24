import { BRAND } from './site';

export function shell(content: string, active = ''): string {
  return `<div class="site-shell"><header class="topbar"><a class="brand" href="/" aria-label="${BRAND} home"><span class="brand-mark">✦</span><span>Toolmingle <b>Play</b></span></a><nav aria-label="Main navigation"><a class="${active === 'games' ? 'active' : ''}" href="/">Games</a><a href="/about/">About</a></nav></header><main>${content}</main><footer class="footer"><span>© ${new Date().getFullYear()} ${BRAND}</span><div><a href="/privacy/">Privacy</a><a href="/contact/">Contact</a><a href="/about/">About</a></div></footer></div>`;
}
export function mount(content: string, active = ''): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (app) app.innerHTML = shell(content, active);
}
