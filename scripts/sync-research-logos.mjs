import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RESEARCH_FILE = path.join(ROOT, 'src/app/research/research-client.tsx');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const LOGO_DIR = path.join(ROOT, 'public', 'research-logos');
const LOCAL_PREFIX = '/research-logos/';
const COIN_LOGO_BASE = 'https://static.coinpaprika.com/coin';
const EXCHANGE_LOGO_BASE = 'https://static.coinpaprika.com/exchanges';
const FAVICON_BASE = 'https://www.google.com/s2/favicons?sz=128&domain=';
const LOGO_WINE_BASE = 'https://download.logo.wine/logo';

const DOMAIN_BLACKLIST = new Set([
  'defillama.com',
  'tokenterminal.com',
  'dune.com',
  'coingecko.com',
  'coinmarketcap.com',
  'coindesk.com',
  'theblock.co',
  'messari.io',
  'bankless.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'medium.com',
  'substack.com',
  'youtube.com',
  'bitcoinworld.co.in',
  'kucoin.com',
  'mexc.com',
  'weex.com',
  'a16zcrypto.com',
  'cyberscope.io',
  'chaincatcher.com',
  'tradingview.com',
  'coinglass.com',
  'gate.io',
]);

const MANUAL_OVERRIDES = {
  binance_2025_report: { kind: 'exchange', value: 'binance' },
  coinbase_report_2026: { kind: 'exchange', value: 'coinbase' },
  'a-deep-research-report-about-bybit-exchange': { kind: 'exchange', value: 'bybit-spot' },
  'bitget-deep-research-report-comprehensive-investment-analysis-of-a-derivatives': { kind: 'exchange', value: 'bitget' },
  gate_io_research: { kind: 'exchange', value: 'gateio' },
  mexc_exchange_report: { kind: 'exchange', value: 'mexc' },
  hashKey_exchange: { kind: 'domain', value: 'hashkey.com' },
  xt_exchange: { kind: 'exchange', value: 'xt' },
  osl_group: { kind: 'domain', value: 'osl.com' },
  'msx-exchange-deep-research-the-rwa-tokenization-pioneer-bridging-crypto': { kind: 'domain', value: 'msx.com' },
  circle_stablecoin_arc: { kind: 'domain', value: 'circle.com' },
  river_satoshi_protocol: { kind: 'domain', value: 'app.river.inc' },
  midnight_2026_report: { kind: 'domain', value: 'midnight.network' },
  megaeth_layer2_zk: { kind: 'domain', value: 'megaeth.com' },
  fogo_svm_solana_2026: { kind: 'domain', value: 'fogo.io' },
  espresso_baseeth_l2: { kind: 'domain', value: 'espressosys.com' },
  aztec_network_zk: { kind: 'domain', value: 'aztec.network' },
  zama_fhe_zk_2026: { kind: 'domain', value: 'zama.ai' },
  sentient_protocol_outlook_2026: { kind: 'domain', value: 'sentientagi.network' },
  'polymarket_kalshi_prediction_2026': { kind: 'domain', value: 'polymarket.com' },
  redotpay_report_2026: { kind: 'domain', value: 'redotpay.com' },
  metadao_publicsale: { kind: 'domain', value: 'metadao.fi' },
  cascade_neo_prediction: { kind: 'domain', value: 'cascade.xyz' },
  'pharos-network-pre-tge-rwa-l1-venture-investment-memo-t': { kind: 'domain', value: 'buildonpharos.com' },
  'kairos_trade_prediction_terminal': { kind: 'domain', value: 'kairos.trade' },
  'fabric-protocol-in-depth-research-report-ai-robotics': { kind: 'domain', value: 'openmind.org' },
  'paypay-report': { kind: 'domain', value: 'paypay.ne.jp' },
  'prediction_pmf_2026': { kind: 'domain', value: 'polymarket.com' },
  '2026_crypto_market_outlook': { kind: 'theme', value: 'Bitcoin' },
  '2026_crypto_prediction': { kind: 'theme', value: 'Bitcoin' },
  'prediction_2026_kol_vc': { kind: 'theme', value: 'Bitcoin' },
  'arc_tempo_stablecoin': { kind: 'theme', value: 'USD Coin' },
  'mobile_first_dapp': { kind: 'monogram' },
  'stable_coin_report_2026': { kind: 'theme', value: 'USD Coin' },
  'synthetic_crypto_index': { kind: 'theme', value: 'Bitcoin' },
  'the-exchange-chains-of-bnb-ecosystem-no-binance-no-bsc': { kind: 'theme', value: 'BNB' },
  'zama-privacy-upgrade-will-it-boost-shib-ecosystem-security': { kind: 'domain', value: 'zama.ai' },
  'chainlink-vs': { kind: 'theme', value: 'Chainlink' },
  'xrp-vs': { kind: 'theme', value: 'XRP' },
  'bitcoin-crypto-derivatives-intelligence-system-report': { kind: 'theme', value: 'Bitcoin' },
  'crypto-derivatives-intelligence-system-report-2026-03-14': { kind: 'theme', value: 'Bitcoin' },
  'what-is-podcasts': { kind: 'monogram' },
};

