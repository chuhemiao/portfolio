import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appendSurfRankingFallbackRows,
  formatAltBtcRatio,
  isExcludedFromAltUniverse,
  mergeMarketSources,
  paginateCollection,
  pickBinanceBtcMarket,
} from './oscillator-helpers.ts';

test('isExcludedFromAltUniverse filters out bitcoin and stablecoins', () => {
  assert.equal(isExcludedFromAltUniverse('BTC', 'Bitcoin'), true);
  assert.equal(isExcludedFromAltUniverse('WBTC', 'Wrapped Bitcoin'), true);
  assert.equal(isExcludedFromAltUniverse('USDC', 'USD Coin'), true);
  assert.equal(isExcludedFromAltUniverse('SOL', 'Solana'), false);
  assert.equal(isExcludedFromAltUniverse('HYPE', 'Hyperliquid'), false);
});

test('mergeMarketSources merges CoinGecko and CoinMarketCap rows and keeps research flags', () => {
  const merged = mergeMarketSources(
    [
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        market_cap_rank: 6,
        current_price: 180,
        market_cap: 80000000000,
        total_volume: 4000000000,
        price_change_percentage_24h: 4.2,
        price_change_percentage_7d_in_currency: 12.1,
        price_change_percentage_30d_in_currency: 22.5,
      },
      {
        id: 'usd-coin',
        symbol: 'usdc',
        name: 'USD Coin',
        market_cap_rank: 7,
        current_price: 1,
        market_cap: 61000000000,
        total_volume: 6000000000,
        price_change_percentage_24h: 0,
        price_change_percentage_7d_in_currency: 0,
        price_change_percentage_30d_in_currency: 0,
      },
    ],
    [
      {
        id: 1,
        symbol: 'SOL',
        name: 'Solana',
        slug: 'solana',
        cmcRank: 5,
        marketPairCount: 1200,
        quotes: [
          {
            name: 'USD',
            price: 181,
            marketCap: 81000000000,
            volume24h: 4200000000,
            percentChange24h: 4.1,
            percentChange7d: 11.9,
            percentChange30d: 21.8,
          },
        ],
      },
    ],
    new Map([
      [
        'SOL',
        {
          name: 'Solana',
          slug: 'solana-report',
          type: 'L1',
        },
      ],
    ])
  );

  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, 'solana');
  assert.equal(merged[0].symbol, 'SOL');
  assert.equal(merged[0].name, 'Solana');
  assert.equal(merged[0].coingeckoRank, 6);
  assert.equal(merged[0].coinmarketcapRank, 5);
  assert.equal(merged[0].marketRank, 6);
  assert.equal(merged[0].dualTop300, true);
  assert.equal(merged[0].researchFocus, true);
  assert.equal(merged[0].researchSlug, 'solana-report');
  assert.equal(merged[0].researchType, 'L1');
  assert.equal(merged[0].currentPriceUsd, 180);
  assert.equal(merged[0].marketCap, 80000000000);
  assert.equal(merged[0].volume24h, 4000000000);
  assert.equal(merged[0].volumeToMarketCap, 0.05);
});

test('pickBinanceBtcMarket finds active BTC spot pairs', () => {
  const market = pickBinanceBtcMarket('ETH', [
    {
      symbol: 'ETHBTC',
      status: 'TRADING',
      baseAsset: 'ETH',
      quoteAsset: 'BTC',
      isSpotTradingAllowed: true,
      lastPrice: '0.031',
      priceChangePercent: '-2.5',
      quoteVolume: '3200',
    },
    {
      symbol: 'ETHEUR',
      status: 'TRADING',
      baseAsset: 'ETH',
      quoteAsset: 'EUR',
      isSpotTradingAllowed: true,
      lastPrice: '2500',
      priceChangePercent: '1.1',
      quoteVolume: '9000',
    },
  ]);

  assert.equal(market?.symbol, 'ETHBTC');
  assert.equal(market?.price, 0.031);
  assert.equal(market?.priceChangePercent, -2.5);
  assert.equal(market?.quoteVolume, 3200);
});

