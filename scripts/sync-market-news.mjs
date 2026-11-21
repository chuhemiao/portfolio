import { fileURLToPath } from 'node:url';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const NEWS_URL = 'https://api.eqn.news/public/v1/news';
const DESTINATION = fileURLToPath(new URL('../src/data/market-news.json', import.meta.url));
const MAX_NEWS_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const PANELS = {
  oscillator: [{ channel: 'pricechange', count: 3 }, { channel: 'oi', count: 3 }],
  watch: ['binance', 'korea', 'tier2', 'tier3', 'alpha'].map(channel => ({ channel, count: 2 })),
  fear: [{ channel: 'main', coin: 'BTC', count: 3 }, { channel: 'tradfi', count: 3 }],
};

function httpsUrl(value) {
  const url = typeof value === 'string' ? URL.parse(value) : null;
  return url?.protocol === 'https:' && !url.username && !url.password ? url : null;
}

function headline(value) {
  if (typeof value !== 'string') return '';
  const line = value.trim().split(/\r?\n/, 1)[0];
  return line.length <= 220 ? line : `${line.slice(0, 217).trimEnd()}…`;
}

function normalize(item) {
  const id = item?.no;
  const publishedAt = Date.parse(item?.time);
  const url = httpsUrl(item?.url);
  const zh = headline(item?.zh);
  const en = headline(item?.en);
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isFinite(publishedAt) ||
    url?.origin !== 'https://eqn.news' || !new RegExp(`^/(main|monitor|tradfi)/${id}/?$`).test(url.pathname) ||
    (!zh && !en)) return null;

  return {
    id,
    publishedAt: new Date(publishedAt).toISOString(),
    url: url.href,
    sourceUrl: httpsUrl(item.source_url)?.href ?? null,
    source: headline(item.source) || 'Equation News',
    zh,
    en,
  };
}

export async function syncMarketNews({ destination = DESTINATION, fetchNews = fetch } = {}) {
  const now = Date.now();
  const panels = {};
  for (const [panel, feeds] of Object.entries(PANELS)) {
    const items = new Map();
    for (const { channel, coin, count } of feeds) {
      const url = new URL(NEWS_URL);
      url.searchParams.set('channel', channel);
      url.searchParams.set('limit', String(count + 3));
      if (coin) url.searchParams.set('coin', coin);

      const response = await fetchNews(url, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
      if (!response.ok) throw new Error(`EQN ${channel} responded HTTP ${response.status}`);
      const { items: rawItems } = await response.json();
      if (!Array.isArray(rawItems)) throw new Error(`EQN ${channel} returned an invalid feed`);
      const validItems = rawItems.map(normalize).filter(Boolean);
      if (rawItems.length && !validItems.length) throw new Error(`EQN ${channel} returned no valid items`);
      const recent = validItems.filter(item => {
        const age = now - Date.parse(item.publishedAt);
        return age >= -300000 && age <= MAX_NEWS_AGE_MS;
      }).slice(0, count);
      for (const item of recent) items.set(item.id, item);
    }
    panels[panel] = [...items.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  const data = { fetchedAt: new Date(now).toISOString(), panels };
  await writeSnapshot(destination, data);
  return data;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { fetchedAt, panels } = await syncMarketNews();
    console.log(JSON.stringify({ fetchedAt, counts: Object.fromEntries(Object.entries(panels).map(([page, items]) => [page, items.length])) }));
  } catch (error) {
    console.error(`Market news sync failed; previous snapshot retained. ${error.message}`);
    process.exitCode = 1;
  }
}
