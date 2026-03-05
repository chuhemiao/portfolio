export interface FearManualSnapshot {
  asOf: string;
  layer1?: Partial<{
    btcPrice: number;
    marketCap: number;
    realizedCap: number;
    realizedPrice: number;
    mvrv: number;
    mvrvZ: number;
    ma200Week: number;
  }>;
  layer2?: Partial<{
    activeAddresses: number;
    newAddresses: number;
    txCount: number;
    mempoolStats: number;
    nvt: number;
    exchangeReserve: number;
    minerFlow: number;
    exchangeInflow: number;
    exchangeOutflow: number;
    activeAddressesRising: boolean;
    dormancyFlow: number;
    coinDaysDestroyed: number;
    lthSopr: number;
  }>;
  layer3?: Partial<{
    fearGreed: number;
    fearGreedClass: string;
    fundingRate: number;
    openInterest: number;
    longShortRatio: number;
    liquidations: number;
  }>;
  layer4?: Partial<{
    sp500: number;
    nasdaq: number;
    gold: number;
    crudeOil: number;
    dxy: number;
    corrBtcSp500: number;
    corrBtcGold: number;
    corrBtcDxy: number;
  }>;
  layer5?: Partial<{
    vix: number;
    move: number;
    yieldCurveSpread: number;
    sp500Drawdown: number;
    putCallRatio: number;
  }>;
  model?: Partial<{
    compositeScore: number;
    nupl: number;
  }>;
}

// Update this snapshot weekly/monthly from your deep research report.
// Rule: only write values you trust; missing fields remain API-driven.
export const FEAR_MANUAL_SNAPSHOT: FearManualSnapshot = {
  asOf: '2026-03-05T12:49:00Z',
  layer1: {
    btcPrice: 72981.5,
    marketCap: 1460000000000,
    realizedPrice: 54553,
    mvrv: 1.332
  },
  layer2: {
    activeAddresses: 490000,
    nvt: 20.9,
    exchangeReserve: 2708000,
    lthSopr: 1.0023
  },
  layer3: {
    fearGreed: 21,
    fearGreedClass: 'Extreme Fear',
    fundingRate: 0.001841,
    openInterest: 99200000000,
    liquidations: 221000000
  },
  layer4: {
    gold: 5140,
    crudeOil: 75.1,
    dxy: 99.17
  },
  layer5: {
    vix: 25.16
  },
  model: {
    compositeScore: 42,
    nupl: 0.2494
  }
};
