import './styles.css';
import { mount } from './layout';

mount(`<article class="content-page">
  <div class="eyebrow">Privacy</div>
  <h1>Privacy, plainly.</h1>
  <p class="lead">Toolmingle Play currently provides browser games without requiring an account.</p>
  <h2>Information and game records</h2>
  <p>Game records and progress may be saved in your browser's local storage so that your records can remain available on the same browser and site address. This information is not designed to sync between devices. You can remove locally saved data through your browser's site-data settings; clearing it may erase saved records.</p>
  <h2>Analytics and advertising</h2>
  <p>Analytics and advertising are currently disabled. If these services are introduced, this notice will be updated to explain the relevant providers and data practices before they are enabled.</p>
  <h2>Hosting and technical data</h2>
  <p>This site is hosted using Cloudflare Workers. As with websites generally, the hosting provider may process technical request data to deliver, secure, and maintain the service. Please consult Cloudflare's privacy information for details about its processing.</p>
  <h2>Contact</h2>
  <p>For questions about this privacy notice or the site, email <a href="mailto:lucidpoverty@gmail.com">lucidpoverty@gmail.com</a>.</p>
  <p class="tiny">This notice describes the site's current intended operation and is not legal advice. It should be reviewed and updated if the site's features or data practices change.</p>
</article>`);