const THEME_KEYWORDS = [
  ['bitcoin cash', 'Bitcoin Cash'],
  ['bitcoin', 'Bitcoin'],
  ['btc', 'Bitcoin'],
  ['ethereum', 'Ethereum'],
  ['eth', 'Ethereum'],
  ['usdt', 'Tether'],
  ['usdc', 'USD Coin'],
  ['xrp', 'XRP'],
  ['solana', 'Solana'],
  ['chainlink', 'Chainlink'],
  ['pyth', 'Pyth Network'],
  ['dogecoin', 'Dogecoin'],
  ['cardano', 'Cardano'],
  ['dai', 'Dai'],
  ['ethena', 'Ethena'],
  ['usde', 'Ethena USDe'],
  ['monero', 'Monero'],
  ['avalanche', 'Avalanche'],
  ['bittensor', 'Bittensor'],
  ['hedera', 'Hedera'],
  ['litecoin', 'Litecoin'],
  ['mantle', 'Mantle'],
  ['memecore', 'MemeCore'],
  ['near', 'NEAR Protocol'],
  ['pepe', 'Pepe'],
  ['polkadot', 'Polkadot'],
  ['shiba inu', 'Shiba Inu'],
  ['zcash', 'Zcash'],
  ['internet computer', 'Internet Computer'],
  ['okb', 'OKB'],
  ['toncoin', 'Toncoin'],
  ['beldex', 'Beldex'],
  ['dash', 'Dash'],
  ['xdc', 'XDC Network'],
  ['dexe', 'DeXe'],
  ['filecoin', 'Filecoin'],
  ['filcoin', 'Filecoin'],
  ['kaspa', 'Kaspa'],
  ['nexo', 'Nexo'],
  ['quant', 'Quant'],
  ['tron', 'TRON'],
  ['usdg', 'USDG'],
  ['cronos', 'Cronos'],
  ['naoris', 'Naoris Protocol'],
  ['world liberty financial usd', 'World Liberty Financial USD'],
  ['bnb', 'BNB'],
];

const EXCHANGE_ALIASES = new Map([
  ['binance', 'binance'],
  ['coinbase', 'coinbase'],
  ['bybit', 'bybit-spot'],
  ['bitget', 'bitget'],
  ['gate.io', 'gateio'],
  ['gate', 'gateio'],
  ['mexc', 'mexc'],
  ['xt.com', 'xt'],
  ['xt', 'xt'],
]);

const LOGO_WINE_MATCHERS = [
  { keywords: ['coinbase', 'coin'], pageSlug: 'Coinbase' },
  { keywords: ['circle', 'crcl'], pageSlug: 'Circle_%28company%29' },
  { keywords: ['paypal', 'pypl'], pageSlug: 'PayPal' },
  { keywords: ['paypay'], pageSlug: 'PayPay' },
];

function normalize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '');
}

function tokenize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function cleanName(name = '') {
  return name
    .replace(/^[^A-Za-z0-9\u4e00-\u9fa5]+/, '')
    .replace(/（[^）]*）/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[:：].*$/, '')
    .replace(/vs\.?/gi, ' ')
    .trim();
}

function projectToken(name = '') {
  return normalize(name.split(/[:：(（]/)[0]);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    return entry.isFile() && fullPath.endsWith('.mdx') ? [fullPath] : [];
  });
}

function buildSlugToFileMap() {
  const map = new Map();

  for (const filePath of walk(CONTENT_DIR)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const slug = content.match(/slug: '([^']+)'/)?.[1] ?? path.basename(filePath, '.mdx');
    map.set(slug, filePath);
  }

  return map;
}

function extractDomainCandidate(content, token) {
  const urls = [...content.matchAll(/https?:\/\/[^\s)>'"]+/g)].map((match) => match[0]);
  const scored = [];

  for (const url of urls) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();

      if (DOMAIN_BLACKLIST.has(hostname)) {
        continue;
      }

      let score = 0;
      const before = content.split(url)[0].slice(-100);

      if (/Domain:/mi.test(before) || /Official Domain/mi.test(before)) {
        score += 20;
      }

      if (normalize(hostname).includes(token)) {
        score += 10;
      }

      if (hostname.startsWith('docs.')) {
        score += 2;
      }

      const index = content.indexOf(url);

      if (index >= 0 && index < 1600) {
        score += 3;
      }

      if (score > 0) {
        scored.push({ hostname, score });
      }
    } catch {}
  }

  scored.sort((left, right) => right.score - left.score);
  return scored[0]?.hostname ?? null;
}

