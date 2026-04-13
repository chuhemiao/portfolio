import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isExcludedFromAltUniverse,
  mergeMarketSources,
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
