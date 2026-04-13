export interface CoinConfig {
  id?: string; // CoinGecko ID
  symbol: string;
  name: string;
  category: 'veteran' | 'single-cycle';
  // Manual overrides for cycle peaks (ALT/BTC ratio)
  // If null, will attempt to compute from historical data
  lastCyclePeak?: number | null;
  researchSlug?: string;
  researchType?: string;
}

export const OSCILLATOR_COINS: CoinConfig[] = [
  // Veteran Altcoins (have prior cycle data)
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'veteran', lastCyclePeak: 0.0878, researchSlug: 'eth_outlook_2026', researchType: 'L1' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'veteran', lastCyclePeak: 0.00467 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', category: 'veteran', lastCyclePeak: 0.01356, researchSlug: 'the-exchange-chains-of-bnb-ecosystem-no-binance-no-bsc', researchType: 'L1' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', category: 'veteran', lastCyclePeak: 0.0000534, researchSlug: 'xrp-vs', researchType: 'L1' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'veteran', lastCyclePeak: 0.0000467, researchSlug: 'cardano-ada-governance-centric-l1-architectural-strength-vs', researchType: 'L1' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', category: 'veteran', lastCyclePeak: 0.000992, researchSlug: 'chainlink-vs', researchType: 'Infra' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', category: 'veteran', lastCyclePeak: 0.000878, researchSlug: 'polkadot-dot-shared-security-coordination-layer-in-a-modular-world', researchType: 'L1' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', category: 'veteran', lastCyclePeak: 0.00267, researchSlug: 'avalanche-avax-strategic-appchain-platform-or-adoption-constrained-institutional-stack', researchType: 'L1' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', category: 'veteran', lastCyclePeak: 0.000689, researchSlug: 'uniswap_uni_x', researchType: 'DEX' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', category: 'veteran', lastCyclePeak: 0.01067, researchSlug: 'aave_defi_lend', researchType: 'Lending' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', category: 'veteran', lastCyclePeak: 0.00689, researchSlug: 'litecoin-ltc-enduring-liquidity-bastion-amid-stablecoin-payment-dominance', researchType: 'Payments' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', category: 'veteran', lastCyclePeak: 0.00378, researchSlug: 'filcoin-fil-decentralized-storage-moat-and-token-capture-assessment', researchType: 'Infra' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', category: 'veteran', lastCyclePeak: 0.000356 },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer', category: 'veteran', lastCyclePeak: 0.01178, researchSlug: 'internet-computer-icp-institutional-venture-memo-on-full-stack-on', researchType: 'L1' },

  // Single-Cycle Coins (no prior cycle, Filter 2 only)
  { id: 'sui', symbol: 'SUI', name: 'Sui', category: 'single-cycle', researchSlug: 'sui_report_2026', researchType: 'L1' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', category: 'single-cycle' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', category: 'single-cycle' },
  { id: 'celestia', symbol: 'TIA', name: 'Celestia', category: 'single-cycle' },
  { id: 'jupiter', symbol: 'JUP', name: 'Jupiter', category: 'single-cycle', researchSlug: 'jupiter_ag_defi_solana', researchType: 'DEX' },
  { id: 'starknet', symbol: 'STRK', name: 'Starknet', category: 'single-cycle' },
];

export const OSCILLATOR_RESEARCH_FOCUS: CoinConfig[] = [
  {
    symbol: 'HYPE',
    name: 'Hyperliquid',
    category: 'single-cycle',
    researchSlug: 'hyperliquid_report_2026',
    researchType: 'Perp DEX',
  },
  {
    symbol: 'GT',
    name: 'GateToken',
    category: 'veteran',
    researchSlug: 'gate_io_research',
    researchType: 'CEX',
  },
  {
    symbol: 'MX',
    name: 'MX Token',
    category: 'veteran',
    researchSlug: 'mexc_exchange_report',
    researchType: 'CEX',
  },
  {
    symbol: 'OKB',
    name: 'OKB',
    category: 'veteran',
    researchSlug: 'okb-exchange-utility-token-in-a-post-scarcity-era-capturing',
    researchType: 'CEX',
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    category: 'veteran',
    researchSlug: 'bitcoin-cash-bch-reviving-peer-to-peer',
    researchType: 'PayFi',
  },
  {
    symbol: 'XMR',
    name: 'Monero',
    category: 'veteran',
    researchSlug: 'monero-xmr-privacy-money-s-last-stand-durable-censorship-resistant',
    researchType: 'Privacy',
  },
  {
    symbol: 'TON',
    name: 'Toncoin',
    category: 'veteran',
    researchSlug: 'toncoin-ton-telegram-distribution-moat-and-the-quest-for-consumer',
    researchType: 'L1',
  },
  {
    symbol: 'TRX',
    name: 'TRON',
    category: 'veteran',
    researchSlug: 'tron-stablecoin-settlement-dominator-or-fragile-market-structure-beneficiary',
    researchType: 'L1',
  },
  {
    symbol: 'TAO',
    name: 'Bittensor',
    category: 'single-cycle',
    researchSlug:
      'bittensor-tao-permissionless-ai-coordination-durable-economic-infrastructure-or-narrative',
    researchType: 'AI/DePIN',
  },
  {
    symbol: 'KAS',
    name: 'Kaspa',
    category: 'veteran',
    researchSlug:
      'kaspa-kas-institutional-grade-blockdag-pow-analysis-technical-innovation-vs',
    researchType: 'L1',
  },
  {
    symbol: 'NEXO',
    name: 'Nexo',
    category: 'veteran',
    researchSlug: 'nexo-investment-research-report-in-depth-analysis-of-cefi-wealth',
    researchType: 'CeFi',
  },
  {
    symbol: 'ZEC',
    name: 'Zcash',
    category: 'veteran',
    researchSlug: 'zcash-zec-selectively-private-money-in-a-surveillance-economy-zk',
    researchType: 'Privacy',
  },
  {
    symbol: 'QNT',
    name: 'Quant',
    category: 'veteran',
    researchSlug:
      'quant-qnt-enterprise-interoperability-middleware-architecture-adoption-reality-and-token',
    researchType: 'Infra',
  },
  {
    symbol: 'DASH',
    name: 'Dash',
    category: 'veteran',
    researchSlug: 'dash-legacy-digital-cash-or-resilient-dao',
    researchType: 'Payments',
  },
  {
    symbol: 'DEXE',
    name: 'DeXe',
    category: 'single-cycle',
    researchSlug:
      'dexe-protocol-institutional-analysis-of-dao-infrastructure-governance-and-dexe',
    researchType: 'DAO',
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    category: 'single-cycle',
    researchSlug: 'pepe-meme-benchmark-or-cyclical-beta',
    researchType: 'Meme',
  },
];
