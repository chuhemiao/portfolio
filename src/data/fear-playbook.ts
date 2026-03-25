export interface FearStrategyCard {
  title: string;
  description: string;
  checks: string[];
  interpretation: string[];
}

export const FEAR_CORE_STRATEGIES: FearStrategyCard[] = [
  {
    title: 'Bottom probability model',
    description:
      'The current page is a Bitcoin bottom-observation stack built to collect evidence, not to force a trade.',
    checks: [
      'Composite score aggregates valuation, on-chain activity, sentiment, macro assets, and volatility risk.',
      'Bottom Alert Engine turns green only when at least five of eight bottom conditions are active.',
      'Historical cycle framing references 2015, 2018, 2020, and 2022 for context instead of one-cycle anchoring.'
    ],
    interpretation: [
      'A high score means multiple stress and capitulation signals are aligning, not that a reversal is guaranteed.',
      'A low score means the market is still expensive or crowded, so patience matters more than prediction.'
    ]
  },
  {
    title: 'Layered evidence workflow',
    description:
      'The page treats market observation as a sequence of layers instead of a single magic metric.',
    checks: [
      'Layer 1 asks whether price is historically compressed versus realized value and long-term trend.',
      'Layer 2 checks whether network activity and holder behavior support real demand or distribution.',
      'Layer 3 reads crowding, fear, and derivatives positioning.',
      'Layer 4 and Layer 5 filter for macro spillover and cross-asset stress.'
    ],
    interpretation: [
      'When several layers agree, conviction can rise.',
      'When valuation looks cheap but leverage and macro still deteriorate, the model stays defensive.'
    ]
  },
  {
    title: 'Risk-first operating rule',
    description:
      'The dashboard is explicitly framed as a decision-support system for research, not a trading signal generator.',
    checks: [
      'Use the dashboard to reduce narrative noise and structure weekly or daily reviews.',
      'Treat unknown or missing metrics as uncertainty, not as bullish confirmation.',
      'Cross-check all outputs with your own risk management, sizing rules, and time horizon.'
    ],
    interpretation: [
      'The best use case is regime detection and watchlist prioritization.',
      'The worst use case is turning one dashboard refresh into forced execution.'
    ]
  }
];

export const FEAR_EXPANDED_STRATEGIES: FearStrategyCard[] = [
  {
    title: 'Regime classification',
    description:
      'Label the market as capitulation, repair, trend continuation, or overheating before making any directional conclusion.',
    checks: [
      'Composite score band, fear and greed, price versus realized price, MVRV, VIX, and funding rate.',
      'If fear is extreme and leverage is washed out, focus on repair probability rather than instant upside.',
      'If greed rises while valuation and leverage are both stretched, shift to protection mode.'
    ],
    interpretation: [
      'This strategy keeps the dashboard useful outside of absolute bottoms.',
      'It converts a bottom model into a full market-state model.'
    ]
  },
  {
    title: 'Leverage reset and crowded positioning',
    description:
      'Watch whether derivatives are cleansing risk or rebuilding fragility.',
    checks: [
      'Funding rate trend, open interest direction, long/short ratio, liquidations, and exchange inflow pressure.',
      'Negative funding with falling open interest often signals a reset phase.',
      'Positive funding with rising open interest and euphoric sentiment often signals crowding.'
    ],
    interpretation: [
      'A clean reset can create better risk-reward than a euphoric breakout.',
      'Crowded longs are often more dangerous than a weak headline.'
    ]
  },
  {
    title: 'Liquidity migration',
    description:
      'Track where capital is moving across Bitcoin, stablecoins, exchanges, and risk assets.',
    checks: [
      'Exchange reserve, exchange inflow or outflow, stablecoin supply trend, ETF or treasury accumulation when available.',
      'Falling exchange reserves with stable or improving demand can support constructive structure.',
      'Rising exchange inflows during macro stress can imply sell-side pressure.'
    ],
    interpretation: [
      'This helps separate true accumulation from temporary price reflex.',
      'Liquidity direction matters as much as spot price.'
    ]
  },
  {
    title: 'BTC to ETH to alt rotation watch',
    description:
      'Read breadth and rotation instead of assuming the whole market moves as one asset class.',
    checks: [
      'BTC dominance, ETH/BTC, TOTAL3 breadth, sector leadership, and whether alts outperform on up days or only underperform on down days.',
      'If Bitcoin leads while breadth stays narrow, the market is usually still defensive.',
      'If ETH and quality beta start outperforming with healthier breadth, risk appetite is broadening.'
    ],
    interpretation: [
      'This prevents a Bitcoin-only dashboard from missing broader crypto regime shifts.',
      'Rotation is often the bridge between BTC macro trades and full crypto risk-on.'
    ]
  },
  {
    title: 'Holder conviction and old coin behavior',
    description:
      'Use on-chain behavior to tell apart early accumulation, mature trend, and late distribution.',
    checks: [
      'Dormancy flow, coin days destroyed, LTH-SOPR, old coins moved, and HODL wave changes.',
      'Low dormancy with improving activity often supports accumulation.',
      'Aggressive old-coin movement into strength often signals mature-cycle distribution.'
    ],
    interpretation: [
      'Holder behavior adds context that derivatives data cannot provide.',
      'Old supply moving is usually more informative than loud social sentiment.'
    ]
  },
  {
    title: 'Macro spillover monitor',
    description:
      'Treat crypto as connected to global liquidity and cross-asset volatility, especially during stress.',
    checks: [
      'DXY, Nasdaq, S&P 500, gold, crude oil, VIX, MOVE, and yield-curve signals.',
      'Rising dollar, rising rates volatility, and equity stress usually tighten crypto conditions.',
      'Falling macro stress with stable on-chain demand can create cleaner trend continuation.'
    ],
    interpretation: [
      'This strategy prevents false optimism during macro-led drawdowns.',
      'It also explains why crypto can fail to rally even when internal metrics improve.'
    ]
  },
  {
    title: 'Narrative breadth and event risk',
    description:
      'Pair dashboard metrics with the event calendar so regime changes are not misread as isolated data noise.',
    checks: [
      'CPI, FOMC, ETF flow releases, exchange incidents, unlocks, token launches, and major regulatory headlines.',
      'Separate event shock from structural change by checking whether leverage, liquidity, and breadth confirm the move.',
      'Track whether the same narrative is spreading across majors, sectors, and on-chain activity.'
    ],
    interpretation: [
      'A strong market absorbs bad news with limited leverage damage.',
      'A weak market uses good news to exit, which is usually a warning.'
    ]
  }
];

export const FEAR_OPERATOR_GUIDELINES = [
  'Start with regime first, then check leverage, then confirm liquidity and breadth.',
  'Do not let one bullish metric override worsening macro or crowded positioning.',
  'Treat missing fields as unknown and say so explicitly in research output.',
  'Use the dashboard to write a market brief, not to generate a blind buy or sell command.'
];
