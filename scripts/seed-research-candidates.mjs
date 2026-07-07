/**
 * pnpm seed:research:candidates
 *
 * Seeds local Research Map candidates from CoinGecko or Surf after checking the
 * local registry first. This is only a backlog builder; each full Research still
 * refreshes live CG/CMC/source data before writing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'research-map');
const REGISTRY_FILE = path.join(DATA_DIR, 'registry.json');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates.json');

function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1] || fallback;
  return fallback;
}

const limit = Number(getArg('limit', '100')) || 100;
const pages = Number(getArg('pages', '8')) || 8;
const perPage = Math.min(Number(getArg('per-page', '250')) || 250, 250);
const write = process.argv.includes('--write');
const provider = getArg('provider', 'auto');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function registryKeys(registry) {
  const keys = new Set();
  for (const project of registry.projects || []) {
    for (const key of project.lookupKeys || []) keys.add(key);
    for (const alias of project.aliases || []) keys.add(normalize(alias));
    keys.add(normalize(project.slug));
    keys.add(normalize(project.name));
  }
  return keys;
}

function candidateKeys(candidatesData) {
  const keys = new Set();
  for (const candidate of candidatesData.candidates || []) {
    keys.add(normalize(candidate.name));
    keys.add(normalize(candidate.target));
    keys.add(normalize(candidate.coingeckoId));
    keys.add(normalize(candidate.coinmarketcapSlug));
    keys.add(normalize(candidate.contract));
  }
  return keys;
}

async function fetchCoinGeckoMarkets(page) {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '24h,7d,30d');

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'kkdemian-research-map-candidate-seeder',
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchCoinGeckoList() {
  const url = new URL('https://api.coingecko.com/api/v3/coins/list');
  url.searchParams.set('include_platform', 'false');

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'kkdemian-research-map-candidate-seeder',
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko list request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchDefiLlamaProtocols() {
  const response = await fetch('https://api.llama.fi/protocols', {
    headers: {
      accept: 'application/json',
      'user-agent': 'kkdemian-research-map-candidate-seeder',
    },
  });

  if (!response.ok) {
    throw new Error(`DefiLlama protocols request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function fetchSurfRanking(offset) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const stdout = execFileSync('surf', [
        'market-ranking',
        '--sort-by',
        'market_cap',
        '--order',
        'desc',
        '--limit',
        '100',
        '--offset',
        String(offset),
        '--json',
      ], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const payload = JSON.parse(stdout);
      return payload.data || [];
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 1500);
      }
    }
  }

  throw lastError;
}

function isDuplicate(coin, registryLookup, candidateLookup) {
  const identityKeys = [
    normalize(coin.id),
    normalize(coin.name),
    normalize(`https://www.coingecko.com/en/coins/${coin.id}`),
  ].filter(Boolean);

  return identityKeys.some((key) => registryLookup.has(key) || candidateLookup.has(key));
}

function isUsefulListCoin(coin) {
  const id = String(coin.id || '');
  const name = String(coin.name || '');
  const symbol = String(coin.symbol || '');
  const readableName = /[A-Za-z]{2,}/.test(name) || /[\u4e00-\u9fff]{2,}/.test(name);
  const reasonableSymbol = /^[A-Za-z0-9.$_-]{1,16}$/.test(symbol);
  const reasonableId = id.length <= 80 && /[a-z]/i.test(id) && !/^\d+$/.test(id);

  return readableName && reasonableSymbol && reasonableId;
}

function isUsefulDefiLlamaProtocol(protocol) {
  const symbol = String(protocol.symbol || '');
  const category = String(protocol.category || '').toLowerCase();
  const name = String(protocol.name || '').toLowerCase();

  if (!symbol || symbol === '-') return false;
  if (category === 'cex') return false;
  if (/\bcex\b/.test(name)) return false;

  return true;
}

function makeCandidate(coin, index) {
  const rank = coin.market_cap_rank || coin.rank || null;
  const marketCapValue = coin.market_cap ?? coin.market_cap_usd;
  const volumeValue = coin.total_volume ?? coin.volume_24h_usd;
  const marketCap = typeof marketCapValue === 'number'
    ? `$${Math.round(marketCapValue).toLocaleString('en-US')}`
    : 'not disclosed';
  const volume = typeof volumeValue === 'number'
    ? `$${Math.round(volumeValue).toLocaleString('en-US')}`
    : 'not disclosed';
  const source = coin.__source || 'coingecko';
  const target = source === 'surf'
    ? `surf:${coin.slug || coin.id || coin.name}`
    : source === 'defillama'
      ? `https://defillama.com/protocol/${coin.slug || coin.id || normalize(coin.name)}`
      : `https://www.coingecko.com/en/coins/${coin.id}`;
  const sourceLabel = source === 'surf'
    ? 'Surf market-ranking'
    : source === 'coingecko-list'
      ? 'CoinGecko coins list'
      : source === 'defillama'
        ? 'DefiLlama protocols'
        : 'CoinGecko markets';
  const tvl = typeof coin.tvl === 'number'
    ? `$${Math.round(coin.tvl).toLocaleString('en-US')}`
    : 'not disclosed';

  const candidate = {
    status: index < 20 ? 'next' : 'backlog',
    source,
    target,
    name: coin.name,
    symbol: String(coin.symbol || '').toUpperCase(),
    priority: rank && rank <= 500 ? 'high' : 'normal',
    notes: `Seeded ${today()} from ${sourceLabel}; rank ${rank || 'n/a'}, market cap ${marketCap}, 24h volume ${volume}, TVL ${tvl}, category ${coin.category || 'n/a'}. Local registry duplicate check passed; refresh CG/CMC/Surf and primary sources before writing.`,
  };

  if (source === 'coingecko' || source === 'coingecko-list') candidate.coingeckoId = coin.id;
  if (source === 'defillama' && coin.gecko_id) candidate.coingeckoId = coin.gecko_id;
  if (source === 'defillama') candidate.defillamaSlug = coin.slug || '';
  if (source === 'surf') candidate.surfSlug = coin.slug || '';

  return candidate;
}

async function main() {
  const registry = readJson(REGISTRY_FILE, { projects: [] });
  const candidatesData = readJson(CANDIDATES_FILE, {
    schemaVersion: 1,
    updatedAt: today(),
    description:
      'Manual backlog for CoinGecko/CoinMarketCap/Surf research candidates. Keep raw targets here before turning them into Research Map entries.',
    statuses: ['backlog', 'next', 'researching', 'researched', 'skip'],
    candidates: [],
  });

  const registryLookup = registryKeys(registry);
  const candidateLookup = candidateKeys(candidatesData);
  const additions = [];

  let usedProvider = provider;
  let sourcePages = [];

  if (provider === 'coingecko-list') {
    const coins = await fetchCoinGeckoList();
    sourcePages.push(coins.map((coin) => ({ ...coin, __source: 'coingecko-list' })));
    usedProvider = 'coingecko-list';
  }

  if (provider === 'defillama') {
    const protocols = await fetchDefiLlamaProtocols();
    sourcePages.push(protocols.map((protocol) => ({ ...protocol, id: protocol.gecko_id || protocol.slug, __source: 'defillama' })));
    usedProvider = 'defillama';
  }

  if (provider === 'coingecko' || provider === 'auto') {
    try {
      for (let page = 1; page <= pages; page += 1) {
        const coins = await fetchCoinGeckoMarkets(page);
        sourcePages.push(coins.map((coin) => ({ ...coin, __source: 'coingecko' })));
      }
      usedProvider = 'coingecko';
    } catch (error) {
      if (provider === 'coingecko') throw error;
      console.warn(`CoinGecko markets seed failed, falling back to CoinGecko list: ${error.message}`);
      sourcePages = [];
      try {
        const coins = await fetchCoinGeckoList();
        sourcePages.push(coins.map((coin) => ({ ...coin, __source: 'coingecko-list' })));
        usedProvider = 'coingecko-list';
      } catch (listError) {
        console.warn(`CoinGecko list seed failed, falling back to DefiLlama: ${listError.message}`);
        sourcePages = [];
        try {
          const protocols = await fetchDefiLlamaProtocols();
          sourcePages.push(protocols.map((protocol) => ({ ...protocol, id: protocol.gecko_id || protocol.slug, __source: 'defillama' })));
          usedProvider = 'defillama';
        } catch (defiError) {
          console.warn(`DefiLlama seed failed, falling back to Surf: ${defiError.message}`);
          sourcePages = [];
          usedProvider = 'surf';
        }
      }
    }
  }

  if (usedProvider === 'surf') {
    for (let offset = 0; offset < pages * 100; offset += 100) {
      const coins = fetchSurfRanking(offset);
      sourcePages.push(coins.map((coin) => ({ ...coin, __source: 'surf' })));
    }
  }

  for (const coins of sourcePages) {
    for (const coin of coins) {
      if (additions.length >= limit) break;
      if (!(coin?.id || coin?.slug || coin?.name) || !coin?.name) continue;
      if (coin.__source === 'coingecko-list' && !isUsefulListCoin(coin)) continue;
      if (coin.__source === 'defillama' && !isUsefulDefiLlamaProtocol(coin)) continue;
      if (isDuplicate(coin, registryLookup, candidateLookup)) continue;

      const candidate = makeCandidate(coin, additions.length);
      additions.push(candidate);

      for (const key of [
        candidate.name,
        candidate.target,
        candidate.coingeckoId,
        candidate.defillamaSlug,
        candidate.surfSlug,
      ]) {
        candidateLookup.add(normalize(key));
      }
    }
  }

  console.log(`Selected ${additions.length} new candidate(s).`);
  for (const candidate of additions.slice(0, 20)) {
    console.log(`- [${candidate.status}] ${candidate.name} (${candidate.symbol}) — ${candidate.coingeckoId}`);
  }

  if (!write) {
    console.log('Dry run only. Re-run with --write to append candidates.');
    return;
  }

  const nextData = {
    ...candidatesData,
    updatedAt: today(),
    candidates: [
      ...(candidatesData.candidates || []),
      ...additions,
    ],
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CANDIDATES_FILE, `${JSON.stringify(nextData, null, 2)}\n`);
  console.log(`Appended ${additions.length} candidate(s) to data/research-map/candidates.json.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
