// Build-time renderer: turns a route into static HTML (see scripts/prerender.ts).
// All pages are preloaded first, so nothing suspends and renderToString emits the complete page
// inline. (The streaming prerender APIs split large sections into hidden placeholders that need an
// inline script to reveal, which the site's Content-Security-Policy blocks.)
import { renderToString } from 'react-dom/server';
import App, { preloadAllPages } from './App';

const ready = preloadAllPages();

export async function render(url: string): Promise<string> {
  await ready;
  return renderToString(<App initialPath={url} />);
}
