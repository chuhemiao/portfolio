'use client';

import { useState } from 'react';
import Link from 'next/link';

type ResearchProject = {
  name: string;
  description: string;
  type: string;
  slug: string;
  color: string;
  initial: string;
  logoUrl?: string;
};

// CoinGecko: https://coin-images.coingecko.com/coins/images/{id}/large/{filename}
// CMC:       https://s2.coinmarketcap.com/static/img/coins/64x64/{id}.png
const CG = 'https://coin-images.coingecko.com/coins/images';
const CMC = 'https://s2.coinmarketcap.com/static/img/coins/64x64';

const PROJECTS: ResearchProject[] = [
  // CEX
  {
    name: 'Binance',
    description: "World's largest exchange, 300M+ users, $168B daily volume",
    type: 'CEX',
    slug: 'binance_2025_report',
    color: '#F0B90B',
    initial: 'BN',
    logoUrl: `${CG}/825/large/bnb-icon2_2x.png`,
  },
  {
    name: 'Coinbase',
    description: 'US-regulated exchange evolving into diversified financial platform',
    type: 'CEX',
    slug: 'coinbase_report_2026',
    color: '#0052FF',
    initial: 'CB',
  },
  {
    name: 'Bybit',
    description: 'Derivatives-focused exchange with $22.9B daily trading volume',
    type: 'CEX',
    slug: 'a-deep-research-report-about-bybit-exchange',
    color: '#F7A600',
    initial: 'BB',
  },
  {
    name: 'Bitget',
    description: 'Derivatives giant with copy trading and 45M+ users',
    type: 'CEX',
    slug: 'bitget-deep-research-report-comprehensive-investment-analysis-of-a-derivatives',
    color: '#1DA2B4',
    initial: 'BG',
    logoUrl: `${CG}/11610/large/Bitget_logo.png`,
  },
  {
    name: 'Gate.io',
    description: 'High operational leverage trading infrastructure',
    type: 'CEX',
    slug: 'gate_io_research',
    color: '#E3B23C',
    initial: 'GT',
    logoUrl: `${CG}/8183/large/200X200.png`,
  },
  {
    name: 'MEXC',
    description: 'Zero-fee strategy exchange targeting retail and altcoin traders',
    type: 'CEX',
    slug: 'mexc_exchange_report',
    color: '#00B4D8',
    initial: 'MX',
    logoUrl: `${CG}/8545/large/mexc.jpg`,
  },
  {
    name: 'HashKey',
    description: 'Compliance-first blueprint for regulated digital asset markets',
    type: 'CEX',
    slug: 'hashKey_exchange',
    color: '#1B1B1B',
    initial: 'HK',
  },
  {
    name: 'XT.COM',
    description: 'Capital aggregation crypto exchange infrastructure',
    type: 'CEX',
    slug: 'xt_exchange',
    color: '#4B5563',
    initial: 'XT',
  },
  {
    name: 'OSL Group',
    description: 'Regulated digital financial infrastructure in Asia',
    type: 'CEX',
    slug: 'osl_group',
    color: '#1E40AF',
    initial: 'OSL',
  },
  {
    name: 'MSX Exchange',
    description: 'RWA tokenization pioneer bridging crypto and TradFi',
    type: 'CEX',
    slug: 'msx-exchange-deep-research-the-rwa-tokenization-pioneer-bridging-crypto',
    color: '#065F46',
    initial: 'MSX',
  },
  // Perp DEX
  {
    name: 'Hyperliquid',
    description: '60-70% on-chain perp volume, $4.1B TVL, sub-second finality',
    type: 'Perp DEX',
    slug: 'hyperliquid_report_2026',
    color: '#00E5FF',
    initial: 'HL',
    logoUrl: `${CG}/36494/large/HYPE.png`,
  },
  {
    name: 'AsterDEX',
    description: 'Multi-chain perp exchange with 1001× leverage and yield collateral',
    type: 'Perp DEX',
    slug: 'asterdex_report_2025',
    color: '#7C3AED',
    initial: 'AD',
  },
  {
    name: 'Reya Network',
    description: 'Ethereum-based trading-specific ZK rollup architecture',
    type: 'Perp DEX',
    slug: 'reya_xyz_perpdex',
    color: '#3B82F6',
    initial: 'RY',
  },
  {
    name: 'StandX',
    description: 'Yield-bearing perpetuals DEX with innovative collateral model',
    type: 'Perp DEX',
    slug: 'standx_perp_dex',
    color: '#10B981',
    initial: 'SX',
  },
  {
    name: 'Pacifica Finance',
    description: "Solana's hybrid perpetual exchange for real-time DeFi",
    type: 'Perp DEX',
    slug: 'pacifica-finance-institutional-grade-analysis-of-solana-s-hybrid-perpetual',
    color: '#F59E0B',
    initial: 'PF',
  },
  {
    name: 'Perpl.xyz',
    description: 'Order book perpetual contract protocol on Monad ecosystem',
    type: 'Perp DEX',
    slug: 'perpl_xyz_prediction',
    color: '#8B5CF6',
    initial: 'PP',
  },
  {
    name: 'Flyingtulip',
    description: 'Unified collateral architecture DeFi DEX with 20.5% capital efficiency',
    type: 'Perp DEX',
    slug: 'flyingtuip_defi_dex',
    color: '#EC4899',
    initial: 'FT',
  },
  // DEX / Lending
  {
    name: 'Uniswap',
    description: 'Multi-chain liquidity infrastructure and pioneering AMM protocol',
    type: 'DEX',
    slug: 'uniswap_uni_x',
    color: '#FF007A',
    initial: 'UNI',
    logoUrl: `${CG}/12504/large/uni.jpg`,
  },
  {
    name: 'Jupiter',
    description: "Solana's largest DEX aggregator and execution layer",
    type: 'DEX',
    slug: 'jupiter_ag_defi_solana',
    color: '#C7F284',
    initial: 'JUP',
    logoUrl: `${CG}/34188/large/jup.png`,
  },
  {
    name: 'Aave',
    description: 'Leading decentralized lending with $44-51B TVL across 18+ chains',
    type: 'Lending',
    slug: 'aave_defi_lend',
    color: '#B6509E',
    initial: 'AAVE',
    logoUrl: `${CG}/12645/large/AAVE.png`,
  },
  {
    name: 'Maple Finance',
    description: 'Institutional credit marketplace with $5B AUM and zero bad debt',
    type: 'Lending',
    slug: 'maple_finance_syrup',
    color: '#0A3D62',
    initial: 'MPL',
    logoUrl: `${CG}/14097/large/maple.png`,
  },
  {
    name: 'Morpho',
    description: 'Modular lending protocol optimizing capital efficiency on Ethereum',
    type: 'Lending',
    slug: 'morpho-deep-research-market-opportunities-and-risk-analysis-of-modular',
    color: '#4B89DC',
    initial: 'MRP',
    logoUrl: `${CG}/29837/large/morpho.png`,
  },
  {
    name: 'Superform',
    description: 'Omnichain yield infrastructure for cross-chain DeFi',
    type: 'Yield',
    slug: 'superform_SP_omnichain',
    color: '#6366F1',
    initial: 'SP',
  },
  {
    name: 'Symphony',
    description: 'AI-native cross-chain intent execution infrastructure',
    type: 'DeFi',
    slug: 'symphony_defi',
    color: '#0EA5E9',
    initial: 'SYM',
  },
  // L1 / L2
  {
    name: 'Bitcoin',
    description: 'Global neutral monetary network and digital reserve asset',
    type: 'L1',
    slug: 'bitcoin_2026_report',
    color: '#F7931A',
    initial: 'BTC',
    logoUrl: `${CG}/1/large/bitcoin.png`,
  },
  {
    name: 'Ethereum',
    description: 'Dominant programmable settlement layer with $69B DeFi TVL',
    type: 'L1',
    slug: 'eth_outlook_2026',
    color: '#627EEA',
    initial: 'ETH',
    logoUrl: `${CG}/279/large/ethereum.png`,
  },
  {
    name: 'Sui',
    description: 'High-performance L1 with object-centric model and 297K TPS',
    type: 'L1',
    slug: 'sui_report_2026',
    color: '#6FBCF0',
    initial: 'SUI',
    logoUrl: `${CG}/26375/large/sui_asset.jpeg`,
  },
  {
    name: 'MegaETH',
    description: 'Real-time EVM execution L2 targeting 100K+ TPS',
    type: 'L2',
    slug: 'megaeth_layer2_zk',
    color: '#7B2FBE',
    initial: 'METH',
  },
  {
    name: 'Fogo',
    description: 'High-performance SVM layer-1 for real-time DeFi',
    type: 'L1',
    slug: 'fogo_svm_solana_2026',
    color: '#FF6B35',
    initial: 'FOGO',
  },
  {
    name: 'Espresso',
    description: 'Shared sequencing layer enabling atomic cross-rollup composability',
    type: 'L2 Infra',
    slug: 'espresso_baseeth_l2',
    color: '#4F46E5',
    initial: 'ESP',
  },
  {
    name: 'Canton Network',
    description: 'Privacy-enabled L1 for institutional finance, $6T+ on-chain RWA',
    type: 'L1',
    slug: 'canton_network_report',
    color: '#00B4A2',
    initial: 'CN',
  },
  {
    name: 'Midnight',
    description: 'Compliance-preserving data protection blockchain architecture',
    type: 'L1',
    slug: 'midnight_2026_report',
    color: '#1B1B1B',
    initial: 'MID',
  },
  {
    name: 'Plasma',
    description: 'Stablecoin-native L1 bridging payment and DeFi infrastructure',
    type: 'L1',
    slug: 'plasma_xpl_payfi',
    color: '#2563EB',
    initial: 'XPL',
  },
  // ZK / Privacy
  {
    name: 'Aztec Network',
    description: 'Privacy-first zk-rollup with programmable confidentiality',
    type: 'ZK',
    slug: 'aztec_network_zk',
    color: '#1B1B1B',
    initial: 'AZT',
  },
  {
    name: 'Succinct Labs',
    description: 'Decentralized ZK proof infrastructure and verifiable computation',
    type: 'ZK',
    slug: 'succinct_labs_zk_proof',
    color: '#0EA5E9',
    initial: 'SP1',
  },
  {
    name: 'Brevis',
    description: 'ZK coprocessor and modular zkVM for on-chain data verification',
    type: 'ZK',
    slug: 'brev_brevis_2026_zk',
    color: '#0891B2',
    initial: 'BRV',
  },
  {
    name: 'Zama',
    description: 'FHE stack enabling full confidentiality for blockchain applications',
    type: 'FHE',
    slug: 'zama_fhe_zk_2026',
    color: '#6D28D9',
    initial: 'ZAMA',
  },
  {
    name: 'Octra',
    description: 'Hypergraph-based FHE architecture for confidential computing',
    type: 'FHE',
    slug: 'octra_fhe_zk',
    color: '#7C3AED',
    initial: 'OCT',
  },
  {
    name: 'Cysic',
    description: 'Hardware-accelerated verifiable compute for ZK proofs',
    type: 'ZK',
    slug: 'cysic_network_cys',
    color: '#059669',
    initial: 'CYS',
  },
  {
    name: 'zkPass',
    description: 'zkTLS as trust-minimized bridge between Web2 data and on-chain proofs',
    type: 'ZK',
    slug: 'zkpass_zkp_2026',
    color: '#4F46E5',
    initial: 'ZKP',
  },
  {
    name: 'Railgun',
    description: 'Privacy infrastructure for composable DeFi transactions',
    type: 'Privacy',
    slug: 'railgun_zk_privacy',
    color: '#111827',
    initial: 'RAIL',
    logoUrl: `${CG}/16840/large/railgun.png`,
  },
  {
    name: 'Inference Labs',
    description: 'Verifiable AI inference via zkML and on-chain proof systems',
    type: 'ZK',
    slug: 'inferencelabs_zkml_proof_2026',
    color: '#1E3A5F',
    initial: 'INF',
  },
  // Prediction
  {
    name: 'Polymarket',
    description: 'Largest crypto prediction market with $21.5B volume in 2025',
    type: 'Prediction',
    slug: 'polymarket_kalshi_prediction_2026',
    color: '#00D4FF',
    initial: 'PLY',
  },
  {
    name: 'Opinion Labs',
    description: 'Macro prediction exchange for institutional-grade market signals',
    type: 'Prediction',
    slug: 'opinion_labs_pred',
    color: '#F97316',
    initial: 'OPN',
  },
  {
    name: 'Rain Protocol',
    description: 'AMM-based prediction market infrastructure with on-chain resolution',
    type: 'Prediction',
    slug: 'rain_protocol_prediction',
    color: '#0284C7',
    initial: 'RAIN',
  },
  {
    name: 'Kairos',
    description: 'Prediction market execution terminal and infrastructure economics',
    type: 'Prediction',
    slug: 'kairos_trade_prediction_terminal',
    color: '#9333EA',
    initial: 'KRS',
  },
  {
    name: 'Predict.fun',
    description: 'On-chain prediction market with Binance ecosystem integration',
    type: 'Prediction',
    slug: 'predict_fun_binance',
    color: '#2DD4BF',
    initial: 'PRD',
  },
  {
    name: 'Probable',
    description: 'Orderbook oracle prediction market on BNB Chain with $2.1B cumulative volume',
    type: 'Prediction',
    slug: 'probable_predict',
    color: '#F59E0B',
    initial: 'PRB',
  },
  // Stablecoin / PayFi
  {
    name: 'Circle',
    description: 'Global stablecoin issuer and cross-chain settlement infrastructure',
    type: 'Stablecoin',
    slug: 'circle_stablecoin_arc',
    color: '#2775CA',
    initial: 'USDC',
    logoUrl: `${CG}/6319/large/usdc.png`,
  },
  {
    name: 'RedotPay',
    description: 'Regulated PayFi with $10B annualized payment volume and 6M+ users',
    type: 'PayFi',
    slug: 'redotpay_report_2026',
    color: '#EF4444',
    initial: 'RDP',
  },
  {
    name: 'USDG',
    description: 'Globally compliant digital dollar backed by institutional reserves',
    type: 'Stablecoin',
    slug: 'usdg-global-dollar-institutional-grade-analysis-and-investment-outlook-for',
    color: '#16A34A',
    initial: 'USDG',
  },
  {
    name: 'USD.AI',
    description: 'Hybrid RWA-backed stablecoin targeting GPU credit markets',
    type: 'Stablecoin',
    slug: 'usd_ai_rwa',
    color: '#854D0E',
    initial: 'USD',
  },
  {
    name: 'Tria',
    description: 'Chain-abstraction neobank and BestPath AVS for seamless payments',
    type: 'PayFi',
    slug: 'tria_card_pay',
    color: '#7C3AED',
    initial: 'TRIA',
  },
  {
    name: 'River',
    description: 'Chain-abstraction stablecoin connecting assets to optimal yield across ecosystems',
    type: 'Stablecoin',
    slug: 'river_satoshi_protocol',
    color: '#0EA5E9',
    initial: 'RVR',
  },
  {
    name: 'KGST',
    description: 'Investment-grade stablecoin protocol with institutional backing',
    type: 'Stablecoin',
    slug: 'kgst_stablecoin',
    color: '#15803D',
    initial: 'KGST',
  },
  // AI / DePIN
  {
    name: 'Gensyn',
    description: 'Decentralized ML compute protocol with 80% cost advantage over AWS',
    type: 'AI/DePIN',
    slug: 'gensyn_pretge_report',
    color: '#10B981',
    initial: 'GSN',
  },
  {
    name: 'Sentient Protocol',
    description: 'Open AGI development platform with decentralized model ownership',
    type: 'AI/DePIN',
    slug: 'sentient_protocol_outlook_2026',
    color: '#7C3AED',
    initial: 'SNT',
  },
  {
    name: 'DeAgentAI',
    description: 'AI agent infrastructure layer with on-chain autonomous execution',
    type: 'AI/DePIN',
    slug: 'deagent_ai_aia',
    color: '#1D4ED8',
    initial: 'AIA',
  },
  {
    name: 'Warden Protocol',
    description: 'Verifiable AI infrastructure layer for on-chain intelligence',
    type: 'AI/DePIN',
    slug: 'warden_protocol',
    color: '#EA580C',
    initial: 'WRD',
  },
  {
    name: 'Fabric Protocol',
    description: 'AI robotics infrastructure for physical-digital automation',
    type: 'AI/DePIN',
    slug: 'fabric-protocol-in-depth-research-report-ai-robotics',
    color: '#0F766E',
    initial: 'FAB',
  },
  // RWA
  {
    name: 'Centrifuge',
    description: 'Leading RWA tokenization infrastructure with $8B+ on-chain assets',
    type: 'RWA',
    slug: 'centrifuge-cfg-rwa-tokenization-infrastructure-investment-research-report',
    color: '#2762FF',
    initial: 'CFG',
    logoUrl: `${CG}/17106/large/cfg.png`,
  },
  {
    name: 'Integra',
    description: 'Purpose-built L1 for real estate tokenization and regulated RWAs',
    type: 'RWA',
    slug: 'integra_layer1_rwa',
    color: '#92400E',
    initial: 'INT',
  },
  {
    name: 'BlockStreet',
    description: 'VC-grade infrastructure for tokenized capital markets',
    type: 'RWA',
    slug: 'blockstreet-vc-grade-infrastructure-analysis-for-tokenized-capital-markets',
    color: '#1F2937',
    initial: 'BST',
  },
  {
    name: 'Sky Token',
    description: 'MakerDAO rebranded protocol with emission cut and buyback program',
    type: 'DeFi',
    slug: 'sky-token-impact-emission-cut-and-buyback-program-analysis',
    color: '#0369A1',
    initial: 'SKY',
  },
  // Other
  {
    name: 'Rainbow Wallet',
    description: 'Design-led non-custodial Ethereum wallet with RainbowKit SDK',
    type: 'Wallet',
    slug: 'rainbow_report_public_sale',
    color: '#8B5CF6',
    initial: 'RBW',
    logoUrl: `${CMC}/12180.png`,
  },
  {
    name: 'Unitas Protocol',
    description: 'Solana-native yield-bearing stablecoin protocol',
    type: 'Stablecoin',
    slug: 'unitas-labs-unitas-protocol-investment-research-report',
    color: '#0891B2',
    initial: 'UNT',
  },
  {
    name: 'Cascade Neo',
    description: 'Cross-asset margin unification brokerage architecture',
    type: 'DeFi',
    slug: 'cascade_neo_prediction',
    color: '#374151',
    initial: 'CSC',
  },
  {
    name: 'TradeGenius',
    description: 'Privacy-first on-chain trading OS with $160M testnet volume, backed by YZi Labs',
    type: 'DeFi',
    slug: 'tradegenius_genius_terminal_binance',
    color: '#10B981',
    initial: 'TG',
  },
  {
    name: 'MetaDAO',
    description: 'Futarchy-based governance with $8M+ raised via market-driven mechanism',
    type: 'DeFi',
    slug: 'metadao_publicsale',
    color: '#7C3AED',
    initial: 'META',
  },
  {
    name: 'RaveDAO',
    description: 'Digital-physical bridge for electronic music culture and experience NFTs',
    type: 'DeFi',
    slug: 'ravedao_research',
    color: '#EC4899',
    initial: 'RAVE',
  },
  {
    name: 'Sentio',
    description: 'Web3 data infrastructure for on-chain analytics, monitoring and indexing',
    type: 'Infra',
    slug: 'web3-data-infrastructure-new-paradigm-sentio',
    color: '#0369A1',
    initial: 'SEN',
  },
  {
    name: 'Definitive',
    description: 'Non-custodial multi-chain TWAP trading terminal with $43M+ revenue',
    type: 'DeFi',
    slug: 'definitive-43m-revenue-multi-chain-twap-trading-infrastructure',
    color: '#0F766E',
    initial: 'DEF',
  },
  {
    name: '币安产品全面分析，产品、技术、用户体验，CZ是如何一步步成功的',
    description: 'Binance product analyzer and deep research with ai report 2026',
    type: 'AI/DePIN',
    slug: 'binance-product-analyzer-and-deep-research-with-ai-report-2026',
    color: '#0EA5E9',
    initial: 'CZ',
  },
  {
    name: 'Bitcoin Crypto Derivatives Intelligence System',
    description: 'Geopolitical escalation (US-Iran conflict) drives oil >$100/bbl (WTI +6.6%), ...',
    type: 'DeFi',
    slug: 'bitcoin-crypto-derivatives-intelligence-system-report',
    color: '#6366F1',
    initial: 'BC',
  },
  {
    name: '2030 Bitcoin (BTC) $300000',
    description: 'Bitcoin demonstrates its unique position as a digital store-of-value asset, t...',
    type: 'DeFi',
    slug: 'bitcoin_2030',
    color: '#2563EB',
    initial: '2B',
  },
  {
    name: 'Crypto Derivatives Intelligence System',
    description: 'Crypto Derivatives Intelligence System Report 2026-03-14',
    type: 'DeFi',
    slug: 'crypto-derivatives-intelligence-system-report-2026-03-14',
    color: '#4F46E5',
    initial: 'CD',
  },
  {
    name: 'Ethereum (ETH)',
    description: 'Ethereum remains the dominant smart-contract platform and settlement layer, b...',
    type: 'Yield',
    slug: 'ethereum-eth-the-yield-gap-post-fusaka-ethb-etf-as',
    color: '#DC2626',
    initial: 'EE',
  },
  {
    name: 'Katana Network',
    description: 'Katana rethinks L2s as "execution layers" for DeFi, owning revenue streams (s...',
    type: 'Yield',
    slug: 'katana-network-in-depth-analysis-architectural-breakthroughs-and-ecosystem-potential',
    color: '#DC2626',
    initial: 'KN',
  },
  {
    name: 'PayPay（日本）机构级投研报告（截至 2026',
    description: 'PayPay 已从“扫码支付（代码支付）App”演化为以支付为入口、以信用卡/银行/证券等金融服务为变现与利润扩展器的日本本土消费金融平台。其规模侧（用户...',
    type: 'DeFi',
    slug: 'paypay-report',
    color: '#8B5CF6',
    initial: 'P2',
  },
  {
    name: 'Tempo Research',
    description: 'Tempo is an EVM-compatible Layer 1 blockchain launched on mainnet March 18, 2...',
    type: 'DEX',
    slug: 'tempo-research-report-payments-optimized-l1-blockchain',
    color: '#D97706',
    initial: 'TR',
  },
  {
    name: 'XRP VS Solana,Stellar',
    description: 'As of 2026-03-18 06:24 UTC – Synthesizing real-time market, on-chain, develop...',
    type: 'PayFi',
    slug: 'xrp-vs',
    color: '#0891B2',
    initial: 'XV',
  },
  {
    name: '2026 Crypto Market Structural Outlook',
    description: 'The best time to buy ETH was $10. The second best time is before the 2026 liq...',
    type: 'DeFi',
    slug: '2026_crypto_market_outlook',
    color: '#7C3AED',
    initial: '2C',
  },
  {
    name: '2026 Crypto Market Outlook',
    description: 'The best time to buy ETH was $10. The second best time is before the 2026 liq...',
    type: 'DeFi',
    slug: '2026_crypto_prediction',
    color: '#DC2626',
    initial: '2C',
  },
  {
    name: 'A Comparative',
    description: 'Arc is an open Layer-1 blockchain created by Circle, utilizing the high-perfo...',
    type: 'L1',
    slug: 'arc_tempo_stablecoin',
    color: '#F59E0B',
    initial: 'AC',
  },
  {
    name: '📱 Web3 dApp Era',
    description: 'mobile-first for crypto mass-adoption',
    type: 'DeFi',
    slug: 'mobile_first_dapp',
    color: '#DC2626',
    initial: 'WD',
  },
  {
    name: 'Octra Investment Research',
    description: 'Octra is an upcoming, general-purpose confidential computing network that all...',
    type: 'FHE',
    slug: 'octra_report_2025',
    color: '#4F46E5',
    initial: 'OI',
  },
  {
    name: '2026 Web3 & Crypto Investment Opportunities',
    description: 'Prominent VCs, institutions, and KOLs on X are bullish on 2026 as crypto "ins...',
    type: 'Privacy',
    slug: 'prediction_2026_kol_vc',
    color: '#6366F1',
    initial: '2W',
  },
  {
    name: 'The Rise of Prediction Markets',
    description: 'Google integration of market prediction data into its search engine and finan...',
    type: 'Prediction',
    slug: 'prediction_pmf_2026',
    color: '#0EA5E9',
    initial: 'TR',
  },
  {
    name: 'Crypto tokens that outperformed Bitcoin in early(Q1',
    description: 'just a few altcoin win.',
    type: 'DeFi',
    slug: 'rate_altcoin_btc',
    color: '#F59E0B',
    initial: 'CT',
  },
  {
    name: 'Global Stablecoin Sector',
    description: 'The stablecoin sector represents a $310 billion blockchain-native monetary sy...',
    type: 'Stablecoin',
    slug: 'stable_coin_report_2026',
    color: '#2563EB',
    initial: 'GS',
  },
  {
    name: 'The Rise of the Synthetic Crypto Index',
    description: 'Intelligence is Asset.',
    type: 'DeFi',
    slug: 'synthetic_crypto_index',
    color: '#0284C7',
    initial: 'TR',
  },
  {
    name: 'PreStocks',
    description: 'PreStocks tokenizes economic exposure to pre-IPO private companies like Space...',
    type: 'RWA',
    slug: 'prestocks-bringing-spacex-and-openai-on-chain-a-new-gateway',
    color: '#F59E0B',
    initial: 'PRES',
  },
  {
    name: 'USDT',
    description: 'USDT - The Backbone of Crypto Liquidity',
    type: 'DeFi',
    slug: 'usdt-the-backbone-of-crypto-liquidity',
    color: '#EF4444',
    initial: 'USDT',
  },
  {
    name: 'Bitcoin Performance',
    description: 'Bitcoin has experienced a 5.5% decline over the past week, trading at approxi...',
    type: 'DeFi',
    slug: 'bitcoin-performance-report-recent-consolidation-amid-fear-and-accumulation-signals',
    color: '#4F46E5',
    initial: 'BP',
  },
  {
    name: 'Chainlink vs Pyth',
    description: 'Chainlink emerges as the structurally superior protocol with unmatched ecosys...',
    type: 'Infra',
    slug: 'chainlink-vs',
    color: '#D97706',
    initial: 'CV',
  },
  {
    name: 'GenLayer',
    description: 'GenLayer is primarily a synthetic jurisdiction for subjective on-chain coordi...',
    type: 'AI/DePIN',
    slug: 'genlayer-ai-native-blockchain-or-just-a-synthetic-governance-narrative',
    color: '#D97706',
    initial: 'GENL',
  },
  {
    name: 'Mezo Network',
    description: 'Mezo Network operates as a Bitcoin economic and yield layer (BitcoinFi L2), e...',
    type: 'Lending',
    slug: 'mezo-network-evaluating-btc-utility-security-tradeoffs-and-value-accrual',
    color: '#DC2626',
    initial: 'MN',
  },
  {
    name: 'USDT Dominance',
    description: 'USDT remains the undisputed king of stablecoins, commanding $184B in outstand...',
    type: 'Perp DEX',
    slug: 'usdt-the-backbone-of-crypto-liquidity',
    color: '#EF4444',
    initial: 'UD',
  },
  {
    name: '什么是播客',
    description: '+ 狭义的播客，一般是指独立播客。 即符合上述国外制作流程的播客。用去中心化的方式进行分发，所有内容都可以由你自己掌控。因此你需要有自己的托管服务器、有自...',
    type: 'DeFi',
    slug: 'podcasts',
    color: '#F59E0B',
    initial: 'XX',
  },
  {
    name: 'Dogecoin (DOGE)',
    description: 'Dogecoin (DOGE) has evolved from a 2013 internet joke into crypto is most end...',
    type: 'PayFi',
    slug: 'dogecoin-doge-in-depth-research-report-cultural-blue-chip-meme',
    color: '#0EA5E9',
    initial: 'DD',
  },
  {
    name: 'The Exchange Chains of BNB Ecosystem',
    description: 'BNB occupies a structurally unique position in crypto as the native token of ...',
    type: 'CEX',
    slug: 'the-exchange-chains-of-bnb-ecosystem-no-binance-no-bsc',
    color: '#4F46E5',
    initial: 'TE',
  },
  {
    name: 'TRON',
    description: 'TRON occupies a structurally important niche as the dominant settlement layer...',
    type: 'Stablecoin',
    slug: 'tron-stablecoin-settlement-dominator-or-fragile-market-structure-beneficiary',
    color: '#059669',
    initial: 'TRON',
  },
  {
    name: 'USDC',
    description: 'USDC, issued by Circle, holds a $77.5B market cap as of 2026-04-05, represent...',
    type: 'Stablecoin',
    slug: 'usdc-compliant-infrastructure-in-crypto-is-dollar-layer-positioning-durability',
    color: '#D97706',
    initial: 'USDC',
  },
];

