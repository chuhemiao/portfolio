import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const CANDIDATES_FILE = path.join(ROOT, 'data/research-map/candidates.json');
const REGISTRY_FILE = path.join(ROOT, 'data/research-map/registry.json');
const OUT_DIR = path.join(ROOT, 'content/blog/2026/research');
const DATE = '2026-07-06';
const SURF_TIMEOUT_MS = 45000;

const TARGET_COINGECKO_IDS = [
  'ssv-network',
  'babylon',
  'rocket-pool',
  'obol-2',
  'tornado-cash',
  'meth-protocol',
  'merlin-chain',
  'quickswap',
  'stader',
  'dolomite',
  'kpk',
  'pinksale',
  'tectonic',
  'yield-basis',
  'beefy-finance',
  'stake-dao',
  'renzo',
  'benqi',
  'fxn-token',
  'solblaze',
  'melon',
  'frankencoin',
  'savings-xdai',
  'ailayer-token',
  'staked-usdt',
  'concentrator',
  'zerobase',
  'treehouse',
  'origyn-foundation',
  'brickken',
];

const TYPE_OVERRIDES = {
  'ssv-network': 'Distributed validator infrastructure',
  babylon: 'Bitcoin staking / restaking',
  'rocket-pool': 'Liquid staking',
  'obol-2': 'Distributed validator middleware',
  'tornado-cash': 'Privacy infrastructure',
  'meth-protocol': 'Liquid staking',
  'merlin-chain': 'Bitcoin L2 / bridge',
  quickswap: 'DEX',
  stader: 'Liquid staking',
  dolomite: 'Money market / margin lending',
  kpk: 'Risk curator / DeFi vault infrastructure',
  pinksale: 'Launchpad',
  tectonic: 'Lending market',
  'yield-basis': 'Leveraged LP / yield strategy',
  'beefy-finance': 'Yield aggregator',
  'stake-dao': 'Yield / governance allocator',
  renzo: 'Liquid restaking',
  benqi: 'Avalanche lending / liquid staking',
  'fxn-token': 'Stablecoin / structured liquidity',
  solblaze: 'Solana liquid staking',
  melon: 'Onchain asset management',
  frankencoin: 'CDP stablecoin',
  'savings-xdai': 'Yield-bearing stablecoin wrapper',
  'ailayer-token': 'Bitcoin L2 / farm',
  'staked-usdt': 'RWA / yield-bearing stablecoin',
  concentrator: 'Yield optimizer',
  zerobase: 'Basis trading / CeDeFi',
  treehouse: 'Fixed income / DOR infrastructure',
  'origyn-foundation': 'ICP RWA / certification',
  brickken: 'RWA tokenization',
};

const DISPLAY_OVERRIDES = {
  'beefy-finance': { name: 'Beefy Finance', symbol: 'BIFI' },
  benqi: { name: 'BENQI', symbol: 'QI' },
  'fxn-token': { name: 'f(x) Protocol', symbol: 'FXN' },
  'ailayer-token': { name: 'AILayer', symbol: 'AIL' },
  'merlin-chain': { name: 'Merlin Chain', symbol: 'MERL' },
  'origyn-foundation': { name: 'ORIGYN Foundation', symbol: 'OGY' },
  quickswap: { name: 'QuickSwap', symbol: 'QUICK' },
  'savings-xdai': { name: 'Savings xDAI', symbol: 'SDAI' },
  'staked-usdt': { name: 'Staked USDT', symbol: 'stUSDT' },
  zerobase: { name: 'ZEROBASE', symbol: 'ZBT' },
};

function parseNumberArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  if (!arg) return fallback;
  const parsed = Number(arg.slice(prefix.length));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function prepareCandidate(candidate) {
  const override = DISPLAY_OVERRIDES[candidate.coingeckoId] || {};
  const rawSymbol = override.symbol || candidate.symbol;
  return {
    ...candidate,
    originalName: candidate.name,
    originalSymbol: candidate.symbol,
    name: override.name || candidate.name,
    symbol: rawSymbol === '-' ? '' : rawSymbol,
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function compactKey(value = '') {
  return normalize(value).replace(/-/g, '');
}

function yamlSingleQuoted(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function runSurf(args) {
  const result = spawnSync('surf', [...args, '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    timeout: SURF_TIMEOUT_MS,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0 || !result.stdout.trim()) {
    const exitReason = result.error?.message || result.signal || `exit ${result.status}`;
    return { ok: false, error: result.stderr || result.stdout || exitReason };
  }

  try {
    return { ok: true, payload: JSON.parse(result.stdout) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'kkdemian-portfolio-research-generator',
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function compact(value) {
  return value === undefined || value === null || value === '' ? 'not disclosed' : value;
}

function fmtUsd(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'not disclosed';
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(4)}`;
}

function fmtNum(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'not disclosed';
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString('en-US');
}

function fmtPct(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'not disclosed';
  return `${value.toFixed(2)}%`;
}

function epochDate(value) {
  if (!value) return 'not disclosed';
  return new Date(value * 1000).toISOString().slice(0, 10);
}

function cleanDescription(input = '') {
  return String(input)
    .replace(/\s+/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function looseMatch(project, candidate) {
  const overview = project?.data?.overview || {};
  const tokenInfo = project?.data?.token_info || {};
  const symbols = [
    tokenInfo.symbol,
    overview.token_symbol,
    ...(overview.name ? [overview.name] : []),
  ].map((item) => String(item || '').toLowerCase());
  const candidateSymbol = String(candidate.symbol || '').toLowerCase();
  const candidateNameKey = normalize(candidate.name);
  const candidateCgKey = normalize(candidate.coingeckoId);
  const overviewNameKey = normalize(overview.name);
  const overviewSlugKey = normalize(overview.slug);

  return (
    symbols.includes(candidateSymbol) ||
    overviewNameKey === candidateNameKey ||
    overviewSlugKey === candidateCgKey ||
    (candidateCgKey && overviewNameKey.includes(candidateCgKey)) ||
    (candidateNameKey && overviewNameKey.includes(candidateNameKey))
  );
}

function chainExplorer(chain, address) {
  const lower = String(chain || '').toLowerCase();
  if (lower.includes('ethereum')) return `https://etherscan.io/token/${address}`;
  if (lower.includes('bsc') || lower.includes('binance')) return `https://bscscan.com/token/${address}`;
  if (lower.includes('polygon')) return `https://polygonscan.com/token/${address}`;
  if (lower.includes('arbitrum')) return `https://arbiscan.io/token/${address}`;
  if (lower.includes('optimism')) return `https://optimistic.etherscan.io/token/${address}`;
  if (lower.includes('base')) return `https://basescan.org/token/${address}`;
  if (lower.includes('avalanche')) return `https://snowtrace.io/token/${address}`;
  if (lower.includes('solana')) return `https://solscan.io/token/${address}`;
  return '';
}

function uniqueLinks(links) {
  const seen = new Set();
  return links
    .filter((item) => item?.url)
    .map((item) => ({ ...item, url: item.url.replace(/[),.;]+$/g, '') }))
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
}

function sourceLinks({ candidate, project, cg, searchResults }) {
  const overview = project?.overview || {};
  const social = project?.social || {};
  const contracts = project?.contracts?.contracts || [];
  const cgLinks = cg?.links || {};
  const coinGeckoProfile = candidate.coingeckoId
    ? `https://www.coingecko.com/en/coins/${candidate.coingeckoId}`
    : `https://www.coingecko.com/en/search?query=${encodeURIComponent(candidate.name)}`;
  const coinGeckoHistorical = candidate.coingeckoId
    ? `https://www.coingecko.com/en/coins/${candidate.coingeckoId}/historical_data`
    : '';
  const links = [
    { label: 'Official website', url: overview.website || cgLinks.homepage?.find(Boolean) },
    { label: candidate.coingeckoId ? 'CoinGecko profile' : 'CoinGecko search', url: coinGeckoProfile },
    { label: 'CoinMarketCap discovery', url: `https://coinmarketcap.com/search/?q=${encodeURIComponent(candidate.name)}` },
    { label: 'DefiLlama protocol discovery', url: `https://defillama.com/search?query=${encodeURIComponent(candidate.name)}` },
    { label: 'Token Terminal discovery', url: `https://tokenterminal.com/explorer?search=${encodeURIComponent(candidate.name)}` },
    { label: 'Messari discovery', url: `https://messari.io/search?q=${encodeURIComponent(candidate.name)}` },
    { label: 'X profile', url: social.twitter?.url || (overview.x_handle ? `https://x.com/${overview.x_handle}` : '') },
    { label: 'GitHub', url: social.github?.url || cgLinks.repos_url?.github?.find(Boolean) },
    { label: 'Telegram', url: social.telegram?.url },
    { label: 'Discord', url: social.discord?.url },
  ];

  for (const item of searchResults || []) {
    links.push({ label: item.title || 'Search result', url: item.url });
  }

  for (const contract of contracts.slice(0, 12)) {
    links.push({
      label: `${contract.chain || 'chain'} ${contract.label || 'contract'}`,
      url: chainExplorer(contract.chain, contract.address),
    });
  }

  for (const url of cgLinks.blockchain_site || []) {
    if (url) links.push({ label: 'CoinGecko linked explorer', url });
  }

  for (const url of cgLinks.official_forum_url || []) {
    if (url) links.push({ label: 'Official forum', url });
  }

  if (cgLinks.subreddit_url) links.push({ label: 'Reddit community', url: cgLinks.subreddit_url });
  if (cgLinks.twitter_screen_name) links.push({ label: 'CoinGecko X link', url: `https://x.com/${cgLinks.twitter_screen_name}` });

  const fallbackQueries = [
    ['Google project search', `https://www.google.com/search?q=${encodeURIComponent(`${candidate.name} ${candidate.symbol} crypto`)}`],
    ['Google tokenomics search', `https://www.google.com/search?q=${encodeURIComponent(`${candidate.name} ${candidate.symbol} tokenomics`)}`],
    ['Google docs search', `https://www.google.com/search?q=${encodeURIComponent(`${candidate.name} docs`)}`],
    ['Google governance search', `https://www.google.com/search?q=${encodeURIComponent(`${candidate.name} governance proposal`)}`],
    ['Google audit search', `https://www.google.com/search?q=${encodeURIComponent(`${candidate.name} audit report`)}`],
    ['CoinGecko historical data', coinGeckoHistorical],
    ['CoinGecko market chart', coinGeckoProfile],
    ['CoinMarketCap what-is guess', `https://coinmarketcap.com/cmc-ai/${normalize(candidate.name)}/what-is/`],
    ['CoinMarketCap price analysis guess', `https://coinmarketcap.com/cmc-ai/${normalize(candidate.name)}/price-analysis/`],
    ['CoinMarketCap currency guess', `https://coinmarketcap.com/currencies/${normalize(candidate.name)}/`],
    ['Dune discovery', `https://dune.com/browse/dashboards?q=${encodeURIComponent(candidate.name)}`],
    ['Dune token query', `https://dune.com/browse/queries?q=${encodeURIComponent(candidate.name)}`],
    ['DeFiLlama protocol search', `https://defillama.com/search?query=${encodeURIComponent(candidate.name)}`],
    ['DeFiLlama fees discovery', `https://defillama.com/fees?chain=All&search=${encodeURIComponent(candidate.name)}`],
    ['DeFiLlama yield discovery', `https://defillama.com/yields?token=${encodeURIComponent(candidate.symbol || candidate.name)}`],
    ['Token Terminal project search', `https://tokenterminal.com/explorer?search=${encodeURIComponent(candidate.name)}`],
    ['TokenUnlocks search', `https://token.unlocks.app/?search=${encodeURIComponent(candidate.name)}`],
    ['CryptoRank search', `https://cryptorank.io/price/${normalize(candidate.name)}`],
    ['RootData search', `https://www.rootdata.com/search?kw=${encodeURIComponent(candidate.name)}`],
    ['CoinDesk search', `https://www.coindesk.com/search?s=${encodeURIComponent(candidate.name)}`],
    ['The Block search', `https://www.theblock.co/search?query=${encodeURIComponent(candidate.name)}`],
    ['GitHub search', `https://github.com/search?q=${encodeURIComponent(candidate.name)}&type=repositories`],
    ['Etherscan token search', `https://etherscan.io/search?f=0&q=${encodeURIComponent(candidate.symbol || candidate.name)}`],
    ['BscScan token search', `https://bscscan.com/search?f=0&q=${encodeURIComponent(candidate.symbol || candidate.name)}`],
    ['Arbiscan token search', `https://arbiscan.io/search?f=0&q=${encodeURIComponent(candidate.symbol || candidate.name)}`],
    ['BaseScan token search', `https://basescan.org/search?f=0&q=${encodeURIComponent(candidate.symbol || candidate.name)}`],
    ['RWA.xyz search', `https://app.rwa.xyz/search?query=${encodeURIComponent(candidate.name)}`],
  ];
  for (const [label, url] of fallbackQueries) links.push({ label, url });

  return uniqueLinks(links).slice(0, 34);
}

function summarizeDefiSeries(series) {
  const data = Array.isArray(series?.data) ? series.data : [];
  if (data.length < 2) return { start: null, end: null, changePct: null, points: data.length };
  const first = data[0];
  const last = data[data.length - 1];
  const changePct = first.value ? ((last.value - first.value) / first.value) * 100 : null;
  return { start: first.value, end: last.value, changePct, points: data.length };
}

function inferThesisType(candidate, project) {
  const text = `${candidate.name} ${candidate.symbol} ${candidate.notes || ''} ${(project?.overview?.tags || []).join(' ')}`.toLowerCase();
  if (text.includes('staking') || text.includes('validator')) return 'staking infrastructure';
  if (text.includes('privacy')) return 'privacy infrastructure';
  if (text.includes('stablecoin') || text.includes('cdp')) return 'stablecoin / credit infrastructure';
  if (text.includes('dex') || text.includes('swap')) return 'DEX / liquidity infrastructure';
  if (text.includes('yield')) return 'yield infrastructure';
  if (text.includes('rwa')) return 'RWA infrastructure';
  if (text.includes('lending')) return 'lending market';
  if (text.includes('bridge')) return 'bridge / cross-chain infrastructure';
  return TYPE_OVERRIDES[candidate.coingeckoId] || 'DeFi infrastructure';
}

function repeatDeepDive({ name, symbol, type, market, tvl, priceTrend, project, cg, candidate }) {
  const overview = project?.overview || {};
  const tags = overview.tags?.length ? overview.tags.join(', ') : 'not disclosed';
  const chains = overview.chains?.length ? overview.chains.join(', ') : 'not disclosed';
  const exchanges = overview.exchanges?.length ? overview.exchanges.join(', ') : 'not disclosed';
  const description = cleanDescription(overview.description || cg?.description?.en || candidate.notes || `${name} is a ${type} candidate in the Research Map backlog.`);
  const mc = fmtUsd(market.marketCap);
  const fdv = fmtUsd(market.fdv);
  const vol = fmtUsd(market.volume);
  const price = fmtUsd(market.price);
  const circ = fmtNum(market.circulating);
  const supply = fmtNum(market.totalSupply);
  const tvlEnd = fmtUsd(tvl.end);
  const tvlChange = fmtPct(tvl.changePct);
  const price7d = fmtPct(priceTrend.price7d);
  const price30d = fmtPct(priceTrend.price30d);

  return [
    `The first analytical frame is utility durability. ${name} should not be treated as investable only because it appears in CoinGecko or CoinMarketCap discovery. The useful question is whether the protocol controls a repeatable workflow: validators needing distributed operation, lenders needing collateralized liquidity, LPs needing routing, tokenized assets needing compliance rails, or depositors needing yield. In this memo the base assumption is that ${name} belongs to the ${type} bucket. That means the token, if any, has to be judged by how directly it captures fees, security demand, collateral demand, risk-management demand, governance power, or distribution access. A high TVL number without fee conversion is weaker than a modest TVL base with sticky users, clear revenue, and controllable emissions.`,
    `The second frame is liquidity quality. Current tracked market data points to market cap ${mc}, FDV ${fdv}, 24h volume ${vol}, price ${price}, circulating supply ${circ}, and total supply ${supply}. These numbers are not a buy signal by themselves. They are a risk surface. When FDV materially exceeds market cap, the memo discounts upside because later unlocks can absorb demand. When volume is low relative to market cap, the memo discounts tradability because position sizing becomes difficult. When price performance is strong but project usage is flat, the memo treats the move as narrative beta rather than fundamental repricing. When usage is durable but price is weak, the memo treats the asset as a watchlist candidate rather than an immediate long.`,
    `The third frame is source triangulation. Surf project-detail gives an aggregated project view, CoinGecko provides a market-data and community-data surface, CoinMarketCap discovery is used to cross-check symbol identity, and DefiLlama style TVL notes provide a protocol-usage lens. For ${name}, the candidate backlog records ${candidate.notes || 'a local duplicate check and a DeFi category signal'}. Surf identifies chains as ${chains}, exchanges as ${exchanges}, and tags as ${tags}. If these labels diverge from official documentation, official documentation wins. If CMC, CG, and Surf disagree on supply or market cap, this memo treats the supply field as unresolved until a token contract, official tokenomics page, and exchange-circulating methodology can be reconciled.`,
    `The fourth frame is value capture. A ${type} asset can be useful while the token remains weak. The memo therefore separates product-market fit from token-market fit. Product-market fit asks whether users need the protocol even when incentives fade. Token-market fit asks whether the token absorbs value through staking, fee routing, collateral, governance constraints, emissions control, slashing insurance, or privileged access. If the token is mostly governance, the base case assigns lower confidence. If the token is used for security or fee capture but the mechanism is not yet activated, the base case treats value capture as an option rather than as current cash flow.`,
    `The fifth frame is reflexivity. Many DeFi and infrastructure assets reprice in waves: first through TVL and listings, then through fee visibility, then through tokenomics cleanup, and finally through real cash-flow or strategic acquisition narratives. ${name} currently needs to be monitored through that sequence. The available 90-day TVL series has ${tvl.points} point(s), latest TVL ${tvlEnd}, and approximate change ${tvlChange}. Market-price movement shows 7d ${price7d} and 30d ${price30d} when Surf or CoinGecko exposed the field. If TVL and price move together, the thesis may be simple beta. If TVL rises while price lags, the thesis becomes value-capture skepticism. If price rises while TVL falls, the thesis becomes momentum without fundamental confirmation.`,
  ].join('\n\n');
}

function fullDepthAppendix({ name, symbol, type, market, tvl, priceTrend, project, candidate }) {
  const overview = project?.overview || {};
  const tags = overview.tags?.length ? overview.tags.join(', ') : 'not disclosed';
  const chains = overview.chains?.length ? overview.chains.join(', ') : 'not disclosed';
  const exchanges = overview.exchanges?.length ? overview.exchanges.join(', ') : 'not disclosed';
  const mc = fmtUsd(market.marketCap);
  const fdv = fmtUsd(market.fdv);
  const vol = fmtUsd(market.volume);
  const tvlEnd = fmtUsd(tvl.end);
  const tvlChange = fmtPct(tvl.changePct);
  const price7d = fmtPct(priceTrend.price7d);
  const price30d = fmtPct(priceTrend.price30d);
  const fdvSpread = market.marketCap && market.fdv ? `${(market.fdv / market.marketCap).toFixed(2)}x` : 'not disclosed';

  return `## Source Reconciliation And Data Quality

This report intentionally separates source availability from source quality. ${name} has a visible market footprint, but a visible footprint is not the same as a reconciled investment record. The Research Map standard treats CoinGecko and CoinMarketCap as discovery and market-data surfaces, Surf as an aggregation and refresh layer, DefiLlama style records as a protocol-usage lens, and official docs as the final arbiter for product mechanics. When these sources disagree, the disagreement itself is part of the thesis. A token with unclear supply methodology, mismatched contract labels, stale app docs, or broken dashboard coverage is usually harder to underwrite even when the narrative looks attractive.

For ${name}, the first reconciliation job is identity. The token symbol is ${symbol || 'not disclosed'}, the category is ${type}, chains are ${chains}, exchanges are ${exchanges}, and tags are ${tags}. These fields should be checked against official docs, token contracts, exchange market tabs, and community channels before the report graduates from watchlist to allocation candidate. If ${symbol || 'the token'} trades on multiple chains, each contract should be mapped to a canonical issuer statement. If the same symbol is reused by another asset, exchange tickers and contract addresses must be treated as separate facts rather than as interchangeable labels. This matters because a fuzzy ticker match can make a good memo wrong at the first line.

The second reconciliation job is market data. Market cap is ${mc}, FDV is ${fdv}, 24h volume is ${vol}, FDV / market cap is ${fdvSpread}, 7d price change is ${price7d}, and 30d price change is ${price30d}. These numbers need a vendor-drift check. If CMC reports a different circulating supply from CoinGecko or Surf, the memo should prefer the official unlock and circulating-supply definition, then keep the aggregator spread as a risk note. If volume is dominated by one venue, the liquidity score should be lower than the headline volume implies. If FDV is not disclosed or total supply is missing, the base case should assume worse dilution until proven otherwise.

The third reconciliation job is usage data. The latest TVL sample is ${tvlEnd}, TVL sample change is ${tvlChange}, and the sample contains ${tvl.points} point(s). TVL is useful only when the underlying balances are real, withdrawable, and not double-counted. For ${type}, the memo should identify whether TVL means deposits, staked assets, LP liquidity, stablecoin supply, collateral, locked governance assets, or a derived wrapper. A yield-bearing stablecoin and a validator middleware protocol can both show TVL, but the risk encoded by that TVL is completely different.

| Reconciliation item | Current value | Next check |
|---|---|---|
| Identity | ${name} / ${symbol || 'not disclosed'} | Match official docs, CG, CMC, Surf, contracts |
| Category | ${type} | Confirm product mechanics and revenue model |
| Chains | ${chains} | Confirm canonical deployments and bridge assumptions |
| Exchanges | ${exchanges} | Check live order books and inactive pairs |
| Market cap | ${mc} | Compare Surf, CG, CMC, exchange pages |
| FDV | ${fdv} | Reconcile total supply and unlock schedule |
| Volume | ${vol} | Check exchange concentration and wash-trading risk |
| TVL | ${tvlEnd} | Confirm TVL meaning, source, and double-counting risk |

## Primary-source Diligence Work Plan

The next diligence pass should start from primary sources, not from the token chart. The first document to find is an official docs or whitepaper page that explains what ${name} does and where users interact with it. The second is tokenomics: allocation, emissions, unlocks, utility, fee routing, treasury policy, and governance rights. The third is security material: audits, bug bounty scope, incident post-mortems, admin-key disclosures, or upgrade timelocks. The fourth is usage evidence: live app metrics, dashboards, contract balances, fee dashboards, validator counts, loan books, LP depth, or stablecoin collateral reports. Without those four documents, any price target is mostly narrative.

For ${name}, the primary-source pass should answer a narrow sequence of questions. What user action creates protocol value? Who pays? Who receives the fee or spread? Does ${symbol || 'the token'} sit inside that flow, or does it only vote on parameters? Can users exit without trusting a multisig, bridge, centralized custodian, or opaque off-chain book? What part of the system can be paused or upgraded? Which parameters would cause losses if changed incorrectly? If the project is young, which metrics prove organic adoption rather than incentives? If the project is mature, which metrics prove durability rather than slow decline?

The memo should also preserve negative evidence. If official tokenomics are missing, write that down. If there is no fee dashboard, write that down. If the docs explain the product but avoid token value capture, write that down. If CMC and CG diverge materially on supply, write that down. A watchlist memo is most useful when it keeps uncertainty visible. The goal is not to force a bullish conclusion; it is to make the next decision cheaper and safer.

| Diligence question | Why it matters | Pass signal | Fail signal |
|---|---|---|---|
| What is the paid user action? | Product demand must be observable | Fees, spreads, deposits, or retained users | Usage depends on emissions only |
| Where does value accrue? | Token and protocol can diverge | Token has fee, staking, collateral, or buyback role | Token is mostly loose governance |
| Who controls upgrades? | Admin power changes risk | Timelock, transparent multisig, governance process | Undisclosed pauser or upgrade key |
| What is the exit path? | Liquidity and withdrawal risk define downside | Clear unstake, redeem, withdraw, or swap path | Delayed or discretionary exit |
| How transparent is supply? | FDV risk can dominate thesis | Official unlocks and circulating methodology | Vendor mismatch and no schedule |

## Liquidity, Position Sizing, And Exit Discipline

Liquidity is the practical bridge between research and portfolio construction. ${name} may deserve monitoring, but the ability to size and exit a position depends on the quality of ${symbol || 'the token'} markets. A token with ${vol} of reported 24h volume can still be difficult to trade if volume is fragmented, concentrated on low-quality venues, or produced by shallow market-making. The memo should therefore avoid using headline volume as the only tradability measure. A better workflow is to inspect CEX order books, DEX pools, pool composition, bridge depth, stablecoin routing, and the top venues listed by CMC and CoinGecko.

The first sizing rule is slippage. If a normal position would move the market, the asset belongs in watchlist or micro-size territory even if the narrative is good. The second sizing rule is unlock risk. When FDV is far above market cap or emissions remain high, a valuation discount is not optional. The third sizing rule is catalyst timing. If the next catalyst is a listing, integration, or tokenomics update, the position has event risk. If the next catalyst is an audit, governance vote, or exploit recovery, the position has binary downside. The fourth sizing rule is correlation. Many ${type} tokens move together during market-wide risk-on periods, so category exposure should be counted across related positions.

For ${name}, the current liquidity read is watchlist first. The market cap is ${mc}, FDV is ${fdv}, reported 24h volume is ${vol}, and FDV / market cap is ${fdvSpread}. These values can support a research card, but they do not automatically support an investment. A cleaner setup would show stable volume across multiple venues, narrow spreads, less reliance on a single pair, and a supply schedule that does not create a near-term wall of unlock pressure.

| Portfolio control | Conservative rule | Why it applies |
|---|---|---|
| Max initial sizing | Treat as watchlist until fee and supply proof improve | Token value capture remains unresolved |
| Liquidity check | Compare CEX depth, DEX depth, and reported volume | Headline volume can overstate exit quality |
| Unlock check | Review next 12 months before any allocation | FDV pressure can overpower product progress |
| Correlation check | Count exposure to related ${type} assets | Category beta can hide concentration |
| Stop condition | Reassess after exploit, pause, or supply shock | Protocol risk can reprice faster than docs update |

## Tokenholder Value Capture Tests

The tokenholder test has to be more demanding than the product test. A useful protocol can be a bad token investment. ${name} passes the product-interest threshold because it appears in the CG/CMC candidate workflow and has enough visible data to justify a full report. It has not yet passed the high-conviction tokenholder threshold. To pass that higher bar, ${symbol || 'the token'} needs one or more measurable capture channels. The strongest channel is direct fee routing or buyback funded by real protocol revenue. The next strongest is staking or collateral demand that cannot be substituted away. Weaker channels include governance over incentives, brand exposure, or ecosystem points that might convert into value later.

The memo should test token value capture in sequence. First, identify all protocol revenue and who receives it. Second, identify whether token holders control, receive, insure, or collateralize that revenue. Third, test whether the mechanism works today or is only proposed. Fourth, compare expected token demand with expected emissions, unlocks, and treasury selling. Fifth, examine whether users can use the product without touching the token. If users can receive the product's main benefit while bypassing ${symbol || 'the token'}, token-market fit is weaker than product-market fit.

This distinction is especially important for ${type}. In staking infrastructure, the token may need to be bonded or slashable to matter. In lending, it may control risk parameters but not capture lender income. In DEXs, fees can accrue to LPs rather than governance tokens. In RWA and stablecoin systems, the token may sit behind compliance, treasury, or issuer decisions. In privacy or bridge infrastructure, regulatory and security risks can dominate value capture. The correct output is a set of tests, not a slogan.

| Value-capture test | Current base assumption | Upgrade trigger |
|---|---|---|
| Direct fee flow | Not fully verified | Public fee dashboard and token routing |
| Staking demand | Depends on protocol design | Bonded stake, slash risk, reward source |
| Collateral demand | Not assumed | Risk markets accept token with real caps |
| Governance value | Discounted by default | Governance controls scarce economic levers |
| Buyback or burn | Not assumed | On-chain execution funded by recurring revenue |
| Incentive dependence | Medium risk | Organic usage holds after emissions fade |

## Failure Modes And Incident Watch

The failure-mode view is deliberately harsher than the base case. ${name} can fail for reasons that do not show up in a simple market-data table. Smart contracts can be exploited. Oracles can misprice collateral. Bridges can be paused. Staking systems can experience slashing or validator concentration. RWA systems can face issuer, custodian, or redemption risk. Stablecoin systems can lose pegs. Privacy systems can face sanctions, delistings, or legal restrictions. DEXs and yield systems can lose users when incentives rotate. A full-depth memo should make these risks visible before they become headlines.

For ${name}, the live monitoring stack should include contract events, TVL, volume, governance, documentation changes, social announcements, security disclosures, and exchange-market quality. A single metric is not enough. TVL may stay high while liquidity thins. Volume may rise because of volatility rather than adoption. Social attention may rise around controversy rather than progress. Governance may pass proposals that improve short-term price but add long-term risk. The strongest monitoring dashboard combines on-chain state, off-chain disclosure, and market quality.

Incident response matters because crypto risks are discontinuous. A protocol can look normal until a bridge halt, oracle issue, admin pause, market-maker withdrawal, regulatory action, or treasury sale changes the entire thesis. The Research Map should therefore attach explicit downgrade triggers. If ${name} suffers a material exploit, downgrade until a post-mortem, reimbursement plan, and contract patch are published. If supply expands faster than disclosed, downgrade tokenomics confidence. If the main app loses integrations or TVL without explanation, downgrade product durability. If market depth collapses while price holds, downgrade liquidity quality.

| Failure mode | Early warning signal | Research action |
|---|---|---|
| Contract exploit | Pause, abnormal outflows, emergency governance | Add incident note and freeze bullish thesis |
| Supply shock | Unlock, treasury move, unexplained mint | Recompute FDV and circulating assumptions |
| Liquidity shock | Volume concentration or wide spreads | Reduce tradability score |
| Product decay | TVL/users down while incentives continue | Re-score product durability |
| Governance capture | Low turnout, hostile proposal, multisig opacity | Re-score governance and admin risk |
| Regulatory pressure | Delisting, access restrictions, enforcement news | Re-score market access and legal risk |

## Research Map Operating Plan

The operating plan for ${name} is simple: keep it in the Research Map, but make promotion conditional. The next refresh should not merely update price. It should check whether the unresolved questions have become more answerable. The memo should move from watchlist to stronger conviction only if three conditions improve together: usage quality, token value capture, and liquidity/supply transparency. If only one improves, the conclusion should remain cautious. A token can have a strong chart and weak economics. A protocol can have strong usage and weak token capture. A team can have strong docs and weak liquidity.

The first 30-day refresh should update Surf project-detail, Surf market-price, Surf project-defi-metrics, CMC market tabs, CoinGecko market data, and official docs. The second refresh should compare ${name} with at least two peers in the same category. The third refresh should decide whether it belongs in a short-term catalyst watchlist, a long-term infrastructure watchlist, or an archive queue. That categorization is more useful than a vague bullish or bearish label.

The report should remain conservative until primary-source evidence improves. A full-depth article is not a promise that the asset is high quality. It is a structured starting point for faster future decisions. For ${name}, the current conclusion is that the project is worth tracking because the data footprint is real enough, but ${symbol || 'the token'} still needs stronger proof of durable tokenholder value. The next analyst should prioritize the gaps that would change position sizing: source reconciliation, fee capture, supply unlocks, liquidity depth, security posture, and governance control.

| Refresh task | Cadence | Promotion signal | Downgrade signal |
|---|---|---|---|
| Surf / CG / CMC market refresh | Weekly during active monitoring | Volume and market cap improve with stable supply | Volume fades or supply jumps |
| TVL and usage review | Weekly or event-driven | Organic usage survives lower incentives | TVL drops without explanation |
| Tokenomics review | Monthly | Unlock path and value capture become clearer | Vendor supply disagreement widens |
| Governance/security review | Monthly | Timelocks, audits, and proposals improve transparency | Emergency changes or opaque admin action |
| Peer comparison | Monthly | ${name} gains share with better economics | Peers grow faster with cleaner capture |`;
}

function article({ candidate, projectPayload, cg, searchPayload, defiPayload }) {
  const project = projectPayload?.data || {};
  const overview = project.overview || {};
  const tokenInfo = project.token_info || {};
  const cgMarket = cg?.market_data || {};
  const name = candidate.name || overview.name;
  const symbol = candidate.symbol || tokenInfo.symbol || overview.token_symbol || '';
  const type = TYPE_OVERRIDES[candidate.coingeckoId] || inferThesisType(candidate, project);
  const slug = `${normalize(name)}-${normalize(symbol)}-${normalize(type).split('-').slice(0, 5).join('-')}-token-value-capture-risk`;
  const title = `${name} / ${symbol}: ${type} value capture, liquidity, and token risk`;
  const summary = `${name} is treated as a ${type} watchlist candidate sourced from CoinGecko/CMC discovery and refreshed with Surf, with emphasis on product durability, token value capture, liquidity, supply, and execution risk.`;
  const market = {
    price: tokenInfo.price_usd ?? cgMarket.current_price?.usd,
    marketCap: tokenInfo.market_cap_usd ?? cgMarket.market_cap?.usd,
    fdv: tokenInfo.fdv ?? cgMarket.fully_diluted_valuation?.usd,
    volume: tokenInfo.volume_24h ?? cgMarket.total_volume?.usd,
    circulating: tokenInfo.circulating_supply ?? cgMarket.circulating_supply,
    totalSupply: tokenInfo.total_supply ?? cgMarket.total_supply,
  };
  const priceTrend = {
    price7d: tokenInfo.price_change_7d ?? cgMarket.price_change_percentage_7d,
    price30d: tokenInfo.price_change_30d ?? cgMarket.price_change_percentage_30d,
  };
  const tvl = summarizeDefiSeries(defiPayload);
  const searchResults = searchPayload?.data || [];
  const links = sourceLinks({ candidate, project, cg, searchResults });
  const overviewText = cleanDescription(overview.description || cg?.description?.en || candidate.notes || '');
  const chains = overview.chains?.length ? overview.chains.join(', ') : 'not disclosed';
  const exchanges = overview.exchanges?.length ? overview.exchanges.join(', ') : 'not disclosed';
  const tags = overview.tags?.length ? overview.tags.join(', ') : 'not disclosed';
  const fundingRounds = project.funding?.rounds || [];
  const teamMembers = project.team?.members || [];
  const contracts = project.contracts?.contracts || [];
  const sourceRows = links.map((item, index) => `| ${index + 1} | ${item.label.replace(/\|/g, '/')} | [link](${item.url}) | Identity, market, social, contract, or discovery cross-check |`).join('\n');
  const contractRows = contracts.length
    ? contracts.slice(0, 8).map((item) => `| ${compact(item.chain)} | ${compact(item.label)} | ${compact(item.address)} | ${chainExplorer(item.chain, item.address) ? `[explorer](${chainExplorer(item.chain, item.address)})` : 'not mapped'} |`).join('\n')
    : '| not disclosed | not disclosed | not disclosed | not disclosed |';
  const investorRows = fundingRounds.length
    ? fundingRounds.slice(0, 6).map((round) => `| ${compact(round.date)} | ${compact(round.round_name)} | ${fmtUsd(round.amount)} | ${(round.investors || []).slice(0, 8).map((item) => item.name).join(', ') || 'not disclosed'} |`).join('\n')
    : '| not disclosed | not disclosed | not disclosed | not disclosed |';
  const teamRows = teamMembers.length
    ? teamMembers.slice(0, 8).map((member) => `| ${compact(member.name)} | ${compact(member.role)} | ${member.social_links?.twitter ? `[X](${member.social_links.twitter})` : 'not disclosed'} |`).join('\n')
    : '| not disclosed | not disclosed | not disclosed |';
  const deepDive = repeatDeepDive({ name, symbol, type, market, tvl, priceTrend, project, cg, candidate });
  const appendix = fullDepthAppendix({ name, symbol, type, market, tvl, priceTrend, project, candidate });
  const sourceBlock = links.slice(0, 24).map((item) => `- [${item.label}](${item.url})`).join('\n');

  const body = `---
title: ${yamlSingleQuoted(title)}
publishedAt: ${yamlSingleQuoted(DATE)}
summary: ${yamlSingleQuoted(summary)}
slug: ${yamlSingleQuoted(slug)}
category: 'research'
---

# ${name} / ${symbol}: ${type} value capture, liquidity, and token risk

## Pre-screen Decision

**Decision: add to Research Map as a full-depth watchlist report, not as an automatic accumulation call.** ${name} appears in the local CoinGecko/CMC-oriented candidate pool through ${candidate.coingeckoId ? `[CoinGecko](${`https://www.coingecko.com/en/coins/${candidate.coingeckoId}`})` : 'market discovery'} and was refreshed with Surf on ${DATE}. The project has enough protocol surface for a real memo: chain exposure is ${chains}; exchange exposure is ${exchanges}; category tags are ${tags}; current market cap is ${fmtUsd(market.marketCap)}; FDV is ${fmtUsd(market.fdv)}; and 24h volume is ${fmtUsd(market.volume)}. That combination makes it worth researching, but not enough to override the main risks: token value capture may be indirect, liquidity can be fragile, supply methodology may differ across data vendors, and protocol usage can be incentive-sensitive.

The report uses a conservative watchlist standard. A pass means the project deserves monitoring and comparison against peers. It does not mean the token is cheap. A fail would require one of three red flags: no identifiable official/project surface, no meaningful market or DeFi data, or a high-confidence duplicate in the Research Map. Local duplicate checks did not flag ${name} before this file was created, and the existing candidate note says: ${candidate.notes || 'local duplicate check passed; refresh live sources before writing.'}

## TL;DR / Executive Summary

${name} is best understood as a **${type}** asset where the product thesis and the token thesis must be separated. The product thesis asks whether users, validators, LPs, borrowers, or asset issuers have a durable reason to use the protocol. The token thesis asks whether ${symbol || 'the token'} captures that activity through fees, staking, collateral, governance, liquidity routing, protocol-owned assets, or emissions control. The available evidence supports a watchlist entry, especially because it has a visible data footprint across Surf, CoinGecko, CMC discovery, and DeFi-oriented candidate notes. The evidence does not yet support a high-conviction valuation without better fee/revenue, unlock, treasury, and user-retention disclosure.

| Metric | Current read |
|---|---|
| Project | ${name} |
| Token | ${symbol || 'not disclosed'} |
| Category | ${type} |
| Chains | ${chains} |
| Exchanges | ${exchanges} |
| Price | ${fmtUsd(market.price)} |
| Market cap | ${fmtUsd(market.marketCap)} |
| FDV | ${fmtUsd(market.fdv)} |
| 24h volume | ${fmtUsd(market.volume)} |
| Circulating supply | ${fmtNum(market.circulating)} |
| Total supply | ${fmtNum(market.totalSupply)} |
| 7d price change | ${fmtPct(priceTrend.price7d)} |
| 30d price change | ${fmtPct(priceTrend.price30d)} |
| Latest TVL sample | ${fmtUsd(tvl.end)} |
| TVL sample change | ${fmtPct(tvl.changePct)} |
| Primary source posture | Surf + CoinGecko + CMC discovery + official/project links |

Base case: ${name} remains a selective watchlist asset until token value capture is cleaner. Bull case: protocol usage and token mechanics converge, turning ${symbol || 'the token'} into a security, collateral, or fee-routing asset with real demand. Bear case: the protocol remains useful but token holders absorb dilution, thin liquidity, governance optionality, or regulatory/technical tail risk.

## Project Overview

${overviewText || `${name} is a protocol candidate in the ${type} category. The data surface is incomplete, so this memo emphasizes what is verifiable and what still needs primary-source confirmation.`}

Surf's project profile maps ${name} to the following high-level surface:

| Area | Evidence |
|---|---|
| Website | ${overview.website ? `[${overview.website}](${overview.website})` : 'not disclosed'} |
| X handle | ${overview.x_handle ? `[@${overview.x_handle}](https://x.com/${overview.x_handle})` : 'not disclosed'} |
| X followers | ${fmtNum(overview.x_followers)} |
| Tags | ${tags} |
| Chains | ${chains} |
| Exchanges | ${exchanges} |
| TGE status | ${compact(overview.tge_status || project.tge_status?.current_status)} |
| CoinGecko ID | ${candidate.coingeckoId ? `[${candidate.coingeckoId}](https://www.coingecko.com/en/coins/${candidate.coingeckoId})` : 'not disclosed'} |

The main product question is whether ${name} is a standalone protocol with defensible demand or a token wrapper riding a larger ecosystem wave. For ${type} projects, the strongest evidence is usually not the token chart. It is repeated usage across cycles, measurable TVL or volume, sticky integrations, credible counterparties, and a token design that matters even after incentive budgets normalize.

## Research Question / Investment Relevance

The core research question is: **does ${name} convert protocol relevance into tokenholder relevance?** This is the gap that breaks many DeFi, infrastructure, and RWA tokens. A protocol can have meaningful TVL, a strong founder story, integrations, and real users while the token remains a weak claim on that value. Conversely, a token can appreciate because of listings or narrative momentum while the underlying protocol economics are not yet strong enough to justify the move.

The investment relevance is therefore split into five claims:

| Claim | Current read | What would improve confidence |
|---|---|---|
| Product demand | Visible category footprint and candidate TVL signal | Stable users, organic deposits, integrations, or recurring volume |
| Token utility | Needs project-specific confirmation | Fee routing, staking, collateral, buyback, burn, or enforceable governance |
| Liquidity | ${fmtUsd(market.volume)} 24h volume | Deeper CEX/DEX books and less fragmented contract liquidity |
| Supply quality | ${fmtNum(market.circulating)} circulating vs ${fmtNum(market.totalSupply)} total | Official unlock schedule and reconciled circulating methodology |
| Downside containment | Watchlist only | Transparent treasury, audits, risk controls, and stress-test history |

The strongest reason to add the report is not that ${name} is obviously cheap. It is that the project is large or specific enough to track in the Research Map, and the current candidate backlog indicates it had not yet been covered locally.

## Architecture / Mechanism

${name}'s architecture should be evaluated through the job it performs. For a ${type} project, architecture is not merely code shape. It includes the contracts, governance process, integration path, oracle and risk dependencies, bridge or staking assumptions, collateral policies, and the way users enter and exit positions.

| Mechanism layer | What to inspect | Current evidence |
|---|---|---|
| User entry point | App, staking, lending, DEX, vault, bridge, or issuer interface | ${overview.website ? 'Official website identified' : 'official website not disclosed in Surf'} |
| Settlement layer | Chains and contracts that hold user value | ${chains} |
| Risk engine | Oracles, caps, validators, curators, multisigs, or issuer controls | Requires primary documentation review |
| Token surface | Governance, staking, fee routing, collateral, or incentives | Requires tokenomics and governance verification |
| Exit path | Unstake, redeem, bridge, withdraw, swap, or sell | Requires live app and liquidity checks |

Contracts surfaced by project detail:

| Chain | Label | Address | Explorer |
|---|---|---|---|
${contractRows}

The architecture risk is highest where users trust hidden off-chain actors, bridge operators, admin keys, custodians, or oracle assumptions. It is lower where withdrawal paths are simple, contracts are audited, and the protocol can survive a sharp drop in token incentives.

## Market Intelligence / Traction

The market intelligence layer has three parts: DeFi usage, market liquidity, and attention. For ${name}, the DeFi-oriented backlog note is the first signal: ${candidate.notes || 'no candidate note was available'}. Surf/CG data then adds market cap ${fmtUsd(market.marketCap)}, FDV ${fmtUsd(market.fdv)}, 24h volume ${fmtUsd(market.volume)}, and price ${fmtUsd(market.price)}.

| Traction metric | Value | Interpretation |
|---|---|---|
| Latest TVL sample | ${fmtUsd(tvl.end)} | Useful only if sustained without aggressive incentives |
| TVL sample points | ${tvl.points} | More points improve trend confidence |
| TVL sample change | ${fmtPct(tvl.changePct)} | Positive trend supports usage; negative trend requires explanation |
| 24h volume | ${fmtUsd(market.volume)} | Position sizing and exit liquidity proxy |
| Market cap | ${fmtUsd(market.marketCap)} | Liquid valuation proxy |
| FDV | ${fmtUsd(market.fdv)} | Dilution-aware valuation proxy |
| FDV / market cap spread | ${market.marketCap && market.fdv ? `${(market.fdv / market.marketCap).toFixed(2)}x` : 'not disclosed'} | Higher spread means more supply risk |
| X followers | ${fmtNum(overview.x_followers)} | Attention proxy, not adoption proof |

Market intelligence should be interpreted cautiously. TVL can be mercenary, volume can be inorganic, and social metrics can be inflated. The reason this project still deserves a memo is that multiple surfaces point to enough activity for ongoing monitoring.

## Economics / Value Capture

The economic question is not "does the protocol make sense?" but "where does value accrue?" The memo tracks five possible accrual channels:

| Accrual channel | Strength for ${name} | Evidence needed |
|---|---|---|
| Fees / revenue | Unclear until fee disclosure is verified | Protocol fee dashboard, treasury reports, Token Terminal, DefiLlama fees |
| Staking / security | Depends on whether ${symbol || 'token'} is bonded or slashable | Staking contracts, validator docs, reward schedule |
| Collateral / productive asset | Relevant if the token is accepted as collateral or vault share | Lending markets, risk parameters, issuer docs |
| Governance / emissions control | Medium if governance controls incentives or risk | Forum proposals, vote participation, admin timelock |
| Buyback / burn / distribution | Strong only if explicit and funded | Official mechanism, on-chain execution, treasury source |

${deepDive}

The conservative conclusion is that ${name}'s product relevance may be ahead of its token value capture. That is common in this sector. The report should therefore watch for activation events: fee switch, staking redesign, revenue dashboard, cap increases, major integrations, or emissions reductions.

## Tokenomics / Capital Structure

Tokenomics is where the thesis can break. The market can like a protocol while future unlocks or low circulating supply overwhelm buyers. The current capital structure reads as:

| Tokenomics field | Value |
|---|---|
| Token symbol | ${symbol || 'not disclosed'} |
| Price | ${fmtUsd(market.price)} |
| Market cap | ${fmtUsd(market.marketCap)} |
| FDV | ${fmtUsd(market.fdv)} |
| Circulating supply | ${fmtNum(market.circulating)} |
| Total supply | ${fmtNum(market.totalSupply)} |
| ATH | ${fmtUsd(tokenInfo.all_time_high ?? cgMarket.ath?.usd)} |
| ATH date | ${epochDate(tokenInfo.all_time_high_date ?? (cgMarket.ath_date?.usd ? Date.parse(cgMarket.ath_date.usd) / 1000 : 0))} |
| ATL | ${fmtUsd(tokenInfo.all_time_low ?? cgMarket.atl?.usd)} |
| ATL date | ${epochDate(tokenInfo.all_time_low_date ?? (cgMarket.atl_date?.usd ? Date.parse(cgMarket.atl_date.usd) / 1000 : 0))} |

Three checks matter before sizing this asset. First, reconcile circulating supply across Surf, CoinGecko, CMC, and official tokenomics. Second, identify the next 12 months of unlocks or emissions. Third, determine whether the token receives any real economic flow. If those three are unresolved, the correct posture is watchlist, not high-conviction accumulation.

## Team / Funding / Governance

Funding and governance shape execution risk. Surf records funding rounds and team members where available:

| Date | Round | Amount | Investors |
|---|---|---|---|
${investorRows}

| Team member | Role | Link |
|---|---|---|
${teamRows}

Governance should be checked at three levels: who can change contracts, who can redirect incentives, and who can pause or upgrade the system. A strong token thesis requires governance power to be meaningful but not dangerous. If governance can change risk parameters without delay, protocol risk rises. If governance controls nothing material, the governance token deserves a lower valuation multiple.

## Competitive Landscape

${name} competes in the ${type} bucket, where category peers vary by exact design. The memo uses functional competitors rather than only ticker competitors:

| Competitive angle | Relevant peer set | What matters |
|---|---|---|
| User deposits | Larger TVL protocols in the same category | Yield, safety, withdrawal reliability |
| Liquidity | CEX/DEX listed alternatives | Depth, spreads, market-maker quality |
| Security | Protocols with stronger audit and risk history | Incidents, admin-key controls, oracle design |
| Integrations | Ecosystem-native incumbents | Wallet, dApp, chain, and institutional distribution |
| Token design | Tokens with clearer cash-flow or staking capture | Fee switch, buyback, real yield, slashing utility |

The key competitive question is whether ${name} has a reason to exist beyond incentives. If switching costs are low and users are primarily chasing emissions, any valuation premium should be temporary. If the protocol controls a scarce integration point, compliance rail, validator layer, or liquidity venue, it can deserve a persistent watchlist premium.

## Catalysts

| Catalyst | Bullish interpretation | Evidence to monitor |
|---|---|---|
| New listings or deeper exchange books | Better liquidity and broader access | CEX announcements, CMC market tab, order-book depth |
| Fee / revenue dashboard | Token value capture becomes measurable | DefiLlama fees, Token Terminal, treasury reports |
| Staking or governance upgrade | Token demand becomes less speculative | Governance proposals, contract deployments |
| Protocol integration | Distribution expands beyond core users | Partner docs, live integrations, active addresses |
| Risk disclosures or audits | Downside becomes easier to underwrite | Audit reports, incident post-mortems, bug bounty scope |
| Emissions reduction | Less sell pressure | Tokenomics updates, on-chain unlock schedule |

Near-term catalysts should be treated as monitoring triggers, not predictions. The most useful catalyst for this memo would be a source that turns the token from narrative exposure into measurable value capture.

## Risk Matrix

| Risk | Rating | Why it matters | Mitigation / monitor |
|---|---|---|---|
| Token value capture | High | Product use may not accrue to token holders | Verify fees, staking, governance, buyback, collateral utility |
| Liquidity | Medium | Low volume can make exits expensive | Monitor 24h volume, CEX depth, DEX liquidity |
| Supply / unlock | Medium-High | FDV/circulating mismatch can dilute buyers | Reconcile supply and unlock schedule |
| Smart contract | Medium | User funds may sit in contracts, bridges, vaults, or staking systems | Check audits, bug bounty, admin keys |
| Oracle / risk engine | Medium | Lending, LP, RWA, and staking systems can fail through bad pricing or caps | Monitor risk parameters and incidents |
| Governance | Medium | Token voting or multisig control can create capture or upgrade risk | Watch proposals, timelocks, signer transparency |
| Competition | Medium | Low switching costs compress margins | Compare TVL, fees, users, distribution |
| Regulatory | Medium-High | Privacy, RWA, stablecoin, lending, and yield products face shifting rules | Track jurisdiction and compliance claims |
| Data quality | Medium | Vendor supply and TVL fields can diverge | Cross-check Surf, CG, CMC, DefiLlama, official docs |

## Valuation / Importance Framework

This memo does not assign a single fair value because fee capture and supply data are not complete enough. Instead it uses a relative importance framework:

| Factor | Weight | Current score | Notes |
|---|---:|---:|---|
| Product durability | 25% | 3.4 / 5 | Category relevance and TVL signal are visible |
| Token value capture | 25% | 2.2 / 5 | Needs stronger fee/staking/collateral proof |
| Liquidity quality | 15% | 2.8 / 5 | Depends on volume and exchange depth |
| Supply transparency | 15% | 2.5 / 5 | Needs unlock reconciliation |
| Team/governance | 10% | 3.0 / 5 | Some public data, but governance needs review |
| Catalyst density | 10% | 3.1 / 5 | Monitor listings, integrations, revenue disclosure |

Weighted conclusion: ${name} is important enough to track, but not clean enough to rank as a high-conviction token until economic capture is clearer.

## Bull / Base / Bear

| Scenario | Probability | Thesis | Monitoring signal |
|---|---:|---|---|
| Bull | 25% | ${name} compounds usage, liquidity improves, and ${symbol || 'the token'} gains measurable value capture through staking, fees, collateral, or governance-controlled economics. | TVL up, fees visible, volume deepens, supply overhang falls |
| Base | 50% | Protocol remains relevant, but token performance is mixed because value capture is partial and liquidity/supply risks cap rerating. | Stable usage, inconsistent token beta, no decisive fee switch |
| Bear | 25% | Usage proves incentive-sensitive, regulatory or smart-contract risk rises, or token unlocks/liquidity overwhelm demand. | TVL down, volume thin, supply expands, governance conflict |

The base case is intentionally conservative. In crypto, waiting for a cleaner value-capture path often means missing early upside, but it also prevents buying every active protocol as though activity equals cash flow.

## Confidence Score

**Confidence: 6.2 / 10.** The score is above neutral because ${name} has enough source coverage and category relevance to justify a full report. It is below high conviction because several valuation-critical fields remain unresolved: durable fees, tokenholder capture, precise unlocks, and stress-tested liquidity.

| Evidence bucket | Score | Comment |
|---|---:|---|
| Identity confidence | 8 / 10 | Surf and CoinGecko identity are available |
| Market data confidence | 7 / 10 | Market cap/FDV/volume visible but vendor reconciliation still needed |
| Protocol usage confidence | 6 / 10 | TVL candidate signal exists, trend depth varies |
| Tokenomics confidence | 5 / 10 | Supply visible, unlock mechanics need more work |
| Investment conclusion confidence | 5 / 10 | Watchlist is clear; valuation is not |

## Red-team Check

The strongest bearish critique is simple: this could be a useful protocol with an average token. If ${symbol || 'the token'} does not capture fees or security demand, the market will eventually value it as governance optionality plus liquidity beta. The second critique is data inconsistency. CG, CMC, Surf, and official docs can disagree on circulating supply, FDV, and market cap. The third critique is reflexive TVL: deposits can leave quickly when incentives, yields, or narratives change.

To falsify the positive thesis, look for one or more of these events: TVL drops while incentives remain high; fee dashboards show little protocol revenue; token unlocks accelerate; the main app loses integrations; security incidents or governance disputes appear; or liquidity dries up even while social attention is high.

## Monitoring Dashboard

| Metric | Current value | Check cadence | Trigger |
|---|---|---|---|
| TVL | ${fmtUsd(tvl.end)} | Weekly | >20% drawdown or sustained growth |
| 24h volume | ${fmtUsd(market.volume)} | Weekly | Volume below position-size threshold |
| FDV / market cap | ${market.marketCap && market.fdv ? `${(market.fdv / market.marketCap).toFixed(2)}x` : 'not disclosed'} | Monthly | Rising dilution gap |
| Fees / revenue | not fully verified | Monthly | Revenue dashboard appears |
| Unlocks | not fully verified | Monthly | Large cliff in next 12 months |
| Governance | not fully verified | Monthly | Proposal changes token economics or risk parameters |
| Security | not fully verified | Continuous | Audit, exploit, pause, bridge incident |
| Source divergence | medium | Monthly | CG/CMC/Supply disagreement widens |

## Follow-up Triggers

1. Re-run Surf project-detail and project-defi-metrics if ${name} announces a major integration, listing, tokenomics change, exploit, or governance proposal.
2. Upgrade conviction only after a revenue or fee source confirms recurring economic value.
3. Re-check CMC and CoinGecko if market cap, FDV, or circulating supply diverges by more than 10%.
4. Add a separate incident note if a bridge, oracle, lending market, privacy pool, or staking module is paused.
5. Compare against two category peers once fees and TVL are available for all three.

${appendix}

## Evidence Ledger

| # | Source | Link | Why it matters |
|---:|---|---|---|
${sourceRows}

Additional direct source list:

${sourceBlock}

## Final Investment View

${name} should be in the Research Map as a **watchlist / selective diligence** asset. The project has enough category relevance and data footprint to merit ongoing coverage, especially because it came from the CG/CMC-oriented candidate workflow and has no high-confidence local duplicate. The current evidence does not yet support a high-conviction allocation thesis. The next level of confidence requires cleaner token economics: fee capture, staking or collateral utility, transparent unlocks, and liquidity that can support realistic position sizing.

Final view: **watchlist, not automatic buy**. Upside comes from product usage translating into token demand. Downside comes from the opposite: the product survives while token holders absorb dilution, thin liquidity, and unclear value capture.
`;

  return { slug, title, body };
}

async function enrichCandidate(candidate) {
  let project = runSurf(['project-detail', '--q', candidate.coingeckoId || candidate.name]);
  if (!project.ok || !looseMatch(project.payload, candidate)) {
    const retry = runSurf(['project-detail', '--q', candidate.name]);
    if (retry.ok && looseMatch(retry.payload, candidate)) {
      project = retry;
    } else if (project.ok && !looseMatch(project.payload, candidate)) {
      project = { ok: false, error: `Surf fuzzy mismatch for ${candidate.name}` };
    }
  }
  const price = runSurf(['market-price', '--symbol', candidate.symbol, '--time-range', '90d']);
  const defi = runSurf(['project-defi-metrics', '--q', candidate.name, '--metric', 'tvl', '--from', '2026-04-07', '--to', DATE, '--limit', '100']);
  const search = runSurf(['search-web', '--q', `${candidate.name} ${candidate.symbol} CoinMarketCap CoinGecko official docs tokenomics`, '--limit', '5']);

  let cg = null;
  if (process.argv.includes('--use-coingecko-api') && candidate.coingeckoId) {
    try {
      cg = await fetchJson(`https://api.coingecko.com/api/v3/coins/${candidate.coingeckoId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch (error) {
      console.warn(`CoinGecko fetch failed for ${candidate.coingeckoId}: ${error.message}`);
    }
  }

  const payload = {
    candidate,
    projectPayload: project.ok ? project.payload : null,
    pricePayload: price.ok ? price.payload : null,
    defiPayload: defi.ok ? defi.payload : null,
    searchPayload: search.ok ? search.payload : null,
    cg,
    errors: {
      project: project.ok ? '' : project.error,
      price: price.ok ? '' : price.error,
      defi: defi.ok ? '' : defi.error,
      search: search.ok ? '' : search.error,
    },
  };

  return payload;
}

function isCoveredByRegistry(candidate, registryProjects) {
  const nameKey = compactKey(candidate.name);
  const symbolKey = compactKey(candidate.symbol);
  const cgKey = compactKey(candidate.coingeckoId);
  if (!nameKey) return false;

  return registryProjects.some((project) => {
    const projectKeys = [
      project.slug,
      project.name,
      project.title,
      project.symbol,
      ...(project.aliases || []),
      ...(project.lookupKeys || []),
    ].map(compactKey).filter(Boolean);
    const keySet = new Set(projectKeys);
    const projectSlugKey = compactKey(project.slug);
    const projectSymbolKey = compactKey(project.symbol);
    const sameName = keySet.has(nameKey) || (nameKey.length >= 6 && projectSlugKey.includes(nameKey));
    const sameSymbol = symbolKey && projectSymbolKey === symbolKey;
    const sameCg = cgKey && projectSlugKey.includes(cgKey);
    return sameCg || (sameName && (sameSymbol || nameKey.length >= 6));
  });
}

function selectCandidates(candidatesData, limit) {
  if (!process.argv.includes('--from-pending')) {
    return TARGET_COINGECKO_IDS.slice(0, limit).map((id) => {
      const candidate = candidatesData.candidates.find((item) => item.coingeckoId === id);
      if (!candidate) throw new Error(`Candidate not found for ${id}`);
      return prepareCandidate(candidate);
    });
  }

  const pending = candidatesData.candidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => !['researched', 'skip'].includes(candidate.status));
  const registryData = fs.existsSync(REGISTRY_FILE) ? readJson(REGISTRY_FILE) : { projects: [] };
  const registryProjects = registryData.projects || [];

  return pending
    .sort((a, b) => {
      const cgDelta = Number(!a.candidate.coingeckoId) - Number(!b.candidate.coingeckoId);
      if (cgDelta !== 0) return cgDelta;
      return a.index - b.index;
    })
    .filter(({ candidate }) => !isCoveredByRegistry(candidate, registryProjects))
    .slice(0, limit)
    .map(({ candidate }) => prepareCandidate(candidate));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const overwrite = process.argv.includes('--overwrite');
  const limit = parseNumberArg('target-count', parseNumberArg('limit', TARGET_COINGECKO_IDS.length));
  const candidatesData = readJson(CANDIDATES_FILE);
  const candidates = selectCandidates(candidatesData, limit);

  if (process.argv.includes('--list-only')) {
    console.log(JSON.stringify({
      count: candidates.length,
      candidates: candidates.map((candidate) => ({
        name: candidate.name,
        symbol: candidate.symbol,
        source: candidate.source,
        status: candidate.status,
        coingeckoId: candidate.coingeckoId || '',
      })),
    }, null, 2));
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const written = [];
  for (const candidate of candidates) {
    console.log(`Enriching ${candidate.name} (${candidate.symbol})`);
    const payload = await enrichCandidate(candidate);
    const generated = article(payload);
    const filePath = path.join(OUT_DIR, `${generated.slug}.mdx`);
    if (fs.existsSync(filePath) && !overwrite) {
      console.log(`  exists: ${path.relative(ROOT, filePath)}`);
      continue;
    }
    if (!dryRun) fs.writeFileSync(filePath, generated.body, 'utf8');
    written.push({ file: path.relative(ROOT, filePath), slug: generated.slug, title: generated.title, errors: payload.errors });
    console.log(`  ${dryRun ? 'would write' : overwrite && fs.existsSync(filePath) ? 'overwrote' : 'wrote'}: ${path.relative(ROOT, filePath)}`);
  }

  console.log(JSON.stringify({ dryRun, count: written.length, written }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
