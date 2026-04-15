'use client';

import Link from 'next/link';
import { useState } from 'react';

type ResearchProject = {
  name: string;
  description: string;
  type: string;
  slug: string;
  color: string;
  initial: string;
  logoUrl?: string;
};

// Synced by `pnpm sync:research:logos` into `public/research-logos/`.

const PROJECTS: ResearchProject[] = [
  // CEX
  {
    name: 'Binance',
    description: "World's largest exchange, 300M+ users, $168B daily volume",
    type: 'CEX',
    slug: 'binance_2025_report',
    color: '#F0B90B',
    initial: 'BN',
    logoUrl: "/research-logos/binance_2025_report.png",
  },
  {
    name: 'Coinbase',
    description:
      'US-regulated exchange evolving into diversified financial platform',
    type: 'CEX',
    slug: 'coinbase_report_2026',
    color: '#0052FF',
    initial: 'CB',
    logoUrl: "/research-logos/coinbase_report_2026.png",
  },
  {
    name: 'Bybit',
    description:
      'Derivatives-focused exchange with $22.9B daily trading volume',
    type: 'CEX',
    slug: 'a-deep-research-report-about-bybit-exchange',
    color: '#F7A600',
    initial: 'BB',
    logoUrl: "/research-logos/a-deep-research-report-about-bybit-exchange.png",
  },
  {
    name: 'Bitget',
    description: 'Derivatives giant with copy trading and 45M+ users',
    type: 'CEX',
    slug: 'bitget-deep-research-report-comprehensive-investment-analysis-of-a-derivatives',
    color: '#1DA2B4',
    initial: 'BG',
    logoUrl: "/research-logos/bitget-deep-research-report-comprehensive-investment-analysis-of-a-derivatives.png",
  },
  {
    name: 'Gate.io',
    description: 'High operational leverage trading infrastructure',
    type: 'CEX',
    slug: 'gate_io_research',
    color: '#E3B23C',
    initial: 'GT',
    logoUrl: "/research-logos/gate_io_research.png",
  },
  {
    name: 'MEXC',
    description:
      'Zero-fee strategy exchange targeting retail and altcoin traders',
    type: 'CEX',
    slug: 'mexc_exchange_report',
    color: '#00B4D8',
    initial: 'MX',
    logoUrl: "/research-logos/mexc_exchange_report.png",
  },
  {
    name: 'HashKey',
    description:
      'Compliance-first blueprint for regulated digital asset markets',
    type: 'CEX',
    slug: 'hashKey_exchange',
    color: '#1B1B1B',
    initial: 'HK',
    logoUrl: "/research-logos/hashKey_exchange.png",
  },
  {
    name: 'XT.COM',
    description: 'Capital aggregation crypto exchange infrastructure',
    type: 'CEX',
    slug: 'xt_exchange',
    color: '#4B5563',
    initial: 'XT',
    logoUrl: "/research-logos/xt_exchange.png",
  },
  {
    name: 'OSL Group',
    description: 'Regulated digital financial infrastructure in Asia',
    type: 'CEX',
    slug: 'osl_group',
    color: '#1E40AF',
    initial: 'OSL',
    logoUrl: "/research-logos/osl_group.png",
  },
  {
    name: 'MSX Exchange',
    description: 'RWA tokenization pioneer bridging crypto and TradFi',
    type: 'CEX',
    slug: 'msx-exchange-deep-research-the-rwa-tokenization-pioneer-bridging-crypto',
    color: '#065F46',
    initial: 'MSX',
    logoUrl: "/research-logos/msx-exchange-deep-research-the-rwa-tokenization-pioneer-bridging-crypto.png",
  },
  // Perp DEX
  {
    name: 'Hyperliquid',
    description: '60-70% on-chain perp volume, $4.1B TVL, sub-second finality',
    type: 'Perp DEX',
    slug: 'hyperliquid_report_2026',
    color: '#00E5FF',
    initial: 'HL',
    logoUrl: "/research-logos/hyperliquid_report_2026.png",
  },
  {
    name: 'AsterDEX',
    description:
      'Multi-chain perp exchange with 1001× leverage and yield collateral',
    type: 'Perp DEX',
    slug: 'asterdex_report_2025',
    color: '#7C3AED',
    initial: 'AD',
    logoUrl: "/research-logos/asterdex_report_2025.svg",
  },
  {
    name: 'Reya Network',
    description: 'Ethereum-based trading-specific ZK rollup architecture',
    type: 'Perp DEX',
    slug: 'reya_xyz_perpdex',
    color: '#3B82F6',
    initial: 'RY',
    logoUrl: "/research-logos/reya_xyz_perpdex.png",
  },
  {
    name: 'StandX',
    description:
      'Yield-bearing perpetuals DEX with innovative collateral model',
    type: 'Perp DEX',
    slug: 'standx_perp_dex',
    color: '#10B981',
    initial: 'SX',
    logoUrl: "/research-logos/standx_perp_dex.png",
  },
  {
    name: 'Pacifica Finance',
    description: "Solana's hybrid perpetual exchange for real-time DeFi",
    type: 'Perp DEX',
    slug: 'pacifica-finance-institutional-grade-analysis-of-solana-s-hybrid-perpetual',
    color: '#F59E0B',
    initial: 'PF',
    logoUrl: "/research-logos/pacifica-finance-institutional-grade-analysis-of-solana-s-hybrid-perpetual.png",
  },
  {
    name: 'Perpl.xyz',
    description: 'Order book perpetual contract protocol on Monad ecosystem',
    type: 'Perp DEX',
    slug: 'perpl_xyz_prediction',
    color: '#8B5CF6',
    initial: 'PP',
    logoUrl: "/research-logos/perpl_xyz_prediction.png",
  },
  {
    name: 'Flyingtulip',
    description:
      'Unified collateral architecture DeFi DEX with 20.5% capital efficiency',
    type: 'Perp DEX',
    slug: 'flyingtuip_defi_dex',
    color: '#EC4899',
    initial: 'FT',
    logoUrl: "/research-logos/flyingtuip_defi_dex.png",
  },
  // DEX / Lending
  {
    name: 'Uniswap',
    description:
      'Multi-chain liquidity infrastructure and pioneering AMM protocol',
    type: 'DEX',
    slug: 'uniswap_uni_x',
    color: '#FF007A',
    initial: 'UNI',
    logoUrl: "/research-logos/uniswap_uni_x.png",
  },
  {
    name: 'Jupiter',
    description: "Solana's largest DEX aggregator and execution layer",
    type: 'DEX',
    slug: 'jupiter_ag_defi_solana',
    color: '#C7F284',
    initial: 'JUP',
    logoUrl: "/research-logos/jupiter_ag_defi_solana.png",
  },
  {
    name: 'Aave',
    description:
      'Leading decentralized lending with $44-51B TVL across 18+ chains',
    type: 'Lending',
    slug: 'aave_defi_lend',
    color: '#B6509E',
    initial: 'AAVE',
    logoUrl: "/research-logos/aave_defi_lend.png",
  },
  {
    name: 'Maple Finance',
    description:
      'Institutional credit marketplace with $5B AUM and zero bad debt',
    type: 'Lending',
    slug: 'maple_finance_syrup',
    color: '#0A3D62',
    initial: 'MPL',
    logoUrl: "/research-logos/maple_finance_syrup.png",
  },
  {
    name: 'Morpho',
    description:
      'Modular lending protocol optimizing capital efficiency on Ethereum',
    type: 'Lending',
    slug: 'morpho-deep-research-market-opportunities-and-risk-analysis-of-modular',
    color: '#4B89DC',
    initial: 'MRP',
    logoUrl: "/research-logos/morpho-deep-research-market-opportunities-and-risk-analysis-of-modular.png",
  },
  {
    name: 'Superform',
    description: 'Omnichain yield infrastructure for cross-chain DeFi',
    type: 'Yield',
    slug: 'superform_SP_omnichain',
    color: '#6366F1',
    initial: 'SP',
    logoUrl: "/research-logos/superform_SP_omnichain.png",
  },
  {
    name: 'Symphony',
    description: 'AI-native cross-chain intent execution infrastructure',
    type: 'DeFi',
    slug: 'symphony_defi',
    color: '#0EA5E9',
    initial: 'SYM',
    logoUrl: "/research-logos/symphony_defi.png",
  },
  // L1 / L2
  {
    name: 'Bitcoin',
    description: 'Global neutral monetary network and digital reserve asset',
    type: 'L1',
    slug: 'bitcoin_2026_report',
    color: '#F7931A',
    initial: 'BTC',
    logoUrl: "/research-logos/bitcoin_2026_report.png",
  },
  {
    name: 'Ethereum',
    description: 'Dominant programmable settlement layer with $69B DeFi TVL',
    type: 'L1',
    slug: 'eth_outlook_2026',
    color: '#627EEA',
    initial: 'ETH',
    logoUrl: "/research-logos/eth_outlook_2026.png",
  },
  {
    name: 'Sui',
    description: 'High-performance L1 with object-centric model and 297K TPS',
    type: 'L1',
    slug: 'sui_report_2026',
    color: '#6FBCF0',
    initial: 'SUI',
    logoUrl: "/research-logos/sui_report_2026.png",
  },
  {
    name: 'MegaETH',
    description: 'Real-time EVM execution L2 targeting 100K+ TPS',
    type: 'L2',
    slug: 'megaeth_layer2_zk',
    color: '#7B2FBE',
    initial: 'METH',
    logoUrl: "/research-logos/megaeth_layer2_zk.png",
  },
  {
    name: 'Fogo',
    description: 'High-performance SVM layer-1 for real-time DeFi',
    type: 'L1',
    slug: 'fogo_svm_solana_2026',
    color: '#FF6B35',
    initial: 'FOGO',
    logoUrl: "/research-logos/fogo_svm_solana_2026.png",
  },
  {
    name: 'Espresso',
    description:
      'Shared sequencing layer enabling atomic cross-rollup composability',
    type: 'L2 Infra',
    slug: 'espresso_baseeth_l2',
    color: '#4F46E5',
    initial: 'ESP',
    logoUrl: "/research-logos/espresso_baseeth_l2.png",
  },
  {
    name: 'Canton Network',
    description:
      'Privacy-enabled L1 for institutional finance, $6T+ on-chain RWA',
    type: 'L1',
    slug: 'canton_network_report',
    color: '#00B4A2',
    initial: 'CN',
    logoUrl: "/research-logos/canton_network_report.png",
  },
  {
    name: 'Midnight',
    description:
      'Compliance-preserving data protection blockchain architecture',
    type: 'L1',
    slug: 'midnight_2026_report',
    color: '#1B1B1B',
    initial: 'MID',
    logoUrl: "/research-logos/midnight_2026_report.png",
  },
  {
    name: 'Plasma',
    description:
      'Stablecoin-native L1 bridging payment and DeFi infrastructure',
    type: 'L1',
    slug: 'plasma_xpl_payfi',
    color: '#2563EB',
    initial: 'XPL',
    logoUrl: "/research-logos/plasma_xpl_payfi.png",
  },
  // ZK / Privacy
  {
    name: 'Aztec Network',
    description: 'Privacy-first zk-rollup with programmable confidentiality',
    type: 'ZK',
    slug: 'aztec_network_zk',
    color: '#1B1B1B',
    initial: 'AZT',
    logoUrl: "/research-logos/aztec_network_zk.png",
  },
  {
    name: 'Succinct Labs',
    description:
      'Decentralized ZK proof infrastructure and verifiable computation',
    type: 'ZK',
    slug: 'succinct_labs_zk_proof',
    color: '#0EA5E9',
    initial: 'SP1',
    logoUrl: "/research-logos/succinct_labs_zk_proof.png",
  },
  {
    name: 'Brevis',
    description:
      'ZK coprocessor and modular zkVM for on-chain data verification',
    type: 'ZK',
    slug: 'brev_brevis_2026_zk',
    color: '#0891B2',
    initial: 'BRV',
    logoUrl: "/research-logos/brev_brevis_2026_zk.png",
  },
  {
    name: 'Zama',
    description:
      'FHE stack enabling full confidentiality for blockchain applications',
    type: 'FHE',
    slug: 'zama_fhe_zk_2026',
    color: '#6D28D9',
    initial: 'ZAMA',
    logoUrl: "/research-logos/zama_fhe_zk_2026.jpg",
  },
  {
    name: 'Octra',
    description: 'Hypergraph-based FHE architecture for confidential computing',
    type: 'FHE',
    slug: 'octra_fhe_zk',
    color: '#7C3AED',
    initial: 'OCT',
    logoUrl: "/research-logos/octra_fhe_zk.png",
  },
  {
    name: 'Cysic',
    description: 'Hardware-accelerated verifiable compute for ZK proofs',
    type: 'ZK',
    slug: 'cysic_network_cys',
    color: '#059669',
    initial: 'CYS',
    logoUrl: "/research-logos/cysic_network_cys.png",
  },
  {
    name: 'zkPass',
    description:
      'zkTLS as trust-minimized bridge between Web2 data and on-chain proofs',
    type: 'ZK',
    slug: 'zkpass_zkp_2026',
    color: '#4F46E5',
    initial: 'ZKP',
    logoUrl: "/research-logos/zkpass_zkp_2026.png",
  },
  {
    name: 'Railgun',
    description: 'Privacy infrastructure for composable DeFi transactions',
    type: 'Privacy',
    slug: 'railgun_zk_privacy',
    color: '#111827',
    initial: 'RAIL',
    logoUrl: "/research-logos/railgun_zk_privacy.png",
  },
  {
    name: 'Inference Labs',
    description: 'Verifiable AI inference via zkML and on-chain proof systems',
    type: 'ZK',
    slug: 'inferencelabs_zkml_proof_2026',
    color: '#1E3A5F',
    initial: 'INF',
    logoUrl: "/research-logos/inferencelabs_zkml_proof_2026.png",
  },
  // Prediction
  {
    name: 'Polymarket',
    description: 'Largest crypto prediction market with $21.5B volume in 2025',
    type: 'Prediction',
    slug: 'polymarket_kalshi_prediction_2026',
    color: '#00D4FF',
    initial: 'PLY',
    logoUrl: "/research-logos/polymarket_kalshi_prediction_2026.png",
  },
  {
    name: 'Opinion Labs',
    description:
      'Macro prediction exchange for institutional-grade market signals',
    type: 'Prediction',
    slug: 'opinion_labs_pred',
    color: '#F97316',
    initial: 'OPN',
    logoUrl: "/research-logos/opinion_labs_pred.svg",
  },
  {
    name: 'Rain Protocol',
    description:
      'AMM-based prediction market infrastructure with on-chain resolution',
    type: 'Prediction',
    slug: 'rain_protocol_prediction',
    color: '#0284C7',
    initial: 'RAIN',
    logoUrl: "/research-logos/rain_protocol_prediction.png",
  },
  {
    name: 'Kairos',
    description:
      'Prediction market execution terminal and infrastructure economics',
    type: 'Prediction',
    slug: 'kairos_trade_prediction_terminal',
    color: '#9333EA',
    initial: 'KRS',
    logoUrl: "/research-logos/kairos_trade_prediction_terminal.png",
  },
  {
    name: 'Predict.fun',
    description:
      'On-chain prediction market with Binance ecosystem integration',
    type: 'Prediction',
    slug: 'predict_fun_binance',
    color: '#2DD4BF',
    initial: 'PRD',
    logoUrl: "/research-logos/predict_fun_binance.svg",
  },
  {
    name: 'Probable',
    description:
      'Orderbook oracle prediction market on BNB Chain with $2.1B cumulative volume',
    type: 'Prediction',
    slug: 'probable_predict',
    color: '#F59E0B',
    initial: 'PRB',
    logoUrl: "/research-logos/probable_predict.svg",
  },
  // Stablecoin / PayFi
  {
    name: 'Circle',
    description:
      'Global stablecoin issuer and cross-chain settlement infrastructure',
    type: 'Stablecoin',
    slug: 'circle_stablecoin_arc',
    color: '#2775CA',
    initial: 'USDC',
    logoUrl: "/research-logos/circle_stablecoin_arc.jpg",
  },
  {
    name: 'RedotPay',
    description:
      'Regulated PayFi with $10B annualized payment volume and 6M+ users',
    type: 'PayFi',
    slug: 'redotpay_report_2026',
    color: '#EF4444',
    initial: 'RDP',
    logoUrl: "/research-logos/redotpay_report_2026.png",
  },
  {
    name: 'USDG',
    description:
      'Globally compliant digital dollar backed by institutional reserves',
    type: 'Stablecoin',
    slug: 'usdg-global-dollar-institutional-grade-analysis-and-investment-outlook-for',
    color: '#16A34A',
    initial: 'USDG',
    logoUrl: "/research-logos/usdg-global-dollar-institutional-grade-analysis-and-investment-outlook-for.png",
  },
  {
    name: 'USD.AI',
    description: 'Hybrid RWA-backed stablecoin targeting GPU credit markets',
    type: 'Stablecoin',
    slug: 'usd_ai_rwa',
    color: '#854D0E',
    initial: 'USD',
    logoUrl: "/research-logos/usd_ai_rwa.png",
  },
  {
    name: 'Tria',
    description:
      'Chain-abstraction neobank and BestPath AVS for seamless payments',
    type: 'PayFi',
    slug: 'tria_card_pay',
    color: '#7C3AED',
    initial: 'TRIA',
    logoUrl: "/research-logos/tria_card_pay.png",
  },
  {
    name: 'River',
    description:
      'Chain-abstraction stablecoin connecting assets to optimal yield across ecosystems',
    type: 'Stablecoin',
    slug: 'river_satoshi_protocol',
    color: '#0EA5E9',
    initial: 'RVR',
    logoUrl: "/research-logos/river_satoshi_protocol.png",
  },
  {
    name: 'KGST',
    description:
      'Investment-grade stablecoin protocol with institutional backing',
    type: 'Stablecoin',
    slug: 'kgst_stablecoin',
    color: '#15803D',
    initial: 'KGST',
    logoUrl: "/research-logos/kgst_stablecoin.svg",
  },
  // AI / DePIN
  {
    name: 'Gensyn',
    description:
      'Decentralized ML compute protocol with 80% cost advantage over AWS',
    type: 'AI/DePIN',
    slug: 'gensyn_pretge_report',
    color: '#10B981',
    initial: 'GSN',
    logoUrl: "/research-logos/gensyn_pretge_report.png",
  },
  {
    name: 'Sentient Protocol',
    description:
      'Open AGI development platform with decentralized model ownership',
    type: 'AI/DePIN',
    slug: 'sentient_protocol_outlook_2026',
    color: '#7C3AED',
    initial: 'SNT',
    logoUrl: "/research-logos/sentient_protocol_outlook_2026.svg",
  },
  {
    name: 'DeAgentAI',
    description:
      'AI agent infrastructure layer with on-chain autonomous execution',
    type: 'AI/DePIN',
    slug: 'deagent_ai_aia',
    color: '#1D4ED8',
    initial: 'AIA',
    logoUrl: "/research-logos/deagent_ai_aia.png",
  },
  {
    name: 'Warden Protocol',
    description: 'Verifiable AI infrastructure layer for on-chain intelligence',
    type: 'AI/DePIN',
    slug: 'warden_protocol',
    color: '#EA580C',
    initial: 'WRD',
    logoUrl: "/research-logos/warden_protocol.png",
  },
  {
    name: 'Fabric Protocol',
    description: 'AI robotics infrastructure for physical-digital automation',
    type: 'AI/DePIN',
    slug: 'fabric-protocol-in-depth-research-report-ai-robotics',
    color: '#0F766E',
    initial: 'FAB',
    logoUrl: "/research-logos/fabric-protocol-in-depth-research-report-ai-robotics.png",
  },
  // RWA
  {
    name: 'Centrifuge',
    description:
      'Leading RWA tokenization infrastructure with $8B+ on-chain assets',
    type: 'RWA',
    slug: 'centrifuge-cfg-rwa-tokenization-infrastructure-investment-research-report',
    color: '#2762FF',
    initial: 'CFG',
    logoUrl: "/research-logos/centrifuge-cfg-rwa-tokenization-infrastructure-investment-research-report.png",
  },
  {
    name: 'Integra',
    description:
      'Purpose-built L1 for real estate tokenization and regulated RWAs',
    type: 'RWA',
    slug: 'integra_layer1_rwa',
    color: '#92400E',
    initial: 'INT',
    logoUrl: "/research-logos/integra_layer1_rwa.jpg",
  },
  {
    name: 'BlockStreet',
    description: 'VC-grade infrastructure for tokenized capital markets',
    type: 'RWA',
    slug: 'blockstreet-vc-grade-infrastructure-analysis-for-tokenized-capital-markets',
    color: '#1F2937',
    initial: 'BST',
    logoUrl: "/research-logos/blockstreet-vc-grade-infrastructure-analysis-for-tokenized-capital-markets.png",
  },
  {
    name: 'Sky Token',
    description:
      'MakerDAO rebranded protocol with emission cut and buyback program',
    type: 'DeFi',
    slug: 'sky-token-impact-emission-cut-and-buyback-program-analysis',
    color: '#0369A1',
    initial: 'SKY',
    logoUrl: "/research-logos/sky-token-impact-emission-cut-and-buyback-program-analysis.svg",
  },
  // Other
  {
    name: 'Rainbow Wallet',
    description: 'Design-led non-custodial Ethereum wallet with RainbowKit SDK',
    type: 'Wallet',
    slug: 'rainbow_report_public_sale',
    color: '#8B5CF6',
    initial: 'RBW',
    logoUrl: "/research-logos/rainbow_report_public_sale.png",
  },
  {
    name: 'Unitas Protocol',
    description: 'Solana-native yield-bearing stablecoin protocol',
    type: 'Stablecoin',
    slug: 'unitas-labs-unitas-protocol-investment-research-report',
    color: '#0891B2',
    initial: 'UNT',
    logoUrl: "/research-logos/unitas-labs-unitas-protocol-investment-research-report.png",
  },
  {
    name: 'Cascade Neo',
    description: 'Cross-asset margin unification brokerage architecture',
    type: 'DeFi',
    slug: 'cascade_neo_prediction',
    color: '#374151',
    initial: 'CSC',
    logoUrl: "/research-logos/cascade_neo_prediction.png",
  },
  {
    name: 'TradeGenius',
    description:
      'Privacy-first on-chain trading OS with $160M testnet volume, backed by YZi Labs',
    type: 'DeFi',
    slug: 'tradegenius_genius_terminal_binance',
    color: '#10B981',
    initial: 'TG',
    logoUrl: "/research-logos/tradegenius_genius_terminal_binance.png",
  },
  {
    name: 'MetaDAO',
    description:
      'Futarchy-based governance with $8M+ raised via market-driven mechanism',
    type: 'DeFi',
    slug: 'metadao_publicsale',
    color: '#7C3AED',
    initial: 'META',
    logoUrl: "/research-logos/metadao_publicsale.png",
  },
  {
    name: 'RaveDAO',
    description:
      'Digital-physical bridge for electronic music culture and experience NFTs',
    type: 'DeFi',
    slug: 'ravedao_research',
    color: '#EC4899',
    initial: 'RAVE',
    logoUrl: "/research-logos/ravedao_research.png",
  },
  {
    name: 'Sentio',
    description:
      'Web3 data infrastructure for on-chain analytics, monitoring and indexing',
    type: 'Infra',
    slug: 'web3-data-infrastructure-new-paradigm-sentio',
    color: '#0369A1',
    initial: 'SEN',
    logoUrl: "/research-logos/web3-data-infrastructure-new-paradigm-sentio.svg",
  },
  {
    name: 'Definitive',
    description:
      'Non-custodial multi-chain TWAP trading terminal with $43M+ revenue',
    type: 'DeFi',
    slug: 'definitive-43m-revenue-multi-chain-twap-trading-infrastructure',
    color: '#0F766E',
    initial: 'DEF',
    logoUrl: "/research-logos/definitive-43m-revenue-multi-chain-twap-trading-infrastructure.png",
  },
  {
    name: '币安产品全面分析，产品、技术、用户体验，CZ是如何一步步成功的',
    description:
      'Binance product analyzer and deep research with ai report 2026',
    type: 'AI/DePIN',
    slug: 'binance-product-analyzer-and-deep-research-with-ai-report-2026',
    color: '#0EA5E9',
    initial: 'CZ',
    logoUrl: "/research-logos/binance-product-analyzer-and-deep-research-with-ai-report-2026.svg",
  },
  {
    name: 'Bitcoin Crypto Derivatives Intelligence System',
    description:
      'Geopolitical escalation (US-Iran conflict) drives oil >$100/bbl (WTI +6.6%), ...',
    type: 'DeFi',
    slug: 'bitcoin-crypto-derivatives-intelligence-system-report',
    color: '#6366F1',
    initial: 'BC',
    logoUrl: "/research-logos/bitcoin-crypto-derivatives-intelligence-system-report.png",
  },
  {
    name: '2030 Bitcoin (BTC) $300000',
    description:
      'Bitcoin demonstrates its unique position as a digital store-of-value asset, t...',
    type: 'DeFi',
    slug: 'bitcoin_2030',
    color: '#2563EB',
    initial: '2B',
    logoUrl: "/research-logos/bitcoin_2030.png",
  },
  {
    name: 'Crypto Derivatives Intelligence System',
    description: 'Crypto Derivatives Intelligence System Report 2026-03-14',
    type: 'DeFi',
    slug: 'crypto-derivatives-intelligence-system-report-2026-03-14',
    color: '#4F46E5',
    initial: 'CD',
    logoUrl: "/research-logos/crypto-derivatives-intelligence-system-report-2026-03-14.png",
  },
  {
    name: 'Ethereum (ETH)',
    description:
      'Ethereum remains the dominant smart-contract platform and settlement layer, b...',
    type: 'Yield',
    slug: 'ethereum-eth-the-yield-gap-post-fusaka-ethb-etf-as',
    color: '#DC2626',
    initial: 'EE',
    logoUrl: "/research-logos/ethereum-eth-the-yield-gap-post-fusaka-ethb-etf-as.png",
  },
  {
    name: 'Katana Network',
    description:
      'Katana rethinks L2s as "execution layers" for DeFi, owning revenue streams (s...',
    type: 'Yield',
    slug: 'katana-network-in-depth-analysis-architectural-breakthroughs-and-ecosystem-potential',
    color: '#DC2626',
    initial: 'KN',
    logoUrl: "/research-logos/katana-network-in-depth-analysis-architectural-breakthroughs-and-ecosystem-potential.jpg",
  },
  {
    name: 'PayPay（日本）机构级投研报告（截至 2026',
    description:
      'PayPay 已从“扫码支付（代码支付）App”演化为以支付为入口、以信用卡/银行/证券等金融服务为变现与利润扩展器的日本本土消费金融平台。其规模侧（用户...',
    type: 'DeFi',
    slug: 'paypay-report',
    color: '#8B5CF6',
    initial: 'P2',
    logoUrl: "/research-logos/paypay-report.png",
  },
  {
    name: 'Tempo Research',
    description:
      'Tempo is an EVM-compatible Layer 1 blockchain launched on mainnet March 18, 2...',
    type: 'DEX',
    slug: 'tempo-research-report-payments-optimized-l1-blockchain',
    color: '#D97706',
    initial: 'TR',
    logoUrl: "/research-logos/tempo-research-report-payments-optimized-l1-blockchain.png",
  },
  {
    name: 'XRP VS Solana,Stellar',
    description:
      'As of 2026-03-18 06:24 UTC – Synthesizing real-time market, on-chain, develop...',
    type: 'PayFi',
    slug: 'xrp-vs',
    color: '#0891B2',
    initial: 'XV',
    logoUrl: "/research-logos/xrp-vs.png",
  },
  {
    name: '2026 Crypto Market Structural Outlook',
    description:
      'The best time to buy ETH was $10. The second best time is before the 2026 liq...',
    type: 'DeFi',
    slug: '2026_crypto_market_outlook',
    color: '#7C3AED',
    initial: '2C',
    logoUrl: "/research-logos/2026_crypto_market_outlook.png",
  },
  {
    name: '2026 Crypto Market Outlook',
    description:
      'The best time to buy ETH was $10. The second best time is before the 2026 liq...',
    type: 'DeFi',
    slug: '2026_crypto_prediction',
    color: '#DC2626',
    initial: '2C',
    logoUrl: "/research-logos/2026_crypto_prediction.png",
  },
  {
    name: 'A Comparative',
    description:
      'Arc is an open Layer-1 blockchain created by Circle, utilizing the high-perfo...',
    type: 'L1',
    slug: 'arc_tempo_stablecoin',
    color: '#F59E0B',
    initial: 'AC',
    logoUrl: "/research-logos/arc_tempo_stablecoin.svg",
  },
  {
    name: '📱 Web3 dApp Era',
    description: 'mobile-first for crypto mass-adoption',
    type: 'DeFi',
    slug: 'mobile_first_dapp',
    color: '#DC2626',
    initial: 'WD',
    logoUrl: "/research-logos/mobile_first_dapp.svg",
  },
  {
    name: 'Octra Investment Research',
    description:
      'Octra is an upcoming, general-purpose confidential computing network that all...',
    type: 'FHE',
    slug: 'octra_report_2025',
    color: '#4F46E5',
    initial: 'OI',
    logoUrl: "/research-logos/octra_report_2025.png",
  },
  {
    name: '2026 Web3 & Crypto Investment Opportunities',
    description:
      'Prominent VCs, institutions, and KOLs on X are bullish on 2026 as crypto "ins...',
    type: 'Privacy',
    slug: 'prediction_2026_kol_vc',
    color: '#6366F1',
    initial: '2W',
    logoUrl: "/research-logos/prediction_2026_kol_vc.png",
  },
  {
    name: 'The Rise of Prediction Markets',
    description:
      'Google integration of market prediction data into its search engine and finan...',
    type: 'Prediction',
    slug: 'prediction_pmf_2026',
    color: '#0EA5E9',
    initial: 'TR',
    logoUrl: "/research-logos/prediction_pmf_2026.png",
  },
  {
    name: 'Crypto tokens that outperformed Bitcoin in early(Q1',
    description: 'just a few altcoin win.',
    type: 'DeFi',
    slug: 'rate_altcoin_btc',
    color: '#F59E0B',
    initial: 'CT',
    logoUrl: "/research-logos/rate_altcoin_btc.png",
  },
  {
    name: 'Global Stablecoin Sector',
    description:
      'The stablecoin sector represents a $310 billion blockchain-native monetary sy...',
    type: 'Stablecoin',
    slug: 'stable_coin_report_2026',
    color: '#2563EB',
    initial: 'GS',
    logoUrl: "/research-logos/stable_coin_report_2026.png",
  },
  {
    name: 'The Rise of the Synthetic Crypto Index',
    description: 'Intelligence is Asset.',
    type: 'DeFi',
    slug: 'synthetic_crypto_index',
    color: '#0284C7',
    initial: 'TR',
    logoUrl: "/research-logos/synthetic_crypto_index.png",
  },
  {
    name: 'PreStocks',
    description:
      'PreStocks tokenizes economic exposure to pre-IPO private companies like Space...',
    type: 'RWA',
    slug: 'prestocks-bringing-spacex-and-openai-on-chain-a-new-gateway',
    color: '#F59E0B',
    initial: 'PRES',
    logoUrl: "/research-logos/prestocks-bringing-spacex-and-openai-on-chain-a-new-gateway.png",
  },
  {
    name: 'USDT',
    description: 'USDT - The Backbone of Crypto Liquidity',
    type: 'DeFi',
    slug: 'usdt-the-backbone-of-crypto-liquidity',
    color: '#EF4444',
    initial: 'USDT',
    logoUrl: "/research-logos/usdt-the-backbone-of-crypto-liquidity--usdt.png",
  },
  {
    name: 'Bitcoin Performance',
    description:
      'Bitcoin has experienced a 5.5% decline over the past week, trading at approxi...',
    type: 'DeFi',
    slug: 'bitcoin-performance-report-recent-consolidation-amid-fear-and-accumulation-signals',
    color: '#4F46E5',
    initial: 'BP',
    logoUrl: "/research-logos/bitcoin-performance-report-recent-consolidation-amid-fear-and-accumulation-signals.png",
  },
  {
    name: 'Chainlink vs Pyth',
    description:
      'Chainlink emerges as the structurally superior protocol with unmatched ecosys...',
    type: 'Infra',
    slug: 'chainlink-vs',
    color: '#D97706',
    initial: 'CV',
    logoUrl: "/research-logos/chainlink-vs.png",
  },
  {
    name: 'GenLayer',
    description:
      'GenLayer is primarily a synthetic jurisdiction for subjective on-chain coordi...',
    type: 'AI/DePIN',
    slug: 'genlayer-ai-native-blockchain-or-just-a-synthetic-governance-narrative',
    color: '#D97706',
    initial: 'GENL',
    logoUrl: "/research-logos/genlayer-ai-native-blockchain-or-just-a-synthetic-governance-narrative.png",
  },
  {
    name: 'Mezo Network',
    description:
      'Mezo Network operates as a Bitcoin economic and yield layer (BitcoinFi L2), e...',
    type: 'Lending',
    slug: 'mezo-network-evaluating-btc-utility-security-tradeoffs-and-value-accrual',
    color: '#DC2626',
    initial: 'MN',
    logoUrl: "/research-logos/mezo-network-evaluating-btc-utility-security-tradeoffs-and-value-accrual.png",
  },
  {
    name: 'USDT Dominance',
    description:
      'USDT remains the undisputed king of stablecoins, commanding $184B in outstand...',
    type: 'Perp DEX',
    slug: 'usdt-dominance-stablecoin-king',
    color: '#EF4444',
    initial: 'UD',
    logoUrl: "/research-logos/usdt-the-backbone-of-crypto-liquidity--usdtdominance.png",
  },
  {
    name: '什么是播客',
    description:
      '+ 狭义的播客，一般是指独立播客。 即符合上述国外制作流程的播客。用去中心化的方式进行分发，所有内容都可以由你自己掌控。因此你需要有自己的托管服务器、有自...',
    type: 'DeFi',
    slug: 'podcasts',
    color: '#F59E0B',
    initial: 'XX',
    logoUrl: "/research-logos/podcasts.png",
  },
  {
    name: 'Dogecoin (DOGE)',
    description:
      'Dogecoin (DOGE) has evolved from a 2013 internet joke into crypto is most end...',
    type: 'PayFi',
    slug: 'dogecoin-doge-in-depth-research-report-cultural-blue-chip-meme',
    color: '#0EA5E9',
    initial: 'DD',
    logoUrl: "/research-logos/dogecoin-doge-in-depth-research-report-cultural-blue-chip-meme.png",
  },
  {
    name: 'The Exchange Chains of BNB Ecosystem',
    description:
      'BNB occupies a structurally unique position in crypto as the native token of ...',
    type: 'CEX',
    slug: 'the-exchange-chains-of-bnb-ecosystem-no-binance-no-bsc',
    color: '#4F46E5',
    initial: 'TE',
    logoUrl: "/research-logos/the-exchange-chains-of-bnb-ecosystem-no-binance-no-bsc.png",
  },
  {
    name: 'TRON',
    description:
      'TRON occupies a structurally important niche as the dominant settlement layer...',
    type: 'Stablecoin',
    slug: 'tron-stablecoin-settlement-dominator-or-fragile-market-structure-beneficiary',
    color: '#059669',
    initial: 'TRON',
    logoUrl: "/research-logos/tron-stablecoin-settlement-dominator-or-fragile-market-structure-beneficiary.png",
  },
  {
    name: 'USDC',
    description:
      'USDC, issued by Circle, holds a $77.5B market cap as of 2026-04-05, represent...',
    type: 'Stablecoin',
    slug: 'usdc-compliant-infrastructure-in-crypto-is-dollar-layer-positioning-durability',
    color: '#D97706',
    initial: 'USDC',
    logoUrl: "/research-logos/usdc-compliant-infrastructure-in-crypto-is-dollar-layer-positioning-durability.png",
  },
  {
    name: 'Bitcoin Cash (BCH)',
    description:
      'BCH trades at $439 (MCap $8.8B, 24h vol $207M) amid bearish technicals (1d RS...',
    type: 'PayFi',
    slug: 'bitcoin-cash-bch-reviving-peer-to-peer',
    color: '#10B981',
    initial: 'BC',
    logoUrl: "/research-logos/bitcoin-cash-bch-reviving-peer-to-peer.png",
  },
  {
    name: 'Cardano (ADA)',
    description:
      'Cardano stands as a research-driven, governance-centric Layer 1 blockchain wi...',
    type: 'L1',
    slug: 'cardano-ada-governance-centric-l1-architectural-strength-vs',
    color: '#059669',
    initial: 'CA',
    logoUrl: "/research-logos/cardano-ada-governance-centric-l1-architectural-strength-vs.png",
  },
  {
    name: 'DAI',
    description:
      'DAI, the flagship stablecoin of the Sky Protocol (formerly MakerDAO), maintai...',
    type: 'Lending',
    slug: 'dai-decentralized-dollar-ideal-or-governance-orchestrated-collateral-construct',
    color: '#F59E0B',
    initial: 'DAI',
    logoUrl: "/research-logos/dai-decentralized-dollar-ideal-or-governance-orchestrated-collateral-construct.png",
  },
  {
    name: 'Ethena and USDe',
    description:
      'Ethena represents a bold experiment in crypto-native dollar infrastructure, d...',
    type: 'Perp DEX',
    slug: 'ethena-and-usde-durability-of-the-synthetic-dollar-model-risks',
    color: '#EF4444',
    initial: 'EA',
    logoUrl: "/research-logos/ethena-and-usde-durability-of-the-synthetic-dollar-model-risks.png",
  },
  {
    name: 'Institutional Deep Dive',
    description:
      'UNUS SED LEO (LEO), the utility token of the iFinex/Bitfinex ecosystem, trade...',
    type: 'Wallet',
    slug: 'institutional-deep-dive-unus-sed-leo-leo-ifinex-ecosystem-s',
    color: '#4F46E5',
    initial: 'ID',
    logoUrl: "/research-logos/institutional-deep-dive-unus-sed-leo-leo-ifinex-ecosystem-s.png",
  },
  {
    name: 'Monero (XMR)',
    description:
      'Monero stands as the preeminent privacy-preserving monetary network, deliveri...',
    type: 'CEX',
    slug: 'monero-xmr-privacy-money-s-last-stand-durable-censorship-resistant',
    color: '#EC4899',
    initial: 'MX',
    logoUrl: "/research-logos/monero-xmr-privacy-money-s-last-stand-durable-censorship-resistant.png",
  },
  {
    name: 'Solana (SOL)',
    description:
      'Solana has evolved from a post-FTX recovery narrative into a dominant high-pe...',
    type: 'DEX',
    slug: 'solana-sol-monolithic-execution-powerhouse-or-fragile-high-beta-trading',
    color: '#D97706',
    initial: 'SS',
    logoUrl: "/research-logos/solana-sol-monolithic-execution-powerhouse-or-fragile-high-beta-trading.png",
  },
  {
    name: 'World Liberty Financial USD (USD1)',
    description:
      'USD1, issued by BitGo under the World Liberty Financial (WLFI) brand, has rap...',
    type: 'Stablecoin',
    slug: 'world-liberty-financial-usd-usd1-reserve-credible-challenger-or-politically',
    color: '#D97706',
    initial: 'WL',
    logoUrl: "/research-logos/world-liberty-financial-usd-usd1-reserve-credible-challenger-or-politically.svg",
  },
  {
    name: 'Avalanche (AVAX)',
    description:
      'Avalanche positions itself as a high-performance, multi-chain smart contract ...',
    type: 'L2',
    slug: 'avalanche-avax-strategic-appchain-platform-or-adoption-constrained-institutional-stack',
    color: '#7C3AED',
    initial: 'AA',
    logoUrl: "/research-logos/avalanche-avax-strategic-appchain-platform-or-adoption-constrained-institutional-stack.png",
  },
  {
    name: 'Bittensor (TAO)',
    description:
      'Bittensor positions itself as an open marketplace for machine intelligence, w...',
    type: 'RWA',
    slug: 'bittensor-tao-permissionless-ai-coordination-durable-economic-infrastructure-or-narrative',
    color: '#EF4444',
    initial: 'BT',
    logoUrl: "/research-logos/bittensor-tao-permissionless-ai-coordination-durable-economic-infrastructure-or-narrative.jpg",
  },
  {
    name: 'Global Dollar (USDG)',
    description:
      'Global Dollar (USDG) represents a strategic bet on regulated stablecoin infra...',
    type: 'DEX',
    slug: 'global-dollar-usdg-regulated-challenger-or-partner-distribution-network',
    color: '#4F46E5',
    initial: 'GD',
    logoUrl: "/research-logos/global-dollar-usdg-regulated-challenger-or-partner-distribution-network.png",
  },
  {
    name: 'Hedera (HBAR)',
    description:
      'Hedera positions itself as the enterprise-grade public distributed ledger, le...',
    type: 'RWA',
    slug: 'hedera-hbar-enterprise-grade-dlt-infrastructure-governance-moat-adoption-reality',
    color: '#0891B2',
    initial: 'HH',
    logoUrl: "/research-logos/hedera-hbar-enterprise-grade-dlt-infrastructure-governance-moat-adoption-reality.png",
  },
  {
    name: 'Litecoin (LTC)',
    description:
      'Litecoin endures as a mature, low-cost settlement network with a durable liqu...',
    type: 'CEX',
    slug: 'litecoin-ltc-enduring-liquidity-bastion-amid-stablecoin-payment-dominance',
    color: '#10B981',
    initial: 'LL',
    logoUrl: "/research-logos/litecoin-ltc-enduring-liquidity-bastion-amid-stablecoin-payment-dominance.png",
  },
  {
    name: 'Mantle (MNT)',
    description:
      'Mantle Network has carved a distinctive position within Ethereum is Layer 2 e...',
    type: 'L2',
    slug: 'mantle-mnt-treasury-backed-modular-l2-platform-or-execution-sensitive',
    color: '#059669',
    initial: 'MM',
    logoUrl: "/research-logos/mantle-mnt-treasury-backed-modular-l2-platform-or-execution-sensitive.png",
  },
  {
    name: 'MemeCore (M)',
    description:
      'MemeCore positions itself as an EVM-compatible Layer 1 blockchain engineered ...',
    type: 'L1',
    slug: 'memecore-m-meme-2',
    color: '#7C3AED',
    initial: 'MM',
    logoUrl: "/research-logos/memecore-m-meme-2.png",
  },
  {
    name: 'Naoris Protocol (NAORIS)',
    description:
      'Naoris Protocol positions itself as a Sub-Zero Layer 1 blockchain designed to...',
    type: 'L2',
    slug: 'naoris-protocol-naoris-post-quantum-sub-zero-layer-security-infrastructure',
    color: '#0891B2',
    initial: 'NP',
    logoUrl: "/research-logos/naoris-protocol-naoris-post-quantum-sub-zero-layer-security-infrastructure.png",
  },
  {
    name: 'NEAR Protocol',
    description:
      'NEAR Protocol has evolved from a sharded Layer 1 blockchain into a unified co...',
    type: 'Privacy',
    slug: 'near-protocol-chain-abstraction-leader-in-the-agentic-economy-institutional',
    color: '#EF4444',
    initial: 'NP',
    logoUrl: "/research-logos/near-protocol-chain-abstraction-leader-in-the-agentic-economy-institutional.png",
  },
  {
    name: 'OpenGradient',
    description:
      'OpenGradient bills itself as decentralized AI infrastructure. The pitch: perm...',
    type: 'PayFi',
    slug: 'opengradient-verifiable-ai-infrastructure-or-decentralized-ai-narrative-proxy',
    color: '#059669',
    initial: 'OPEN',
    logoUrl: "/research-logos/opengradient-verifiable-ai-infrastructure-or-decentralized-ai-narrative-proxy.png",
  },
  {
    name: 'PEPE',
    description:
      'PEPE has made the jump from 2023 viral launch to legitimate large-cap meme be...',
    type: 'DeFi',
    slug: 'pepe-meme-benchmark-or-cyclical-beta',
    color: '#0284C7',
    initial: 'PEPE',
    logoUrl: "/research-logos/pepe-meme-benchmark-or-cyclical-beta.png",
  },
  {
    name: 'Polkadot (DOT)',
    description:
      'Polkadot positions itself as a heterogeneous multi-chain coordination network...',
    type: 'DeFi',
    slug: 'polkadot-dot-shared-security-coordination-layer-in-a-modular-world',
    color: '#F59E0B',
    initial: 'PD',
    logoUrl: "/research-logos/polkadot-dot-shared-security-coordination-layer-in-a-modular-world.png",
  },
  {
    name: 'Shiba Inu (SHIB)',
    description:
      'Shiba Inu (SHIB): Beyond Meme Cycles – Ecosystem Durability and Institutional...',
    type: 'DeFi',
    slug: 'shiba-inu-shib-beyond-meme-cycles-ecosystem-durability-and-institutional',
    color: '#0891B2',
    initial: 'SI',
    logoUrl: "/research-logos/shiba-inu-shib-beyond-meme-cycles-ecosystem-durability-and-institutional.png",
  },
  {
    name: 'Zama Privacy Upgrade',
    description:
      'Zama is Fully Homomorphic Encryption (FHE) integration into Shibarium will me...',
    type: 'FHE',
    slug: 'zama-privacy-upgrade-will-it-boost-shib-ecosystem-security',
    color: '#0284C7',
    initial: 'ZP',
    logoUrl: "/research-logos/zama-privacy-upgrade-will-it-boost-shib-ecosystem-security.jpg",
  },
  {
    name: 'Zcash (ZEC)',
    description:
      'Zcash occupies a structurally unique position in crypto as selectively privat...',
    type: 'ZK',
    slug: 'zcash-zec-selectively-private-money-in-a-surveillance-economy-zk',
    color: '#0EA5E9',
    initial: 'ZZ',
    logoUrl: "/research-logos/zcash-zec-selectively-private-money-in-a-surveillance-economy-zk.png",
  },
  {
    name: 'Cronos',
    description:
      'Been looking at Cronos lately, and honestly, the numbers don not add up. Trad...',
    type: 'L2',
    slug: 'cronos-crypto-loyalty-cro',
    color: '#F59E0B',
    initial: 'CRON',
    logoUrl: "/research-logos/cronos-crypto-loyalty-cro.png",
  },
  {
    name: 'Internet Computer (ICP)',
    description:
      'Been revisiting ICP lately, and honestly, it is gotten more interesting since...',
    type: 'AI/DePIN',
    slug: 'internet-computer-icp-institutional-venture-memo-on-full-stack-on',
    color: '#D97706',
    initial: 'IC',
    logoUrl: "/research-logos/internet-computer-icp-institutional-venture-memo-on-full-stack-on.png",
  },
  {
    name: 'OKB',
    description:
      'OKB, the native token of the OKX ecosystem, has undergone a transformative to...',
    type: 'CEX',
    slug: 'okb-exchange-utility-token-in-a-post-scarcity-era-capturing',
    color: '#0284C7',
    initial: 'OKB',
    logoUrl: "/research-logos/okb-exchange-utility-token-in-a-post-scarcity-era-capturing.png",
  },
  {
    name: 'Pharos Network',
    description:
      'Pharos Network: Pre-TGE RWA L1 Venture Investment Memo, T RWA Opportunity Risks',
    type: 'L1',
    slug: 'pharos-network-pre-tge-rwa-l1-venture-investment-memo-t',
    color: '#0284C7',
    initial: 'PN',
    logoUrl: "/research-logos/pharos-network-pre-tge-rwa-l1-venture-investment-memo-t.png",
  },
  {
    name: 'Toncoin (TON)',
    description:
      'TON is a distribution-led consumer platform with payments optionality, not do...',
    type: 'PayFi',
    slug: 'toncoin-ton-telegram-distribution-moat-and-the-quest-for-consumer',
    color: '#EC4899',
    initial: 'TT',
    logoUrl: "/research-logos/toncoin-ton-telegram-distribution-moat-and-the-quest-for-consumer.png",
  },
  {
    name: 'Beldex (BDX)',
    description:
      'Beldex positions itself as an integrated privacy ecosystem comprising a PoS L...',
    type: 'Privacy',
    slug: 'beldex-bdx-privacy-infrastructure-ecosystem-technical-economic-and-investment-analysis',
    color: '#D97706',
    initial: 'BB',
    logoUrl: "/research-logos/beldex-bdx-privacy-infrastructure-ecosystem-technical-economic-and-investment-analysis.png",
  },
  {
    name: 'Dash',
    description:
      'Dash: Legacy Digital Cash or Resilient DAO? Institutional Analysis of Archite...',
    type: 'DeFi',
    slug: 'dash-legacy-digital-cash-or-resilient-dao',
    color: '#F59E0B',
    initial: 'DASH',
    logoUrl: "/research-logos/dash-legacy-digital-cash-or-resilient-dao.png",
  },
  {
    name: 'Decoding XDC Network',
    description:
      'XDC Network operates as a specialized, EVM-compatible Layer-1 blockchain targ...',
    type: 'L1',
    slug: 'decoding-xdc-network-xdpos-consensus-enterprise-architecture-and-token-value',
    color: '#4F46E5',
    initial: 'DX',
    logoUrl: "/research-logos/decoding-xdc-network-xdpos-consensus-enterprise-architecture-and-token-value.png",
  },
  {
    name: 'DeXe Protocol',
    description:
      'DeXe Protocol: Institutional Analysis of DAO Infrastructure, Governance, and ...',
    type: 'Infra',
    slug: 'dexe-protocol-institutional-analysis-of-dao-infrastructure-governance-and-dexe',
    color: '#7C3AED',
    initial: 'DP',
    logoUrl: "/research-logos/dexe-protocol-institutional-analysis-of-dao-infrastructure-governance-and-dexe.png",
  },
  {
    name: 'FILCOIN',
    description:
      'FILCOIN: Fil Decentralized Storage Moat & Token Capture Assessment',
    type: 'DeFi',
    slug: 'filcoin-fil-decentralized-storage-moat-and-token-capture-assessment',
    color: '#EC4899',
    initial: 'FILC',
    logoUrl: "/research-logos/filcoin-fil-decentralized-storage-moat-and-token-capture-assessment.png",
  },
  {
    name: 'Kaspa (KAS)',
    description:
      'Kaspa (KAS): Institutional-Grade BlockDAG PoW Analysis – Technical Innovation...',
    type: 'DeFi',
    slug: 'kaspa-kas-institutional-grade-blockdag-pow-analysis-technical-innovation-vs',
    color: '#EF4444',
    initial: 'KK',
    logoUrl: "/research-logos/kaspa-kas-institutional-grade-blockdag-pow-analysis-technical-innovation-vs.png",
  },
  {
    name: 'Nexo Investment Research',
    description:
      'Nexo Investment Research Report: In-Depth Analysis of CeFi Wealth Platform an...',
    type: 'DeFi',
    slug: 'nexo-investment-research-report-in-depth-analysis-of-cefi-wealth',
    color: '#4F46E5',
    initial: 'NI',
    logoUrl: "/research-logos/nexo-investment-research-report-in-depth-analysis-of-cefi-wealth.png",
  },
  {
    name: 'Quant (QNT)',
    description:
      'Quant (QNT): Enterprise Interoperability Middleware – Architecture, Adoption ...',
    type: 'DeFi',
    slug: 'quant-qnt-enterprise-interoperability-middleware-architecture-adoption-reality-and-token',
    color: '#0EA5E9',
    initial: 'QQ',
    logoUrl: "/research-logos/quant-qnt-enterprise-interoperability-middleware-architecture-adoption-reality-and-token.png",
  },
  {
    name: 'SIREN Investment Memorandum',
    description:
      'SIREN operates as a BNB Chain-based AI agent project marketed as a dual-perso...',
    type: 'AI/DePIN',
    slug: 'siren-investment-memorandum-bubble-at-b-mc-to-collapse-alert',
    color: '#EC4899',
    initial: 'SI',
    logoUrl: "/research-logos/siren-investment-memorandum-bubble-at-b-mc-to-collapse-alert.png",
  },
  {
    name: 'The pump.fun Bet',
    description:
      'pump.fun operates as a hyper-efficient meme-asset issuance and early-stage sp...',
    type: 'DeFi',
    slug: 'the-pump',
    color: '#0EA5E9',
    initial: 'TP',
    logoUrl: "/research-logos/the-pump.png",
  },
  {
    name: 'Wingbits',
    description:
      'Wingbits Comprehensive Review: From Hardware Incentives to Token Value Capture',
    type: 'DeFi',
    slug: 'wingbits-comprehensive-review-from-hardware-incentives-to-token-value-capture',
    color: '#2563EB',
    initial: 'WING',
    logoUrl: "/research-logos/wingbits-comprehensive-review-from-hardware-incentives-to-token-value-capture.svg",
  },
  {
    name: 'ADI Chain',
    description: 'ADI Chain represents an intriguing experiment in bridging sovereign instituti...',
    type: 'ZK',
    slug: 'adi-chain-mena-is-compliance-fortress-zk-sovereign-bet-or',
    color: '#0EA5E9',
    initial: 'AC',
    logoUrl: "/research-logos/adi-chain-mena-is-compliance-fortress-zk-sovereign-bet-or.svg",
  },
  {
    name: 'AERO veLock Empire',
    description: 'Aerodrome operates as Base is dominant emissions-driven liquidity hub, captur...',
    type: 'DeFi',
    slug: 'aero-velock-empire-base-liquidity-flywheel-under-the-microscope',
    color: '#4F46E5',
    initial: 'AV',
    logoUrl: "/research-logos/aero-velock-empire-base-liquidity-flywheel-under-the-microscope.svg",
  },
  {
    name: 'binance',
    description: 'BinanceLife represents a textbook case of narrative-driven speculation in the...',
    type: 'DeFi',
    slug: 'binance-life-cz-free-money-life',
    color: '#0891B2',
    initial: 'BINA',
    logoUrl: "/research-logos/binance-life-cz-free-money-life.png",
  },
  {
    name: '量子末日倒计时：加密货币如何在"Q',
    description: '2026 年 3 月 30 日，一篇来自谷歌量子 AI 部门的论文彻底打破了加密货币行业的平静。这篇由谷歌量子负责人 Ryan Babbush 与以太坊基...',
    type: 'AI/DePIN',
    slug: 'coinbase-q-day-ryan-babbush-bitcoin',
    color: '#D97706',
    initial: 'Q',
    logoUrl: "/research-logos/coinbase-q-day-ryan-babbush-bitcoin.png",
  },
  {
    name: 'ether.fi Ecosystem & ETHFI Token',
    description: 'ether.fi has matured from a liquid restaking protocol into a diversified "cry...',
    type: 'DeFi',
    slug: 'ether-fi-ecosystem-and-ethfi-token-full-spectrum-analysis',
    color: '#0284C7',
    initial: 'EE',
    logoUrl: "/research-logos/ether-fi-ecosystem-and-ethfi-token-full-spectrum-analysis.png",
  },
  {
    name: 'HertzFlow Investment Memo',
    description: 'HertzFlow is an early-stage, invite-only testnet protocol (launched March 202...',
    type: 'DeFi',
    slug: 'hertzflow-investment-memo-high-risk-watchlist-for-multi-asset-leverage',
    color: '#D97706',
    initial: 'HI',
    logoUrl: "/research-logos/hertzflow-investment-memo-high-risk-watchlist-for-multi-asset-leverage.svg",
  },
  {
    name: 'Is Proof',
    description: 'Is Proof-of-Humanity a Bubble or the AI Era is Moat? — Worldcoin (WLD) Deep D...',
    type: 'AI/DePIN',
    slug: 'worldcoin-is-proof-of-humanity-a-bubble-or-the-ai-era',
    color: '#0891B2',
    initial: 'IP',
    logoUrl: "/research-logos/worldcoin-is-proof-of-humanity-a-bubble-or-the-ai-era.png",
  },
  {
    name: 'Venice AI',
    description: 'Venice operates as a private, uncensored AI inference platform combining a co...',
    type: 'Perp DEX',
    slug: 'venice-ai-private-inference-and-vvv-tokenomics-deep-dive',
    color: '#6366F1',
    initial: 'VA',
    logoUrl: "/research-logos/venice-ai-private-inference-and-vvv-tokenomics-deep-dive.png",
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
  'Infra'
];

function ProjectLogo({ project }: { project: ResearchProject }) {
  const [error, setError] = useState(false);

  if (!project.logoUrl || error) {
    return (
      <div
        className='relative flex w-full aspect-square items-center justify-center rounded-[1.15rem] text-base font-semibold text-white ring-1 ring-black/10 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]'
        style={{ backgroundColor: project.color }}>
        <div className='absolute inset-0 rounded-[1.15rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02))]' />
        <span className='relative tracking-tight'>{project.initial}</span>
      </div>
    );
  }

  return (
    <div className='relative w-full aspect-square overflow-hidden rounded-[1.15rem] p-[1px] shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 group-hover:scale-[1.015]'>
      <div
        className='absolute inset-0 opacity-70'
        style={{
          background: `linear-gradient(160deg, ${project.color}24, rgba(255,255,255,0.88) 42%, rgba(255,255,255,0.96) 100%)`,
        }}
      />
      <div className='relative flex h-full w-full items-center justify-center rounded-[1.1rem] bg-white/95 p-3 ring-1 ring-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-black/20'>
        <img
          src={project.logoUrl}
          alt={project.name}
          onError={() => setError(true)}
          className='h-full w-full object-contain'
        />
      </div>
    </div>
  );
}

export default function ResearchClient() {
  const [activeType, setActiveType] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = PROJECTS.filter((p) => {
    const matchType = activeType === 'All' || p.type === activeType;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.initial.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchType && matchQuery;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const sortedAll = [...PROJECTS].sort((a, b) => a.name.localeCompare(b.name));
  const letterMap = ALPHABET.reduce<Record<string, string>>((acc, letter) => {
    const match = sortedAll.find((p) => p.name.toUpperCase().startsWith(letter));
    if (match) acc[letter] = match.slug;
    return acc;
  }, {});

  const scrollToLetter = (letter: string) => {
    const slug = letterMap[letter];
    if (!slug) return;
    const el = document.getElementById(`project-${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className='relative min-h-[100dvh] overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_34%,#f8fafc_100%)] dark:bg-[linear-gradient(180deg,#030712_0%,#06111f_38%,#020617_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.14),transparent_34%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-[24rem] h-[34rem] bg-[radial-gradient(circle_at_20%_30%,rgba(148,163,184,0.1),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(125,211,252,0.14),transparent_22%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(15,23,42,0.55),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(14,165,233,0.12),transparent_24%)]' />

      {/* A-Z floating index — left side, hidden by default, visible on hover */}
      <div className='group fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 lg:flex'>
        {/* trigger strip */}
        <div className='flex h-full w-3 cursor-pointer items-center justify-center' />
        {/* index panel */}
        <div className='pointer-events-none ml-1 flex translate-x-[-110%] flex-col items-center gap-[2px] rounded-xl border border-border/60 bg-background/90 px-2 py-3 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 opacity-0'>
          {ALPHABET.map((letter) => {
            const active = !!letterMap[letter];
            return (
              <button
                key={letter}
                disabled={!active}
                onClick={() => scrollToLetter(letter)}
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold tracking-wide transition-colors duration-150 ${
                  active
                    ? 'text-foreground hover:bg-foreground/10 cursor-pointer'
                    : 'text-muted-foreground/30 cursor-default'
                }`}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <section className='relative mx-auto flex min-h-[100dvh] w-full max-w-[1150px] flex-col gap-8 px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
        <header className='space-y-5 sm:space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            Research index
          </div>
          <div className='space-y-3'>
            <h1 className='max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-[5.25rem] lg:leading-[0.95]'>
              Research Map
            </h1>
            <p className='max-w-4xl text-[15px] leading-8 text-muted-foreground sm:text-[17px]'>
              {PROJECTS.length} crypto projects, arranged as a living archive of
              deep-dive theses across exchanges, DeFi, infra, AI, and market
              structure.
            </p>
          </div>
        </header>

        <div className='relative max-w-xs'>
          <input
            type='text'
            placeholder='Search by symbol or name...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='w-full rounded-full border border-border/70 bg-background/60 px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition-all duration-200 focus:border-foreground/30 focus:bg-background/85'
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground'>
              ✕
            </button>
          )}
        </div>

        <div className='flex flex-wrap gap-2.5'>
          {ALL_TYPES.filter((t) => {
            if (t === 'All') return true;
            return PROJECTS.some((p) => p.type === t);
          }).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] backdrop-blur-sm transition-all duration-200 ${
                activeType === type
                  ? 'border-foreground/80 bg-foreground text-background shadow-[0_12px_28px_-20px_rgba(15,23,42,0.8)]'
                  : 'border-border/70 bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
              }`}>
              {type}
            </button>
          ))}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4'>
          {filtered.map((project) => (
            <Link
              key={project.slug}
              id={`project-${project.slug}`}
              href={`/blog/${project.slug}`}
              className='group relative flex min-h-[16.5rem] flex-col gap-3 overflow-hidden rounded-[1.4rem] border border-border/60 bg-background/72 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.6)] backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:bg-background/84 hover:shadow-[0_28px_55px_-34px_rgba(15,23,42,0.78)]'>
              <div
                className='absolute inset-x-4 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100'
                style={{
                  background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
                }}
              />
              <ProjectLogo project={project} />
              <div className='space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <span className='pr-1 text-[15px] font-semibold leading-5 tracking-[-0.025em] text-foreground'>
                    {project.name}
                  </span>
                  <span className='shrink-0 rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground shadow-sm backdrop-blur-sm'>
                    {project.type}
                  </span>
                </div>
                <p className='line-clamp-3 text-[13px] leading-6 text-muted-foreground'>
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            No projects in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}