test('pickBinanceBtcMarket ignores halted or non-BTC pairs', () => {
  assert.equal(
    pickBinanceBtcMarket('TIA', [
      {
        symbol: 'TIAUSDT',
        status: 'TRADING',
        baseAsset: 'TIA',
        quoteAsset: 'USDT',
        isSpotTradingAllowed: true,
        lastPrice: '8',
        priceChangePercent: '1.5',
        quoteVolume: '1200',
      },
      {
        symbol: 'TIABTC',
        status: 'BREAK',
        baseAsset: 'TIA',
        quoteAsset: 'BTC',
        isSpotTradingAllowed: true,
        lastPrice: '0.00011',
        priceChangePercent: '-1.2',
        quoteVolume: '22',
      },
    ]),
    null
  );
});

test('formatAltBtcRatio uses compact subscript notation for tiny ratios', () => {
  assert.equal(formatAltBtcRatio(null), 'N/A');
  assert.equal(formatAltBtcRatio(0.03123456), '0.031235');
  assert.equal(formatAltBtcRatio(0.00000451), '0.0₅4510');
  assert.equal(formatAltBtcRatio(0.00000017), '0.0₆1700');
});

test('paginateCollection slices items and reports the visible range', () => {
  const page = paginateCollection(
    Array.from({ length: 120 }, (_, index) => index + 1),
    3,
    50
  );

  assert.equal(page.currentPage, 3);
  assert.equal(page.totalPages, 3);
  assert.equal(page.start, 101);
  assert.equal(page.end, 120);
  assert.deepEqual(page.items, Array.from({ length: 20 }, (_, index) => index + 101));
});

test('paginateCollection clamps invalid pages back into range', () => {
  const page = paginateCollection(['BTC', 'ETH', 'SOL'], 9, 50);

  assert.equal(page.currentPage, 1);
  assert.equal(page.totalPages, 1);
  assert.equal(page.start, 1);
  assert.equal(page.end, 3);
  assert.deepEqual(page.items, ['BTC', 'ETH', 'SOL']);
});

test('appendSurfRankingFallbackRows backfills missing surf-ranked alts without re-adding BTC', () => {
  const merged = mergeMarketSources(
    [
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        market_cap_rank: 6,
        current_price: 180,
        market_cap: 80000000000,
        total_volume: 4000000000,
        price_change_percentage_24h: 4.2,
        price_change_percentage_7d_in_currency: 12.1,
        price_change_percentage_30d_in_currency: 22.5,
      },
    ],
    [],
    new Map()
  );

  const completed = appendSurfRankingFallbackRows(
    merged,
    [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        rank: 1,
        price_usd: 70000,
        market_cap_usd: 1400000000000,
        volume_24h_usd: 20000000000,
        change_24h_pct: -1.3,
      },
      {
        symbol: 'HYPE',
        name: 'Hyperliquid',
        rank: 28,
        price_usd: 19.5,
        market_cap_usd: 6500000000,
        volume_24h_usd: 480000000,
        change_24h_pct: 3.8,
      },
    ],
    new Map([
      [
        'HYPE',
        {
          name: 'Hyperliquid',
          slug: 'hyperliquid',
          type: 'Exchange',
        },
      ],
    ])
  );

  assert.equal(completed.some((row) => row.symbol === 'BTC'), false);
  assert.equal(completed.length, 2);

  const hype = completed.find((row) => row.symbol === 'HYPE');
  assert.equal(hype?.coingeckoRank, null);
  assert.equal(hype?.coinmarketcapRank, null);
  assert.equal(hype?.marketRank, 28);
  assert.equal(hype?.researchFocus, true);
  assert.equal(hype?.researchSlug, 'hyperliquid');
  assert.equal(hype?.change24h, 3.8);
});