function monogramUrl(label, color) {
  const safeLabel = (label || '?').slice(0, 4).toUpperCase();
  const safeColor = color || '#111827';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="24" fill="${safeColor}"/>
      <text
        x="50%"
        y="50%"
        fill="#ffffff"
        font-family="Inter, Arial, sans-serif"
        font-size="${safeLabel.length > 3 ? 30 : 40}"
        font-weight="700"
        text-anchor="middle"
        dominant-baseline="central"
      >${safeLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function coinLogoUrl(id) {
  return `${COIN_LOGO_BASE}/${id}/logo.png`;
}

function exchangeLogoUrl(id) {
  return `${EXCHANGE_LOGO_BASE}/${id}/logo.png`;
}

function faviconUrl(domain) {
  return `${FAVICON_BASE}${encodeURIComponent(domain)}`;
}

function logoWineUrl(pageSlug) {
  return `${LOGO_WINE_BASE}/${pageSlug}/${pageSlug}-Logo.wine.png`;
}

function getExtensionFromType(contentType) {
  if (!contentType) return '.png';

  if (contentType.includes('image/svg+xml')) return '.svg';
  if (contentType.includes('image/jpeg')) return '.jpg';
  if (contentType.includes('image/webp')) return '.webp';
  if (contentType.includes('image/x-icon')) return '.ico';
  if (contentType.includes('image/vnd.microsoft.icon')) return '.ico';
  return '.png';
}

async function writeLocalLogo(project, remoteUrl) {
  const baseName = project.assetBaseName;

  if (remoteUrl.startsWith('data:image/svg+xml')) {
    const [, encoded] = remoteUrl.split(',');
    const outputPath = path.join(LOGO_DIR, `${baseName}.svg`);
    fs.writeFileSync(outputPath, decodeURIComponent(encoded));
    return `${LOCAL_PREFIX}${baseName}.svg`;
  }

  const response = await fetch(remoteUrl, {
    redirect: 'follow',
    headers: {
      'user-agent': 'kkdemian-portfolio-logo-sync/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`download failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') ?? '';
  const extension = getExtensionFromType(contentType);
  const outputPath = path.join(LOGO_DIR, `${baseName}${extension}`);

  for (const existingPath of fs.readdirSync(LOGO_DIR)) {
    if (existingPath.startsWith(`${baseName}.`)) {
      fs.rmSync(path.join(LOGO_DIR, existingPath), { force: true });
    }
  }

  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
  return `${LOCAL_PREFIX}${baseName}${extension}`;
}

function parseProjects(source) {
  return [...source.matchAll(/  \{\n([\s\S]*?)\n  \},?/g)]
    .map(([block, body]) => {
      const get = (key) => body.match(new RegExp(`${key}: '([^']+)'`))?.[1];

      return {
        block,
        body,
        name: get('name'),
        description: get('description'),
        slug: get('slug'),
        color: get('color'),
        initial: get('initial'),
      };
    })
    .filter((project) => project.name && project.slug && project.color && project.initial);
}

function buildCoinMaps(coins) {
  const byName = new Map();

  for (const coin of coins) {
    const key = normalize(coin.name);

    if (!byName.has(key)) {
      byName.set(key, []);
    }

    byName.get(key).push(coin);
  }

  for (const items of byName.values()) {
    items.sort((left, right) => (left.rank || 1e9) - (right.rank || 1e9));
  }

  return { byName };
}

function resolveFromOverride(project, coinByName) {
  const override = MANUAL_OVERRIDES[project.slug];

  if (!override) {
    return null;
  }

  if (override.kind === 'exchange') {
    return { remoteUrl: exchangeLogoUrl(override.value), source: `exchange:${override.value}` };
  }

  if (override.kind === 'domain') {
    return { remoteUrl: faviconUrl(override.value), source: `domain:${override.value}` };
  }

  if (override.kind === 'logoWine') {
    return { remoteUrl: logoWineUrl(override.value), source: `logo.wine:${override.value}` };
  }

  if (override.kind === 'theme') {
    const coin = coinByName.get(normalize(override.value))?.[0];

    if (coin) {
      return { remoteUrl: coinLogoUrl(coin.id), source: `theme:${override.value}` };
    }
  }

  if (override.kind === 'monogram') {
    return {
      remoteUrl: monogramUrl(project.initial, project.color),
      source: 'monogram:manual',
    };
  }

  return null;
}

function resolveTheme(project, coinByName) {
  const haystacks = [
    cleanName(project.name).toLowerCase(),
    project.slug.toLowerCase(),
    (project.description || '').toLowerCase(),
  ];

  for (const [keyword, coinName] of THEME_KEYWORDS) {
    if (!haystacks.some((value) => value.includes(keyword))) {
      continue;
    }

    const coin = coinByName.get(normalize(coinName))?.[0];

    if (coin) {
      return { remoteUrl: coinLogoUrl(coin.id), source: `theme:${coinName}` };
    }
  }

  return null;
}

function buildAssetBaseName(project, slugCounts) {
  if (slugCounts[project.slug] === 1) {
    return project.slug;
  }

  return `${project.slug}--${normalize(cleanName(project.name) || project.initial).slice(0, 24)}`;
}

function resolveLogoWine(project) {
  const tokens = new Set([
    ...tokenize(cleanName(project.name)),
    ...tokenize(project.slug),
  ]);

  for (const matcher of LOGO_WINE_MATCHERS) {
    if (!matcher.keywords.some((keyword) => tokens.has(keyword))) {
      continue;
    }

    return {
      remoteUrl: logoWineUrl(matcher.pageSlug),
      source: `logo.wine:${matcher.pageSlug}`,
    };
  }

  return null;
}

function buildSourceCandidates(project, coinByName, slugToFile) {
  const candidates = [];
  const seen = new Set();
  const clean = cleanName(project.name);

  const pushCandidate = (candidate) => {
    if (!candidate || seen.has(candidate.remoteUrl)) {
      return;
    }

    seen.add(candidate.remoteUrl);
    candidates.push(candidate);
  };

  pushCandidate(resolveFromOverride(project, coinByName));

  if (EXCHANGE_ALIASES.has(clean.toLowerCase())) {
    const exchangeId = EXCHANGE_ALIASES.get(clean.toLowerCase());
    pushCandidate({
      remoteUrl: exchangeLogoUrl(exchangeId),
      source: `exchange:${exchangeId}`,
    });
  }

  const filePath = slugToFile.get(project.slug);

  if (filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hostname = extractDomainCandidate(content, projectToken(project.name));

    if (hostname) {
      pushCandidate({
        remoteUrl: faviconUrl(hostname),
        source: `domain:${hostname}`,
      });
    }
  }

  pushCandidate(resolveLogoWine(project));

  const coin = coinByName.get(normalize(clean))?.[0];

  if (coin) {
    pushCandidate({
      remoteUrl: coinLogoUrl(coin.id),
      source: `coin:${coin.id}`,
    });
  }

  pushCandidate(resolveTheme(project, coinByName));
  pushCandidate({
    remoteUrl: monogramUrl(project.initial, project.color),
    source: 'monogram:auto',
  });

  return candidates;
}

export async function syncResearchLogos() {
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  const [source, coins] = await Promise.all([
    fs.promises.readFile(RESEARCH_FILE, 'utf8'),
    fetch('https://api.coinpaprika.com/v1/coins').then((response) => response.json()),
  ]);

  const { byName: coinByName } = buildCoinMaps(coins);
  const slugToFile = buildSlugToFileMap();
  const projects = parseProjects(source);
  const slugCounts = projects.reduce((counts, project) => {
    counts[project.slug] = (counts[project.slug] ?? 0) + 1;
    return counts;
  }, {});
  const replacements = new Map();
  const summary = [];

  for (const project of projects) {
    project.assetBaseName = buildAssetBaseName(project, slugCounts);
    let localLogoUrl;
    let resolved;
    const candidates = buildSourceCandidates(project, coinByName, slugToFile);

    for (const candidate of candidates) {
      try {
        localLogoUrl = await writeLocalLogo(project, candidate.remoteUrl);
        resolved = candidate;
        break;
      } catch {}
    }

    if (!resolved || !localLogoUrl) {
      throw new Error(`Unable to resolve a local logo for ${project.slug}`);
    }

    let nextBlock = project.block;
    const logoLine = `    logoUrl: ${JSON.stringify(localLogoUrl)},\n`;

    if (/^\s*logoUrl:/m.test(nextBlock)) {
      nextBlock = nextBlock.replace(
        /^\s*logoUrl:.*\n(?:\s*['"`][^'"`]+['"`]\n)?/m,
        logoLine
      );
    } else {
      nextBlock = nextBlock.replace(
        /(\n    initial: [^\n]+,\n)/,
        `$1${logoLine}`
      );
    }

    replacements.set(project.block, nextBlock);
    summary.push(`${project.slug} -> ${localLogoUrl} (${resolved.source})`);
  }

  let nextSource = source;

  for (const [previousBlock, nextBlock] of replacements) {
    nextSource = nextSource.replace(previousBlock, nextBlock);
  }

  fs.writeFileSync(RESEARCH_FILE, nextSource);

  console.log(`Synced ${summary.length} research logos into ${LOGO_DIR}`);
  for (const line of summary.slice(0, 50)) {
    console.log(`- ${line}`);
  }

  if (summary.length > 50) {
    console.log(`- ...and ${summary.length - 50} more`);
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  syncResearchLogos().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