const ALL_TYPES = [
  'All',
  'CEX',
  'Perp DEX',
  'DEX',
  'Lending',
  'Yield',
  'DeFi',
  'L1',
  'L2',
  'L2 Infra',
  'ZK',
  'FHE',
  'Privacy',
  'Prediction',
  'Stablecoin',
  'PayFi',
  'AI/DePIN',
  'RWA',
  'Wallet',
  'Infra',
];

function ProjectLogo({ project }: { project: ResearchProject }) {
  const [error, setError] = useState(false);

  if (!project.logoUrl || error) {
    return (
      <div
        className='w-full aspect-square rounded-lg flex items-center justify-center text-white font-bold text-base'
        style={{ backgroundColor: project.color }}>
        {project.initial}
      </div>
    );
  }

  return (
    <div
      className='w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center p-3'
      style={{ backgroundColor: project.color }}>
      <img
        src={project.logoUrl}
        alt={project.name}
        onError={() => setError(true)}
        className='w-full h-full object-contain'
      />
    </div>
  );
}

export default function ResearchClient() {
  const [activeType, setActiveType] = useState('All');

  const filtered =
    activeType === 'All' ? PROJECTS : PROJECTS.filter((p) => p.type === activeType);

  return (
    <section className='space-y-8 pb-12'>
      <header className='space-y-2'>
        <h1 className='font-bold text-2xl tracking-tighter'>Research Map</h1>
        <p className='text-sm text-muted-foreground'>
          {PROJECTS.length} crypto projects — deep-dive investment research reports
        </p>
      </header>

      <div className='flex flex-wrap gap-2'>
        {ALL_TYPES.filter((t) => {
          if (t === 'All') return true;
          return PROJECTS.some((p) => p.type === t);
        }).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeType === type
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:bg-accent'
            }`}>
            {type}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
        {filtered.map((project) => (
          <Link
            key={project.slug}
            href={`/blog/${project.slug}`}
            className='group flex flex-col gap-3 rounded-xl border p-4 hover:bg-accent transition-colors'>
            <ProjectLogo project={project} />
            <div className='space-y-1'>
              <div className='flex items-start justify-between gap-1'>
                <span className='font-semibold text-sm leading-tight'>{project.name}</span>
                <span className='shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>
                  {project.type}
                </span>
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                {project.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className='text-sm text-muted-foreground'>No projects in this category yet.</p>
      )}
    </section>
  );
}
