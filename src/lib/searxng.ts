import { getSearxngURL } from './config/serverRegistry';

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (
  query: string,
  opts?: SearxngSearchOptions,
) => {
  const searxngURL = getSearxngURL();

  if (!searxngURL) {
    console.error('SearXNG URL is not configured.');
    return { results: [], suggestions: [] };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = new URL(`${searxngURL}/search?format=json`);
    url.searchParams.append('q', query);

    if (opts) {
      Object.keys(opts).forEach((key) => {
        const value = opts[key as keyof SearxngSearchOptions];
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','));
          return;
        }
        url.searchParams.append(key, value as string);
      });
    }

    const res = await fetch(url, {
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`SearXNG error: ${res.status} ${res.statusText}`);
      return { results: [], suggestions: [] };
    }

    const data = await res.json();

    const results: SearxngSearchResult[] = data.results || [];
    const suggestions: string[] = data.suggestions || [];

    return { results, suggestions };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('SearXNG search timed out');
      return { results: [], suggestions: [] };
    }
    console.error(`Error fetching from SearXNG: ${err}`);
    return { results: [], suggestions: [] };
  } finally {
    clearTimeout(timeoutId);
  }
};
