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
    logoUrl: "/research-logos/osl_group.svg",
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
  {
    name: 'Lighter',
    description:
      'Verifiable ZK-rollup perp DEX testing LIT value capture through fees, staking, and buybacks',
    type: 'Perp DEX',
    slug: 'lighter-lit-verifiable-perp-dex-zk-rollup-value-capture-gap',
    color: '#111827',
    initial: 'LIT',
    logoUrl: "/research-logos/lighter-lit-verifiable-perp-dex-zk-rollup-value-capture-gap.png",
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
    name: 'Raydium',
    description:
      'Solana DEX and launchpad infrastructure where volume, CLMM depth, and buybacks drive RAY value capture',
    type: 'DEX',
    slug: 'raydium-ray-solana-dex-clmm-launchpad-value-capture-gap',
    color: '#8C6CFF',
    initial: 'RAY',
    logoUrl: "/research-logos/raydium-ray-solana-dex-clmm-launchpad-value-capture-gap.jpg",
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
    name: 'Compound',
    description:
      'Blue-chip DeFi lending protocol where Comet TVL must translate into clearer COMP governance value capture',
    type: 'Lending',
    slug: 'compound-comp-comet-lending-governance-value-capture-gap',
    color: '#00D395',
    initial: 'COMP',
    logoUrl: "/research-logos/compound-comp-comet-lending-governance-value-capture-gap.png",
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
    name: 'Akash Network',
    description:
      'Decentralized GPU cloud where ACT settlement, paid utilization, and AKT staking determine value capture',
    type: 'AI/DePIN',
    slug: 'akash-network-akt-decentralized-gpu-compute-ai-cloud-value-capture',
    color: '#FF414C',
    initial: 'AKT',
    logoUrl: "/research-logos/akash-network-akt-decentralized-gpu-compute-ai-cloud-value-capture.png",
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
    logoUrl: "/research-logos/web3-data-infrastructure-new-paradigm-sentio.png",
  },
  {
    name: 'Ethereum Name Service',
    description:
      'Onchain identity and naming infrastructure where ENSv2 growth must close the governance value-capture gap',
    type: 'Identity/Infra',
    slug: 'ethereum-name-service-ens-onchain-identity-ensv2-value-capture',
    color: '#5298FF',
    initial: 'ENS',
    logoUrl: "/research-logos/ethereum-name-service-ens-onchain-identity-ensv2-value-capture.jpg",
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
    logoUrl: "/research-logos/usdt-the-backbone-of-crypto-liquidity.png",
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
    logoUrl: "/research-logos/usdt-dominance-stablecoin-king.png",
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
    name: 'BitTorrent',
    description:
      'Legacy P2P distribution and BTTC infrastructure token where app demand still needs to catch up with market value',
    type: 'DePIN/Infra',
    slug: 'bittorrent-btt-bttc-p2p-distribution-app-demand-gap',
    color: '#111827',
    initial: 'BTT',
    logoUrl: "/research-logos/bittorrent-btt-bttc-p2p-distribution-app-demand-gap.png",
  },
  {
    name: 'FLOKI',
    description:
      'Meme distribution and consumer-utility ecosystem testing whether Valhalla, TokenFi, Trading Bot, and FlokiFi can drive durable FLOKI value capture',
    type: 'Meme/Utility',
    slug: 'floki-floki-meme-distribution-valhalla-tokenfi-utility-value-capture-test',
    color: '#F59E0B',
    initial: 'FLOKI',
    logoUrl: "/research-logos/floki-floki-meme-distribution-valhalla-tokenfi-utility-value-capture-test.svg",
  },
  {
    name: 'Zebec Network',
    description:
      'Real-time payroll, crypto card, and PayFi network where ZBCN value capture depends on transparent product revenue, buybacks, and card spend',
    type: 'PayFi',
    slug: 'zebec-network-zbcn-real-time-payroll-card-payfi-token-value-capture-gap',
    color: '#06B6D4',
    initial: 'ZBCN',
    logoUrl: "/research-logos/zebec-network-zbcn-real-time-payroll-card-payfi-token-value-capture-gap.svg",
  },
  {
    name: 'DoubleZero',
    description:
      'Permissionless dedicated-fiber network for validators and distributed systems where 2Z value capture depends on paid connectivity demand',
    type: 'Infra',
    slug: 'doublezero-2z-permissionless-fiber-network-token-value-capture-gap',
    color: '#111827',
    initial: '2Z',
    logoUrl: "/research-logos/doublezero-2z-permissionless-fiber-network-token-value-capture-gap.png",
  },
  {
    name: 'Grass',
    description:
      'AI data network turning user-contributed residential bandwidth into structured public web datasets with GRASS fee and staking value-capture still needing proof',
    type: 'AI/DePIN',
    slug: 'grass-grass-ai-data-network-residential-bandwidth-token-value-capture-gap',
    color: '#16A34A',
    initial: 'GRASS',
    logoUrl: "/research-logos/grass-grass-ai-data-network-residential-bandwidth-token-value-capture-gap.jpg",
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
    name: 'World Liberty Financial',
    description:
      'Governance token tied to USD1, WLFI Markets, and political PayFi distribution, with a clear token value-capture gap',
    type: 'PayFi/Governance',
    slug: 'world-liberty-financial-wlfi-governance-token-usd1-political-value-capture-risk',
    color: '#EAB308',
    initial: 'WLFI',
    logoUrl: "/research-logos/world-liberty-financial-wlfi-governance-token-usd1-political-value-capture-risk.png",
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
    logoUrl: "/research-logos/bittensor-tao-permissionless-ai-coordination-durable-economic-infrastructure-or-narrative.png",
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
    logoUrl: "/research-logos/memecore-m-meme-2.jpg",
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
    logoUrl: "/research-logos/wingbits-comprehensive-review-from-hardware-incentives-to-token-value-capture.png",
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
  {
    name: 'Beldex Unmasked',
    description: 'Beldex operates as a privacy-focused L1 with an integrated app stack (BChat m...',
    type: 'ZK',
    slug: 'beldex-unmasked-privacy-empire-or-masternode-mirage',
    color: '#DC2626',
    initial: 'BU',
    logoUrl: "/research-logos/beldex-unmasked-privacy-empire-or-masternode-mirage.png",
  },
  {
    name: 'Celestia (TIA)',
    description: 'Celestia positions itself as the leading modular data availability (DA) layer...',
    type: 'L2',
    slug: 'celestia-tia-da-as-the-new-digital-oil-the-hidden',
    color: '#F59E0B',
    initial: 'CT',
    logoUrl: "/research-logos/celestia-tia-da-as-the-new-digital-oil-the-hidden.png",
  },
  {
    name: 'ETHGas Investment Research Memo',
    description: 'ETHGas positions itself as a blockspace marketplace enabling "Realtime Ethere...',
    type: 'DeFi',
    slug: 'ethgas-investment-research-memo-realtime-ethereum-open-gas-and-the',
    color: '#0284C7',
    initial: 'EI',
    logoUrl: "/research-logos/ethgas-investment-research-memo-realtime-ethereum-open-gas-and-the.png",
  },
  {
    name: 'Kaia (KAIA)',
    description: 'Kaia (KAIA): VC Thesis on Asia LINE-Powered L1 for Mini DApps and Stablecoin ...',
    type: 'L1',
    slug: 'kaia-kaia-vc-thesis-on-asia-line-powered-l1-for',
    color: '#D97706',
    initial: 'KK',
    logoUrl: "/research-logos/kaia-kaia-vc-thesis-on-asia-line-powered-l1-for.png",
  },
  {
    name: 'MegaPot',
    description: 'MegaPot is a crypto lottery on Base. Since 2024 it has processed $200M in cum...',
    type: 'DeFi',
    slug: 'megapot-investment-memo-global-lottery-infrastructure-for-the-internet-era',
    color: '#0EA5E9',
    initial: 'MEGA',
    logoUrl: "/research-logos/megapot-investment-memo-global-lottery-infrastructure-for-the-internet-era.png",
  },
  {
    name: 'StableDev Investment Thesis',
    description: 'Stablecoin Development Corporation (SDEV), formerly NovaBay Pharmaceuticals, ...',
    type: 'Yield',
    slug: 'stabledev-investment-thesis-from-single-sky-exposure-to-stablecoin-platform',
    color: '#059669',
    initial: 'SI',
    logoUrl: "/research-logos/stabledev-investment-thesis-from-single-sky-exposure-to-stablecoin-platform.png",
  },
  {
    name: 'xMoney / XMN',
    description: 'xMoney (ex-Utrust) positions as a MiCA-compliant payments stack blending fiat...',
    type: 'DEX',
    slug: 'xmoney-xmn-tokenized-payments-revolution-vc-verdict-on-europe-mica',
    color: '#F59E0B',
    initial: 'XX',
    logoUrl: "/research-logos/xmoney-xmn-tokenized-payments-revolution-vc-verdict-on-europe-mica.svg",
  },
  {
    name: 'Evaluating Printr',
    description: 'Executive Summary (as of 2026-04-27 09:55 UTC): Printr operates as a chain-ab...',
    type: 'DeFi',
    slug: 'evaluating-printr-creator-aligned-omnichain-launchpad',
    color: '#0EA5E9',
    initial: 'EP',
    logoUrl: "/research-logos/evaluating-printr-creator-aligned-omnichain-launchpad.svg",
  },
  {
    name: 'KelpDAO Exploit',
    description: 'The KelpDAO exploit on April 18, 2026 (17:35 UTC) marks a watershed moment fo...',
    type: 'DeFi',
    slug: 'kelpdao-exploit-composability-fragility-test-for-layerzero-aave-lrts-and',
    color: '#10B981',
    initial: 'KE',
    logoUrl: "/research-logos/kelpdao-exploit-composability-fragility-test-for-layerzero-aave-lrts-and.svg",
  },
  {
    name: 'Onyx',
    description: 'Onyx positions itself as a modular financial-grade Layer 3 (L3) evolving into...',
    type: 'L1',
    slug: 'onyx-modular-financial-l3-architecture-promise-vs',
    color: '#EF4444',
    initial: 'ONYX',
    logoUrl: "/research-logos/onyx-modular-financial-l3-architecture-promise-vs.png",
  },
  {
    name: 'Surf Research Memo',
    description: 'Surf is a well-executed crypto research copilot that compresses fragmented wo...',
    type: 'DeFi',
    slug: 'surf-research-memo-crypto-native-copilot-or-prompt-wrapper',
    color: '#EF4444',
    initial: 'SR',
    logoUrl: "/research-logos/surf-research-memo-crypto-native-copilot-or-prompt-wrapper.png",
  },
  {
    name: 'Re Protocol',
    description: 'Onchain access to regulated reinsurance yield via reUSD and reUSDe',
    type: 'RWA',
    slug: 're-protocol-reusd-insurance-yield',
    color: '#8FA3BF',
    initial: 'RE',
    logoUrl: "/research-logos/re-protocol-reusd-insurance-yield.png",
  },
  {
    name: 'Billions Network',
    description: 'Billions Network positions itself as a mobile-first, privacy-preserving verif...',
    type: 'ZK',
    slug: 'billions-network-institutional-grade-identity-and-trust-infrastructure-analysis',
    color: '#0284C7',
    initial: 'BN',
    logoUrl: "/research-logos/billions-network-institutional-grade-identity-and-trust-infrastructure-analysis.png",
  },
  {
    name: 'BRLA is PIX Shadow Play',
    description: 'Avenia, formerly BRLA Digital, positions itself as a compliant Brazilian Real...',
    type: 'Stablecoin',
    slug: 'brla-is-pix-shadow-play-brazil-s-stealth-stablecoin-challenger',
    color: '#6366F1',
    initial: 'BI',
    logoUrl: "/research-logos/brla-is-pix-shadow-play-brazil-s-stealth-stablecoin-challenger.svg",
  },
  {
    name: 'Citrea Investment Memo',
    description: 'Citrea represents one of the most credible attempts to expand Bitcoin from a ...',
    type: 'Lending',
    slug: 'citrea-vc-grade-investment-memo',
    color: '#2563EB',
    initial: 'CI',
    logoUrl: "/research-logos/citrea-vc-grade-investment-memo.png",
  },
  {
    name: 'KAIO',
    description: 'KAIO positions itself as a compliant middleware layer for institutional token...',
    type: 'RWA',
    slug: 'kaio-the-shadow-banker-of-tokenized-finance-plumbing-tradfi-into',
    color: '#DC2626',
    initial: 'KAIO',
    logoUrl: "/research-logos/kaio-the-shadow-banker-of-tokenized-finance-plumbing-tradfi-into.jpg",
  },
  {
    name: 'Liquid Trading',
    description: 'Liquid Trading is a polished mobile-first aggregator delivering non-custodial...',
    type: 'Prediction',
    slug: 'liquid-trading-the-all-in-one-mobile-superapp-for-crypto',
    color: '#2563EB',
    initial: 'LT',
    logoUrl: "/research-logos/liquid-trading-the-all-in-one-mobile-superapp-for-crypto.png",
  },
  {
    name: 'SkyAI',
    description:
      'MCP-based onchain data and agent tooling project where token value capture still needs proof',
    type: 'AI',
    slug: 'skyai-skyai-mcp-onchain-data-agent-infrastructure-value-capture-gap',
    color: '#2563EB',
    initial: 'SKYAI',
    logoUrl: "/research-logos/skyai-skyai-mcp-onchain-data-agent-infrastructure-value-capture-gap.png",
  },
  {
    name: 'Falcon USD',
    description:
      'Overcollateralized synthetic dollar where reserve transparency and strategy liquidity must prove durability',
    type: 'Stablecoin',
    slug: 'falcon-usd-usdf-overcollateralized-synthetic-dollar-reserve-strategy-risk',
    color: '#F97316',
    initial: 'USDf',
    logoUrl: "/research-logos/falcon-usd-usdf-overcollateralized-synthetic-dollar-reserve-strategy-risk.png",
  },
  {
    name: 'Falcon Finance FF',
    description:
      'Universal collateral and synthetic-dollar infrastructure token where sFF staking, governance, and unlock discipline must prove value capture',
    type: 'DeFi/Stablecoin',
    slug: 'falcon-finance-ff-universal-collateral-token-value-capture-risk',
    color: '#111827',
    initial: 'FF',
    logoUrl: "/research-logos/falcon-finance-ff-universal-collateral-token-value-capture-risk.png",
  },
  {
    name: 'GHO',
    description:
      'Aave-native overcollateralized stablecoin where sGHO savings and DAO revenue must prove sustainable growth',
    type: 'Stablecoin',
    slug: 'gho-aave-native-stablecoin-sgho-yield-dao-revenue-risk',
    color: '#B6509E',
    initial: 'GHO',
    logoUrl: "/research-logos/gho-aave-native-stablecoin-sgho-yield-dao-revenue-risk.png",
  },
  {
    name: 'crvUSD',
    description:
      'Curve-native overcollateralized stablecoin where LLAMMA liquidations, LlamaLend borrow demand, and peg liquidity must stay transparent',
    type: 'Stablecoin',
    slug: 'crvusd-curve-native-stablecoin-llamma-liquidation-peg-risk',
    color: '#3465A4',
    initial: 'crvUSD',
    logoUrl: "/research-logos/crvusd-curve-native-stablecoin-llamma-liquidation-peg-risk.svg",
  },
  {
    name: 'Legacy Frax Dollar',
    description:
      'Legacy FRAX stablecoin where frxUSD migration, Fraxtal money-stack value capture, and shallow liquidity drive the risk model',
    type: 'Stablecoin',
    slug: 'legacy-frax-dollar-frax-frxusd-migration-money-stack-risk',
    color: '#111111',
    initial: 'FRAX',
    logoUrl: "/research-logos/legacy-frax-dollar-frax-frxusd-migration-money-stack-risk.png",
  },
  {
    name: 'Bitcoin SV',
    description:
      'Big-block PoW payments and data chain where Teranode throughput must turn into fee-paying demand',
    type: 'PoW/Payments',
    slug: 'bitcoin-sv-bsv-big-block-payments-data-chain-security-fee-risk',
    color: '#EAB308',
    initial: 'BSV',
    logoUrl: "/research-logos/bitcoin-sv-bsv-big-block-payments-data-chain-security-fee-risk.png",
  },
  {
    name: 'Decred',
    description:
      'Hybrid PoW/PoS governance chain where treasury sovereignty and ticket voting must translate into renewed demand',
    type: 'Governance/L1',
    slug: 'decred-dcr-hybrid-pow-pos-governance-treasury-value-capture',
    color: '#2970FF',
    initial: 'DCR',
    logoUrl: "/research-logos/decred-dcr-hybrid-pow-pos-governance-treasury-value-capture.png",
  },
  {
    name: 'IOTA',
    description:
      'Rebased Move L1 and IOTA EVM where modern tokenomics must translate into real app demand',
    type: 'Move/L1',
    slug: 'iota-iota-rebased-move-l1-tokenomics-app-demand-gap',
    color: '#111827',
    initial: 'IOTA',
    logoUrl: "/research-logos/iota-iota-rebased-move-l1-tokenomics-app-demand-gap.png",
  },
  {
    name: 'Axie Infinity',
    description:
      'GameFi benchmark where Ronin activity, player retention, and AXS governance must prove real value capture',
    type: 'Gaming',
    slug: 'axie-infinity-axs-ronin-game-economy-token-value-capture-gap',
    color: '#0055D5',
    initial: 'AXS',
    logoUrl: "/research-logos/axie-infinity-axs-ronin-game-economy-token-value-capture-gap.png",
  },
  {
    name: 'The Sandbox',
    description:
      'Metaverse and UGC gaming token where LAND demand, creator activity, and marketplace spend must revive SAND value capture',
    type: 'Gaming/Metaverse',
    slug: 'the-sandbox-sand-metaverse-ugc-gaming-token-value-capture-gap',
    color: '#00ADEF',
    initial: 'SAND',
    logoUrl: "/research-logos/the-sandbox-sand-metaverse-ugc-gaming-token-value-capture-gap.jpg",
  },
  {
    name: 'Decentraland',
    description:
      'Virtual world and LAND economy where active users, creators, DAO discipline, and marketplace spend must revive MANA demand',
    type: 'Gaming/Metaverse',
    slug: 'decentraland-mana-virtual-world-land-dao-value-capture-gap',
    color: '#FF2D55',
    initial: 'MANA',
    logoUrl: "/research-logos/decentraland-mana-virtual-world-land-dao-value-capture-gap.png",
  },
  {
    name: 'Theta Network',
    description:
      'DePIN video and EdgeCloud AI network where TFUEL usage and THETA staking must prove value capture',
    type: 'DePIN/AI',
    slug: 'theta-network-theta-edgecloud-depin-ai-video-value-capture-gap',
    color: '#29B6AF',
    initial: 'THETA',
    logoUrl: "/research-logos/theta-network-theta-edgecloud-depin-ai-video-value-capture-gap.png",
  },
  {
    name: 'Trust Wallet Token',
    description:
      'Wallet utility token where Trust Wallet distribution must become concrete holder benefits and fee capture',
    type: 'Wallet',
    slug: 'trust-wallet-token-twt-wallet-distribution-utility-value-capture-gap',
    color: '#3375BB',
    initial: 'TWT',
    logoUrl: "/research-logos/trust-wallet-token-twt-wallet-distribution-utility-value-capture-gap.png",
  },
  {
    name: 'THORChain',
    description:
      'Native cross-chain DEX where RUNE liquidity, node bonds, and swap volume must outweigh security risk',
    type: 'Cross-chain DEX',
    slug: 'thorchain-rune-native-cross-chain-dex-liquidity-security-value-capture',
    color: '#00CCB8',
    initial: 'RUNE',
    logoUrl: "/research-logos/thorchain-rune-native-cross-chain-dex-liquidity-security-value-capture.png",
  },
  {
    name: 'Basic Attention Token',
    description:
      'Brave Ads and browser distribution token where attention demand must translate into durable BAT utility',
    type: 'Consumer/Ads',
    slug: 'basic-attention-token-bat-brave-ads-attention-economy-value-capture-gap',
    color: '#FF5000',
    initial: 'BAT',
    logoUrl: "/research-logos/basic-attention-token-bat-brave-ads-attention-economy-value-capture-gap.png",
  },
  {
    name: 'Olympus',
    description:
      'Treasury-backed flatcoin and DeFi monetary stack where Cooler Loans, YRF buybacks, and backing premium drive the thesis',
    type: 'DeFi/Reserve',
    slug: 'olympus-ohm-treasury-backed-flatcoin-cooler-loans-value-capture',
    color: '#111827',
    initial: 'OHM',
    logoUrl: "/research-logos/olympus-ohm-treasury-backed-flatcoin-cooler-loans-value-capture.png",
  },
  {
    name: 'Usual USD',
    description:
      'RWA-backed stablecoin where bUSD0 bond liquidity, USUAL emissions, and redemption paths drive the risk model',
    type: 'Stablecoin',
    slug: 'usual-usd-usd0-rwa-backed-stablecoin-busd0-liquidity-risk',
    color: '#111827',
    initial: 'USD0',
    logoUrl: "/research-logos/usual-usd-usd0-rwa-backed-stablecoin-busd0-liquidity-risk.png",
  },
  {
    name: 'PayPal USD',
    description: 'Regulated PayFi stablecoin distributed through PayPal, Venmo, and onchain rails',
    type: 'Stablecoin',
    slug: 'paypal-usd-pyusd-payfi-stablecoin',
    color: '#003087',
    initial: 'PY',
    logoUrl: "/research-logos/paypal-usd-pyusd-payfi-stablecoin.png",
  },
  {
    name: 'Gemini Dollar',
    description:
      'Regulated fiat-backed stablecoin where Gemini issuer trust must offset thin liquidity and limited adoption',
    type: 'Stablecoin',
    slug: 'gemini-dollar-gusd-regulated-stablecoin-redemption-liquidity-risk',
    color: '#00DCFA',
    initial: 'GUSD',
    logoUrl: "/research-logos/gemini-dollar-gusd-regulated-stablecoin-redemption-liquidity-risk.png",
  },
  {
    name: 'Hastra PRIME',
    description:
      'RWA credit wrapper linking Figure HELOC yield with Solana and Ethereum DeFi liquidity',
    type: 'RWA/Credit',
    slug: 'hastra-prime-rwa-lst-figure-heloc-yield-liquidity-risk',
    color: '#2563EB',
    initial: 'PRIME',
    logoUrl: "/research-logos/hastra-prime-rwa-lst-figure-heloc-yield-liquidity-risk.png",
  },
  {
    name: 'Chiliz',
    description:
      'Sports Fan Token and Socios ecosystem where CHZ value capture depends on turning IP distribution into durable chain usage',
    type: 'Consumer/Sports',
    slug: 'chiliz-chz-sports-fan-token-chain-socios-value-capture-gap',
    color: '#CD0124',
    initial: 'CHZ',
    logoUrl: "/research-logos/chiliz-chz-sports-fan-token-chain-socios-value-capture-gap.png",
  },
  {
    name: 'The Graph',
    description:
      'Decentralized indexing and query network where GRT value capture depends on paid data demand and query-fee growth',
    type: 'Data/Infra',
    slug: 'the-graph-grt-indexing-query-fee-value-capture-gap',
    color: '#6747ED',
    initial: 'GRT',
    logoUrl: "/research-logos/the-graph-grt-indexing-query-fee-value-capture-gap.png",
  },
  {
    name: 'EigenCloud',
    description:
      'Restaking and verifiable-cloud network where EIGEN value capture depends on AVS fees, staking demand, and cloud primitives',
    type: 'Restaking/Cloud',
    slug: 'eigencloud-eigen-restaking-avs-cloud-value-capture-gap',
    color: '#1B1B1F',
    initial: 'EIGEN',
    logoUrl: "/research-logos/eigencloud-eigen-restaking-avs-cloud-value-capture-gap.jpg",
  },
  {
    name: 'Monad',
    description:
      'Parallel EVM L1 where MON value capture depends on turning mainnet performance into durable apps, fees, and liquidity',
    type: 'L1',
    slug: 'monad-mon-parallel-evm-mainnet-app-demand-value-capture-gap',
    color: '#7C3AED',
    initial: 'MON',
    logoUrl: "/research-logos/monad-mon-parallel-evm-mainnet-app-demand-value-capture-gap.png",
  },
  {
    name: 'Telcoin',
    description:
      'Telecom-payments and Digital Cash banking stack where TEL value capture depends on network, eUSD, TELx, and wallet usage',
    type: 'PayFi',
    slug: 'telcoin-tel-telecom-payments-digital-cash-bank-value-capture',
    color: '#00B4D8',
    initial: 'TEL',
    logoUrl: "/research-logos/telcoin-tel-telecom-payments-digital-cash-bank-value-capture.png",
  },
  {
    name: 'First Digital USD',
    description:
      'Exchange-distributed fiat-backed stablecoin where Binance liquidity, reserve transparency, and confidence risk drive the thesis',
    type: 'Stablecoin',
    slug: 'first-digital-usd-fdusd-exchange-stablecoin-liquidity-risk',
    color: '#111827',
    initial: 'FD',
    logoUrl: "/research-logos/first-digital-usd-fdusd-exchange-stablecoin-liquidity-risk.png",
  },
  {
    name: 'TrueUSD',
    description:
      'Legacy fiat-backed stablecoin where daily attestations, Binance support, and depeg history define the confidence discount',
    type: 'Stablecoin',
    slug: 'trueusd-tusd-attestation-binance-liquidity-risk',
    color: '#1A5AFF',
    initial: 'TUSD',
    logoUrl: "/research-logos/trueusd-tusd-attestation-binance-liquidity-risk.png",
  },
  {
    name: 'JasmyCoin',
    description:
      'Japan IoT and data-sovereignty network where PDL adoption must prove JASMY token value capture',
    type: 'IoT/Data',
    slug: 'jasmycoin-jasmy-iot-data-sovereignty-token-value-capture-gap',
    color: '#F97316',
    initial: 'JASMY',
    logoUrl: "/research-logos/jasmycoin-jasmy-iot-data-sovereignty-token-value-capture-gap.jpg",
  },
  {
    name: 'Royal Dollar',
    description:
      'USD-referenced stable-value token where reserve claims are outweighed by current depeg and redemption-risk signals',
    type: 'Stablecoin',
    slug: 'royal-dollar-rusd-stablecoin-redemption-depeg-risk',
    color: '#0F766E',
    initial: 'RUSD',
    logoUrl: "/research-logos/royal-dollar-rusd-stablecoin-redemption-depeg-risk.png",
  },
  {
    name: 'Lido DAO',
    description:
      'Ethereum liquid staking leader where stETH network effects and LDO value capture remain the underwriting test',
    type: 'Liquid Staking',
    slug: 'lido-dao-ldo-liquid-staking-steth-governance-value-capture',
    color: '#00A3FF',
    initial: 'LDO',
    logoUrl: "/research-logos/lido-dao-ldo-liquid-staking-steth-governance-value-capture.png",
  },
  {
    name: 'Jito',
    description:
      'Solana MEV, liquid staking, and restaking infrastructure where JTO governance value capture remains the key underwriting question',
    type: 'Liquid Staking',
    slug: 'jito-jto-solana-mev-liquid-staking-restaking-token-value-capture-gap',
    color: '#7C3AED',
    initial: 'JTO',
    logoUrl: "/research-logos/jito-jto-solana-mev-liquid-staking-restaking-token-value-capture-gap.png",
  },
  {
    name: 'Gnosis',
    description:
      'Ethereum-aligned payments and Gnosis Chain ecosystem where GNO staking and governance value capture remains indirect',
    type: 'EVM Chain',
    slug: 'gnosis-gno-gnosis-chain-payments-safe-cow-token-value-capture-gap',
    color: '#047857',
    initial: 'GNO',
    logoUrl: "/research-logos/gnosis-gno-gnosis-chain-payments-safe-cow-token-value-capture-gap.png",
  },
  {
    name: 'Tezos',
    description:
      'Self-amending L1 with Smart Rollups and Etherlink where XTZ still needs renewed app demand',
    type: 'L1',
    slug: 'tezos-xtz-self-amending-l1-smart-rollups-etherlink-app-demand-gap',
    color: '#2C7DF7',
    initial: 'XTZ',
    logoUrl: "/research-logos/tezos-xtz-self-amending-l1-smart-rollups-etherlink-app-demand-gap.png",
  },
  {
    name: 'Conflux',
    description:
      'Tree-Graph L1 with Core Space, eSpace, and China/HK narrative where CFX still needs app-demand proof',
    type: 'L1',
    slug: 'conflux-cfx-tree-graph-l1-espace-china-narrative-app-demand-gap',
    color: '#111827',
    initial: 'CFX',
    logoUrl: "/research-logos/conflux-cfx-tree-graph-l1-espace-china-narrative-app-demand-gap.png",
  },
  {
    name: 'Unibase',
    description:
      'AI memory and agent interoperability stack where UB value capture still needs usage proof',
    type: 'AI',
    slug: 'unibase-ub-ai-memory-agent-interoperability-token-value-capture-gap',
    color: '#2D3869',
    initial: 'UB',
    logoUrl: "/research-logos/unibase-ub-ai-memory-agent-interoperability-token-value-capture-gap.png",
  },
  {
    name: 'Stacks',
    description:
      'Bitcoin smart-contract layer where sBTC capital import still needs to convert into durable app demand and STX value capture',
    type: 'Bitcoin L2',
    slug: 'stacks-stx-bitcoin-l2-sbtc-pox-app-demand-value-capture-gap',
    color: '#5546FF',
    initial: 'STX',
    logoUrl: "/research-logos/stacks-stx-bitcoin-l2-sbtc-pox-app-demand-value-capture-gap.png",
  },
  {
    name: 'Pyth Network',
    description:
      'First-party pull oracle and data infrastructure network where protocol distribution still needs clearer PYTH value capture',
    type: 'Oracle',
    slug: 'pyth-network-pyth-pull-oracle-data-infrastructure-token-value-capture-gap',
    color: '#E879F9',
    initial: 'PYTH',
    logoUrl: "/research-logos/pyth-network-pyth-pull-oracle-data-infrastructure-token-value-capture-gap.png",
  },
  {
    name: 'apxUSD',
    description:
      'Preferred-share backed dollar asset where redemption value and market liquidity create nonstandard stablecoin risk',
    type: 'Stablecoin',
    slug: 'apxusd-apxusd-preferred-share-backed-stablecoin-redemption-risk',
    color: '#38BDF8',
    initial: 'APXUSD',
    logoUrl: "/research-logos/apxusd-apxusd-preferred-share-backed-stablecoin-redemption-risk.png",
  },
  {
    name: 'Terra Luna Classic',
    description:
      'Community-maintained distressed L1 where LUNC burn and staking narratives face massive supply overhang',
    type: 'L1',
    slug: 'terra-luna-classic-lunc-burn-staking-community-chain-recovery-risk',
    color: '#1D4ED8',
    initial: 'LUNC',
    logoUrl: "/research-logos/terra-luna-classic-lunc-burn-staking-community-chain-recovery-risk.png",
  },
  {
    name: 'SPX6900',
    description:
      'Finance-parody meme index token with strong attention liquidity but no direct value capture',
    type: 'Meme',
    slug: 'spx6900-spx-meme-index-attention-liquidity-value-capture-gap',
    color: '#F472B6',
    initial: 'SPX',
    logoUrl: "/research-logos/spx6900-spx-meme-index-attention-liquidity-value-capture-gap.png",
  },
  {
    name: 'BUILDon',
    description:
      'BNB Chain USD1 meme and liquidity narrative where B value depends on attention, pair depth, and launchpad execution',
    type: 'Meme/PayFi',
    slug: 'buildon-b-bnb-chain-usd1-meme-liquidity-narrative-risk',
    color: '#F5B800',
    initial: 'B',
    logoUrl: "/research-logos/buildon-b-bnb-chain-usd1-meme-liquidity-narrative-risk.jpg",
  },
  {
    name: 'Velvet',
    description:
      'AI-powered onchain trading terminal where VELVET value capture depends on fees, staking, cashback, and trader retention',
    type: 'AI/Trading',
    slug: 'velvet-velvet-ai-onchain-trading-terminal-token-value-capture-risk',
    color: '#7C3AED',
    initial: 'VELVET',
    logoUrl: "/research-logos/velvet-velvet-ai-onchain-trading-terminal-token-value-capture-risk.jpg",
  },
  {
    name: 'Official Trump',
    description: 'Trump-affiliated Solana PolitiFi meme token with strong liquidity and major unlock risk',
    type: 'Meme',
    slug: 'official-trump-trump-politifi-meme-liquidity-unlock-risk',
    color: '#DC2626',
    initial: 'TRUMP',
    logoUrl: "/research-logos/official-trump-trump-politifi-meme-liquidity-unlock-risk.png",
  },
  {
    name: 'Pudgy Penguins',
    description: 'Consumer IP and NFT-native meme token testing PENGU value capture beyond brand distribution',
    type: 'Meme',
    slug: 'pudgy-penguins-pengu-consumer-ip-meme-token-value-capture-gap',
    color: '#60A5FA',
    initial: 'PENGU',
    logoUrl: "/research-logos/pudgy-penguins-pengu-consumer-ip-meme-token-value-capture-gap.png",
  },
  {
    name: 'AINFT',
    description:
      'TRON NFT marketplace and AI agent infrastructure pivot where token value capture still needs proof',
    type: 'NFT/AI',
    slug: 'ainft-nft-tron-marketplace-ai-agent-token-value-capture-gap',
    color: '#111827',
    initial: 'NFT',
    logoUrl: "/research-logos/ainft-nft-tron-marketplace-ai-agent-token-value-capture-gap.png",
  },
  {
    name: 'Bonk',
    description:
      'Solana-native meme blue chip with broad ecosystem distribution but weak direct value capture',
    type: 'Meme',
    slug: 'bonk-bonk-solana-meme-liquidity-ecosystem-value-capture-gap',
    color: '#F97316',
    initial: 'BONK',
    logoUrl: "/research-logos/bonk-bonk-solana-meme-liquidity-ecosystem-value-capture-gap.jpg",
  },
  {
    name: 'Stable',
    description: 'USDT0-native payments L1 for PayFi, gasless transfers, and agentic settlement',
    type: 'PayFi',
    slug: 'stable-stable-usdt-native-payments-l1-token-value-capture-gap',
    color: '#14B8A6',
    initial: 'STABLE',
    logoUrl: "/research-logos/stable-stable-usdt-native-payments-l1-token-value-capture-gap.png",
  },
  {
    name: 'Solstice USX',
    description: 'Solana-native overcollateralized settlement stablecoin and eUSX yield layer with proof-of-solvency verification',
    type: 'Stablecoin',
    slug: 'solstice-usx-solana-yield-stablecoin-liquidity-proof-of-solvency',
    color: '#EB6237',
    initial: 'USX',
    logoUrl: "/research-logos/solstice-usx-solana-yield-stablecoin-liquidity-proof-of-solvency.png",
  },
  {
    name: 'Kite AI',
    description: 'Agentic payments L1 and Agent Passport infrastructure for autonomous AI service settlement',
    type: 'AI',
    slug: 'kite-ai-kite-agentic-payments-l1-token-value-capture',
    color: '#485C11',
    initial: 'KITE',
    logoUrl: "/research-logos/kite-ai-kite-agentic-payments-l1-token-value-capture.png",
  },
  {
    name: 'Virtuals Protocol',
    description:
      'AI-agent economy stack and launchpad testing VIRTUAL demand from agent liquidity and commerce',
    type: 'AI',
    slug: 'virtuals-protocol-virtual-agent-economy-launchpad-value-capture-test',
    color: '#22C55E',
    initial: 'VIRTUAL',
    logoUrl: "/research-logos/virtuals-protocol-virtual-agent-economy-launchpad-value-capture-test.png",
  },
  {
    name: 'Audiera',
    description: 'Agent-native GameFi and AI music participation economy testing BEAT token value capture',
    type: 'GameFi',
    slug: 'audiera-beat-agent-native-gamefi-ai-music-token-value-capture-gap',
    color: '#346DDB',
    initial: 'BEAT',
    logoUrl: "/research-logos/audiera-beat-agent-native-gamefi-ai-music-token-value-capture-gap.png",
  },
  {
    name: 'A7A5',
    description: 'Rouble-backed yield stablecoin with rebasing mechanics and heavy compliance risk',
    type: 'Stablecoin',
    slug: 'a7a5-ruble-backed-yield-stablecoin-compliance-risk',
    color: '#346DDB',
    initial: 'A7',
    logoUrl: "/research-logos/a7a5-ruble-backed-yield-stablecoin-compliance-risk.png",
  },
  {
    name: 'PancakeSwap',
    description: 'BNB Chain liquidity hub and multichain DEX testing CAKE burn-based value capture',
    type: 'DEX',
    slug: 'pancakeswap-cake-bnb-chain-dex-tokenomics-burn-value-capture',
    color: '#1FC7D4',
    initial: 'CAKE',
    logoUrl: "/research-logos/pancakeswap-cake-bnb-chain-dex-tokenomics-burn-value-capture.svg",
  },
  {
    name: 'Curve DAO',
    description: 'Stable-swap DeFi infrastructure testing CRV fee capture, veTokenomics, and crvUSD growth',
    type: 'DEX',
    slug: 'curve-dao-crv-stable-swap-ve-tokenomics-crvusd-value-capture-gap',
    color: '#111827',
    initial: 'CRV',
    logoUrl: "/research-logos/curve-dao-crv-stable-swap-ve-tokenomics-crvusd-value-capture-gap.png",
  },
  {
    name: 'Pendle',
    description:
      'Yield tokenization and fixed-rate DeFi market where sPENDLE value capture depends on durable fees and buybacks',
    type: 'Yield/DeFi',
    slug: 'pendle-pendle-yield-tokenization-spendle-fee-value-capture',
    color: '#14B8A6',
    initial: 'PENDLE',
    logoUrl: "/research-logos/pendle-pendle-yield-tokenization-spendle-fee-value-capture.png",
  },
  {
    name: 'Sun Token',
    description: 'TRON DEX and SUN.io governance token testing SUNSwap fee routing, burns, and liquidity value capture',
    type: 'DEX',
    slug: 'sun-token-sun-tron-dex-sunswap-governance-value-capture-gap',
    color: '#F97316',
    initial: 'SUN',
    logoUrl: "/research-logos/sun-token-sun-tron-dex-sunswap-governance-value-capture-gap.png",
  },
  {
    name: 'LAB',
    description: 'Trading terminal and airdrop-driven execution ecosystem with a large valuation-liquidity gap',
    type: 'Trading',
    slug: 'lab-lab-trading-terminal-airdrop-valuation-liquidity-gap',
    color: '#22C55E',
    initial: 'LAB',
    logoUrl: "/research-logos/lab-lab-trading-terminal-airdrop-valuation-liquidity-gap.png",
  },
  {
    name: 'Sei',
    description: 'Parallelized EVM L1 testing whether trading and RWA activity can create SEI value capture',
    type: 'L1',
    slug: 'sei-sei-parallelized-evm-trading-l1-value-capture-gap',
    color: '#C1121F',
    initial: 'SEI',
    logoUrl: "/research-logos/sei-sei-parallelized-evm-trading-l1-value-capture-gap.svg",
  },
  {
    name: 'Artificial Superintelligence Alliance',
    description: 'Decentralized AI agent and compute stack testing FET value capture from ASI products',
    type: 'AI',
    slug: 'artificial-superintelligence-alliance-fet-decentralized-ai-agent-stack-token-capture-gap',
    color: '#0F172A',
    initial: 'FET',
    logoUrl: "/research-logos/artificial-superintelligence-alliance-fet-decentralized-ai-agent-stack-token-capture-gap.svg",
  },
  {
    name: 'JUST',
    description: 'TRON DeFi governance and JustLend buyback token with a fee-density test',
    type: 'DeFi',
    slug: 'just-jst-tron-defi-governance-buyback-value-capture-gap',
    color: '#EF4444',
    initial: 'JST',
    logoUrl: "/research-logos/just-jst-tron-defi-governance-buyback-value-capture-gap.svg",
  },
  {
    name: 'VeChain',
    description: 'Enterprise and sustainability L1 with VET/VTHO tokenomics and public usage gap',
    type: 'RWA',
    slug: 'vechain-vet-enterprise-supply-chain-l1-vtho-value-capture-gap',
    color: '#15BDFF',
    initial: 'VET',
    logoUrl: "/research-logos/vechain-vet-enterprise-supply-chain-l1-vtho-value-capture-gap.png",
  },
  {
    name: 'Stellar',
    description: 'Payments and RWA settlement network with Soroban and XLM value-capture gap',
    type: 'Payments',
    slug: 'stellar-xlm-payments-rwa-soroban-value-capture-gap',
    color: '#111827',
    initial: 'XLM',
    logoUrl: "/research-logos/stellar-xlm-payments-rwa-soroban-value-capture-gap.jpg",
  },
  {
    name: 'Janus Henderson Anemoy JTRSY',
    description: 'Tokenized Treasury fund on Centrifuge with institutional ratings and liquidity gap',
    type: 'RWA',
    slug: 'janus-henderson-anemoy-jtrsy-tokenized-treasury-fund-rwa-liquidity-gap',
    color: '#0F766E',
    initial: 'JT',
    logoUrl: "/research-logos/janus-henderson-anemoy-jtrsy-tokenized-treasury-fund-rwa-liquidity-gap.svg",
  },
  {
    name: 'Janus Henderson Anemoy JAAA',
    description: 'Tokenized AAA CLO fund on Centrifuge with deRWA collateral and credit risk',
    type: 'RWA',
    slug: 'janus-henderson-anemoy-jaaa-aaa-clo-fund-rwa-credit-liquidity-gap',
    color: '#4338CA',
    initial: 'JA',
    logoUrl: "/research-logos/janus-henderson-anemoy-jaaa-aaa-clo-fund-rwa-credit-liquidity-gap.svg",
  },
  {
    name: 'Provenance Blockchain',
    description: 'RWA financial-services L1 with HASH token value-capture gap',
    type: 'RWA',
    slug: 'provenance-blockchain-hash-rwa-financial-services-l1-value-capture-gap',
    color: '#2563EB',
    initial: 'HASH',
    logoUrl: "/research-logos/provenance-blockchain-hash-rwa-financial-services-l1-value-capture-gap.png",
  },
  {
    name: 'EURC',
    description: 'Circle MiCA-compliant euro stablecoin with multi-chain FX liquidity gap',
    type: 'Stablecoin',
    slug: 'eurc-circle-mica-euro-stablecoin-liquidity-gap',
    color: '#2563EB',
    initial: 'EURC',
    logoUrl: "/research-logos/eurc-circle-mica-euro-stablecoin-liquidity-gap.png",
  },
  {
    name: 'Variational',
    description: 'Variational is a peer-to-peer RFQ-based derivatives protocol on Arbitrum, ena...',
    type: 'DeFi',
    slug: 'variational-redefining-on-chain-derivatives-through-isolated-escrow-and-liquidity',
    color: '#0EA5E9',
    initial: 'VARI',
    logoUrl: "/research-logos/variational-redefining-on-chain-derivatives-through-isolated-escrow-and-liquidity.svg",
  },
  {
    name: 'Tether Gold',
    description: 'Tokenized Swiss-vaulted gold and crypto-native RWA collateral from Tether',
    type: 'RWA',
    slug: 'tether-gold-xaut-tokenized-gold-rwa',
    color: '#C8A24A',
    initial: 'XAU',
    logoUrl: "/research-logos/tether-gold-xaut-tokenized-gold-rwa.png",
  },
  {
    name: 'PAX Gold',
    description: 'Regulated Paxos-issued tokenized gold with monthly reserve transparency',
    type: 'RWA',
    slug: 'pax-gold-paxg-regulated-tokenized-gold',
    color: '#D4AF37',
    initial: 'PAXG',
    logoUrl: "/research-logos/pax-gold-paxg-regulated-tokenized-gold.png",
  },
  {
    name: 'Kinesis Gold',
    description:
      'Allocated gold-backed digital asset where redemption, custody, platform liquidity, and fee-sharing yield drive the risk model',
    type: 'RWA',
    slug: 'kinesis-gold-kau-allocated-gold-token-redemption-liquidity-risk',
    color: '#D4AF37',
    initial: 'KAU',
    logoUrl: "/research-logos/kinesis-gold-kau-allocated-gold-token-redemption-liquidity-risk.png",
  },
  {
    name: 'Kinesis Silver',
    description:
      'Tokenized silver RWA with redemption rails where platform concentration and liquidity depth remain the core risks',
    type: 'RWA',
    slug: 'kinesis-silver-kag-silver-rwa-redemption-liquidity-risk',
    color: '#94A3B8',
    initial: 'KAG',
    logoUrl: "/research-logos/kinesis-silver-kag-silver-rwa-redemption-liquidity-risk.png",
  },
  {
    name: 'USDD',
    description: 'TRON-linked over-collateralized stablecoin with PSM, vaults, and sUSDD yield',
    type: 'Stablecoin',
    slug: 'usdd-crypto-backed-stablecoin-tron-reserve',
    color: '#2563EB',
    initial: 'USDD',
    logoUrl: "/research-logos/usdd-crypto-backed-stablecoin-tron-reserve.png",
  },
  {
    name: 'Ripple USD',
    description: 'NYDFS-regulated enterprise stablecoin for Ripple payments, XRPL, and Ethereum rails',
    type: 'Stablecoin',
    slug: 'ripple-usd-rlusd-enterprise-stablecoin',
    color: '#111827',
    initial: 'RL',
    logoUrl: "/research-logos/ripple-usd-rlusd-enterprise-stablecoin.png",
  },
  {
    name: 'Ondo USDY',
    description: 'Yield-bearing tokenized Treasury dollar for non-US onchain cash management',
    type: 'Yield',
    slug: 'ondo-us-dollar-yield-usdy-tokenized-treasury-note',
    color: '#2563EB',
    initial: 'USDY',
    logoUrl: "/research-logos/ondo-us-dollar-yield-usdy-tokenized-treasury-note.png",
  },
  {
    name: 'Bitget Token',
    description: 'Bitget exchange token evolving into Morph gas, governance, and payment utility',
    type: 'CEX',
    slug: 'bitget-token-bgb-morph-exchange-utility-token',
    color: '#0EA5E9',
    initial: 'BGB',
    logoUrl: "/research-logos/bitget-token-bgb-morph-exchange-utility-token.png",
  },
  {
    name: 'Sky USDS',
    description: 'Sky Protocol stablecoin and sUSDS savings-rate stack after the DAI migration',
    type: 'Stablecoin',
    slug: 'sky-usds-susds-defi-native-stablecoin-yield',
    color: '#6366F1',
    initial: 'USDS',
    logoUrl: "/research-logos/sky-usds-susds-defi-native-stablecoin-yield.jpg",
  },
  {
    name: 'Circle USYC',
    description: 'Circle tokenized money market fund for institutional yield and collateral',
    type: 'Yield',
    slug: 'circle-usyc-tokenized-money-market-fund-collateral',
    color: '#2563EB',
    initial: 'USYC',
    logoUrl: "/research-logos/circle-usyc-tokenized-money-market-fund-collateral.png",
  },
  {
    name: 'BlackRock BUIDL',
    description: 'BlackRock tokenized Treasury fund and institutional RWA collateral benchmark',
    type: 'RWA',
    slug: 'blackrock-buidl-tokenized-treasury-fund-institutional-rwa',
    color: '#111827',
    initial: 'BUIDL',
    logoUrl: "/research-logos/blackrock-buidl-tokenized-treasury-fund-institutional-rwa.svg",
  },
  {
    name: 'WhiteBIT Coin',
    description: 'WhiteBIT exchange token and Whitechain gas asset with supply transparency risk',
    type: 'CEX',
    slug: 'whitebit-coin-wbt-exchange-utility-token-supply-premium',
    color: '#EF4444',
    initial: 'WBT',
    logoUrl: "/research-logos/whitebit-coin-wbt-exchange-utility-token-supply-premium.png",
  },
  {
    name: 'KuCoin Token',
    description: 'KuCoin exchange utility token with KCC gas optionality and trust rebuild risk',
    type: 'CEX',
    slug: 'kucoin-token-kcs-exchange-utility-kcc-trust-rebuild',
    color: '#0EA5E9',
    initial: 'KCS',
    logoUrl: "/research-logos/kucoin-token-kcs-exchange-utility-kcc-trust-rebuild.png",
  },
  {
    name: 'BNB',
    description: 'Exchange-linked L1 gas and staking asset with Binance distribution, burn mechanics, and validator centralization risk',
    type: 'L1',
    slug: 'bnb-bnb-chain-exchange-utility-token-burn-validator-centralization-risk',
    color: '#F0B90B',
    initial: 'BNB',
    logoUrl: "/research-logos/bnb-bnb-chain-exchange-utility-token-burn-validator-centralization-risk.svg",
  },
  {
    name: 'Ethereum Classic',
    description: 'Legacy proof-of-work Ethereum chain with fixed supply and weak app-layer demand',
    type: 'L1',
    slug: 'ethereum-classic-etc-pow-immutability-app-layer-gap',
    color: '#328332',
    initial: 'ETC',
    logoUrl: "/research-logos/ethereum-classic-etc-pow-immutability-app-layer-gap.png",
  },
  {
    name: 'Cosmos Hub',
    description: 'Cosmos Hub L1 and interchain security asset with unresolved ATOM value capture',
    type: 'L1',
    slug: 'cosmos-hub-atom-interchain-security-value-accrual-gap',
    color: '#111827',
    initial: 'ATOM',
    logoUrl: "/research-logos/cosmos-hub-atom-interchain-security-value-accrual-gap.png",
  },
  {
    name: 'Render Network',
    description: 'Decentralized GPU rendering and AI compute network with BME token demand',
    type: 'AI/DePIN',
    slug: 'render-network-render-gpu-rendering-ai-compute-depin',
    color: '#FF3B1F',
    initial: 'RENDER',
    logoUrl: "/research-logos/render-network-render-gpu-rendering-ai-compute-depin.png",
  },
  {
    name: 'Arbitrum',
    description: 'Ethereum L2 ecosystem with Orbit, Stylus, Timeboost, and ARB value-capture gap',
    type: 'L2',
    slug: 'arbitrum-arb-l2-governance-token-value-capture-gap',
    color: '#28A0F0',
    initial: 'ARB',
    logoUrl: "/research-logos/arbitrum-arb-l2-governance-token-value-capture-gap.png",
  },
  {
    name: 'Optimism',
    description: 'Superchain and OP Stack platform token with emerging buyback-based value capture',
    type: 'L2',
    slug: 'optimism-op-superchain-platform-economics-buyback-test',
    color: '#FF0420',
    initial: 'OP',
    logoUrl: "/research-logos/optimism-op-superchain-platform-economics-buyback-test.png",
  },
  {
    name: 'Starknet',
    description: 'STARK-based Ethereum L2 with Cairo, native account abstraction, and STRK staking',
    type: 'ZK',
    slug: 'starknet-strk-zk-rollup-account-abstraction-value-capture',
    color: '#EC796B',
    initial: 'STRK',
    logoUrl: "/research-logos/starknet-strk-zk-rollup-account-abstraction-value-capture.png",
  },
  {
    name: 'Ondo Finance',
    description: 'RWA platform token for USDY, OUSG, Global Markets, and Ondo Chain value capture',
    type: 'RWA',
    slug: 'ondo-finance-ondo-rwa-platform-token-value-capture',
    color: '#2563EB',
    initial: 'ONDO',
    logoUrl: "/research-logos/ondo-finance-ondo-rwa-platform-token-value-capture.png",
  },
  {
    name: 'Pi Network',
    description: 'Mobile-mined consumer L1 testing whether KYC distribution can become real app and payment demand',
    type: 'L1',
    slug: 'pi-network-pi-mobile-mining-kyc-utility-reality-check',
    color: '#F4B544',
    initial: 'PI',
    logoUrl: "/research-logos/pi-network-pi-mobile-mining-kyc-utility-reality-check.png",
  },
  {
    name: 'HTX DAO',
    description: 'Exchange-linked utility token testing burn economics, HT migration, and DAO governance credibility',
    type: 'CEX',
    slug: 'htx-dao-htx-exchange-linked-token-burn-governance-risk',
    color: '#00B8D9',
    initial: 'HTX',
    logoUrl: "/research-logos/htx-dao-htx-exchange-linked-token-burn-governance-risk.svg",
  },
  {
    name: 'Algorand',
    description: 'Pure proof-of-stake L1 with strong finality and quantum roadmap but weak app demand',
    type: 'L1',
    slug: 'algorand-algo-finality-quantum-roadmap-app-demand-gap',
    color: '#111827',
    initial: 'ALGO',
    logoUrl: "/research-logos/algorand-algo-finality-quantum-roadmap-app-demand-gap.png",
  },
  {
    name: 'Polygon POL',
    description: 'AggLayer and CDK infrastructure token testing whether Polygon activity accrues to POL',
    type: 'L2',
    slug: 'polygon-pol-agglayer-cdk-value-capture-test',
    color: '#8247E5',
    initial: 'POL',
    logoUrl: "/research-logos/polygon-pol-agglayer-cdk-value-capture-test.png",
  },
  {
    name: 'Flare',
    description: 'Data-focused L1 for FTSO, FAssets, and external state proofs value capture',
    type: 'Infra',
    slug: 'flare-flr-data-l1-fassets-value-capture-test',
    color: '#F97316',
    initial: 'FLR',
    logoUrl: "/research-logos/flare-flr-data-l1-fassets-value-capture-test.png",
  },
  {
    name: 'XDC Network',
    description: 'Enterprise L1 for trade finance and RWA settlement with a visible usage gap',
    type: 'RWA',
    slug: 'xdc-network-xdc-trade-finance-rwa-value-capture-gap',
    color: '#14B8A6',
    initial: 'XDC',
    logoUrl: "/research-logos/xdc-network-xdc-trade-finance-rwa-value-capture-gap.png",
  },
  {
    name: 'Aptos',
    description: 'Move-based high-performance L1 testing whether RWA and stablecoin balances accrue to APT',
    type: 'L1',
    slug: 'aptos-apt-move-l1-block-stm-unlock-value-capture-gap',
    color: '#111827',
    initial: 'APT',
    logoUrl: "/research-logos/aptos-apt-move-l1-block-stm-unlock-value-capture-gap.png",
  },
  {
    name: 'Figure HELOC',
    description: 'Tokenized home-equity credit RWA testing whether loan assets can trade onchain without liquidity illusion',
    type: 'RWA',
    slug: 'figure-heloc-tokenized-home-equity-credit-rwa-liquidity-test',
    color: '#2563EB',
    initial: 'FH',
    logoUrl: "/research-logos/figure-heloc-tokenized-home-equity-credit-rwa-liquidity-test.png",
  },
  {
    name: 'BFUSD',
    description: 'Binance reward-bearing stable-index margin asset with yield and counterparty-risk tradeoffs',
    type: 'Stablecoin',
    slug: 'bfusd-binance-reward-bearing-margin-asset-counterparty-risk',
    color: '#F0B90B',
    initial: 'BF',
    logoUrl: "/research-logos/bfusd-binance-reward-bearing-margin-asset-counterparty-risk.png",
  },
  {
    name: 'USDtb',
    description: 'Ethena BUIDL-backed stablecoin and regulated RWA collateral rail',
    type: 'Stablecoin',
    slug: 'usdtb-ethena-buidl-backed-stablecoin-reserve-collateral-rail',
    color: '#06B6D4',
    initial: 'TB',
    logoUrl: "/research-logos/usdtb-ethena-buidl-backed-stablecoin-reserve-collateral-rail.png",
  },
  {
    name: 'United Stables',
    description: 'BVI-issued stablecoin with fiat and stablecoin-inclusive reserves testing trust and BNB Chain liquidity',
    type: 'Stablecoin',
    slug: 'united-stables-u-stablecoin-inclusive-reserve-trust-gap',
    color: '#10B981',
    initial: 'U',
    logoUrl: "/research-logos/united-stables-u-stablecoin-inclusive-reserve-trust-gap.png",
  },
  {
    name: 'YLDS',
    description: 'SEC-registered yield-bearing dollar certificate testing compliant onchain cash management',
    type: 'Stablecoin',
    slug: 'figure-ylds-sec-registered-yield-bearing-stablecoin',
    color: '#5B56F5',
    initial: 'YLDS',
    logoUrl: "/research-logos/figure-ylds-sec-registered-yield-bearing-stablecoin.png",
  },
  {
    name: 'Spiko EUTBL',
    description: 'Tokenized Eurozone T-bills money-market fund testing non-USD RWA cash management',
    type: 'RWA',
    slug: 'spiko-eutbl-eu-tbills-tokenized-money-market-fund-liquidity-gap',
    color: '#7C3AED',
    initial: 'EU',
    logoUrl: "/research-logos/spiko-eutbl-eu-tbills-tokenized-money-market-fund-liquidity-gap.svg",
  },
  {
    name: 'Blockchain Capital BCAP',
    description: 'Tokenized venture fund security testing whether private-market interests can become onchain assets',
    type: 'RWA',
    slug: 'blockchain-capital-bcap-tokenized-vc-fund-security-token-liquidity-gap',
    color: '#0F172A',
    initial: 'BC',
    logoUrl: "/research-logos/blockchain-capital-bcap-tokenized-vc-fund-security-token-liquidity-gap.png",
  },
  {
    name: 'Superstate USTB',
    description: 'Tokenized short-duration U.S. government securities fund and onchain Treasury collateral rail',
    type: 'RWA',
    slug: 'superstate-ustb-tokenized-treasury-fund-onchain-collateral-rail',
    color: '#0EA5E9',
    initial: 'USTB',
    logoUrl: "/research-logos/superstate-ustb-tokenized-treasury-fund-onchain-collateral-rail.svg",
  },
  {
    name: 'Ondo OUSG',
    description: 'Qualified-access tokenized Treasury fund with NAV accrual and Ondo RWA distribution',
    type: 'RWA',
    slug: 'ondo-ousg-tokenized-treasury-fund-rwa-access-liquidity-gap',
    color: '#2563EB',
    initial: 'OUSG',
    logoUrl: "/research-logos/ondo-ousg-tokenized-treasury-fund-rwa-access-liquidity-gap.png",
  },
  {
    name: 'Spiko EURSAFO',
    description: 'Tokenized euro overnight-swap fund with Amundi management and Spiko distribution',
    type: 'RWA',
    slug: 'spiko-amundi-eursafo-tokenized-overnight-swap-fund-euro-cash-management',
    color: '#0F766E',
    initial: 'EUR',
    logoUrl: "/research-logos/spiko-amundi-eursafo-tokenized-overnight-swap-fund-euro-cash-management.svg",
  },
  {
    name: 'Injective',
    description: 'Finance-specific L1 with native orderbook modules, MultiVM execution, and INJ burn auctions',
    type: 'L1',
    slug: 'injective-inj-finance-l1-burn-auction-value-capture-gap',
    color: '#06B6D4',
    initial: 'INJ',
    logoUrl: "/research-logos/injective-inj-finance-l1-burn-auction-value-capture-gap.svg",
  },
  {
    name: 'Bitway',
    description: 'Bitcoin-native DeTraFi yield and lending stack testing whether BTW can capture value beyond incentives',
    type: 'BTCFi/Yield',
    slug: 'bitway-btw-bitcoin-native-yield-lending-token-value-capture-risk',
    color: '#F59E0B',
    initial: 'BTW',
    logoUrl: "/research-logos/bitway-btw-bitcoin-native-yield-lending-token-value-capture-risk.svg",
  },
  {
    name: 'LayerZero',
    description: 'Omnichain messaging infrastructure testing whether ZRO fee-switch governance can capture protocol value',
    type: 'Interoperability',
    slug: 'layerzero-zro-omnichain-messaging-fee-switch-value-capture-gap',
    color: '#0B0F19',
    initial: 'ZRO',
    logoUrl: "/research-logos/layerzero-zro-omnichain-messaging-fee-switch-value-capture-gap.svg",
  },
  {
    name: 'Humanity',
    description: 'Proof-of-humanity identity network where H value capture must recover from token migration, unlocks, and verifier adoption risk',
    type: 'Identity/PoH',
    slug: 'humanity-h-proof-of-humanity-token-swap-value-capture-risk',
    color: '#EC4899',
    initial: 'H',
    logoUrl: "/research-logos/humanity-h-proof-of-humanity-token-swap-value-capture-risk.svg",
  },
  {
    name: 'MegaUSD',
    description: 'MegaETH-native stablecoin using Ethena reserve yield to subsidize sequencer costs while testing redemption and liquidity depth',
    type: 'Stablecoin',
    slug: 'megausd-usdm-megaeth-native-stablecoin-sequencer-yield-risk',
    color: '#FF4D00',
    initial: 'USDM',
    logoUrl: "/research-logos/megausd-usdm-megaeth-native-stablecoin-sequencer-yield-risk.svg",
  },
  {
    name: 'OnRe',
    description: 'Tokenized reinsurance yield asset on Solana where ONYC must prove underwriting, collateral, redemption, and admin-control resilience',
    type: 'RWA',
    slug: 'onre-onyc-tokenized-reinsurance-yield-collateral-risk',
    color: '#0F766E',
    initial: 'ONYC',
    logoUrl: "/research-logos/onre-onyc-tokenized-reinsurance-yield-collateral-risk.svg",
  },
  {
    name: 'COCO',
    description: 'BNB Chain meme and AI-agent wrapper where token value depends on real app usage, liquidity depth, and resolving contract-identity risk',
    type: 'Meme/AI',
    slug: 'coco-coco-bnb-chain-meme-ai-agent-contract-risk',
    color: '#F0B90B',
    initial: 'COCO',
    logoUrl: "/research-logos/coco-coco-bnb-chain-meme-ai-agent-contract-risk.svg",
  },
  {
    name: 'KOGE',
    description: '48 Club BNB Chain infrastructure-adjacent token where liquidity depth, holder concentration, and value capture need proof',
    type: 'Infra',
    slug: 'koge-48-club-token-bnb-chain-infrastructure-liquidity-value-capture-risk',
    color: '#F0B90B',
    initial: 'KOGE',
    logoUrl: "/research-logos/koge-48-club-token-bnb-chain-infrastructure-liquidity-value-capture-risk.svg",
  },
  {
    name: 'RealLink',
    description: 'SocialFi and payments token where app usage, emissions, supply reconciliation, and liquidity quality need proof',
    type: 'SocialFi',
    slug: 'reallink-real-socialfi-payments-supply-liquidity-risk',
    color: '#1D4ED8',
    initial: 'REAL',
    logoUrl: "/research-logos/reallink-real-socialfi-payments-supply-liquidity-risk.svg",
  },
  {
    name: 'Amp',
    description: 'Payment-collateral token where Flexa adoption, merchant demand, and liquidity drive value',
    type: 'PayFi',
    slug: 'amp-amp-flexa-collateral-payments-network-adoption-risk',
    color: '#D946EF',
    initial: 'AMP',
    logoUrl: "/research-logos/amp-amp-flexa-collateral-payments-network-adoption-risk.svg",
  },
  {
    name: 'Arcium',
    description: 'Confidential-compute network where encrypted apps, ARX utility, and liquidity need proof',
    type: 'Privacy',
    slug: 'arcium-arx-confidential-computing-mpc-fhe-token-liquidity-risk',
    color: '#4F46E5',
    initial: 'ARX',
    logoUrl: "/research-logos/arcium-arx-confidential-computing-mpc-fhe-token-liquidity-risk.svg",
  },
  {
    name: 'Collector Crypt',
    description: 'Physical-card RWA/gacha token with real asset logistics and thin liquidity risk',
    type: 'RWA',
    slug: 'collector-crypt-cards-physical-card-rwa-gacha-liquidity-risk',
    color: '#0EA5E9',
    initial: 'CARD',
    logoUrl: "/research-logos/collector-crypt-cards-physical-card-rwa-gacha-liquidity-risk.svg",
  },
  {
    name: 'EVAA Protocol',
    description: 'TON lending protocol where Telegram distribution meets borrow demand and token liquidity tests',
    type: 'Lending',
    slug: 'evaa-protocol-evaa-ton-lending-telegram-liquidity-token-risk',
    color: '#0088CC',
    initial: 'EVAA',
    logoUrl: "/research-logos/evaa-protocol-evaa-ton-lending-telegram-liquidity-token-risk.svg",
  },
  {
    name: 'GEODNET',
    description: 'RTK-positioning DePIN with real device coverage, revenue buybacks, and concentration risk',
    type: 'AI/DePIN',
    slug: 'geodnet-geod-depin-rtk-positioning-network-revenue-token-risk',
    color: '#059669',
    initial: 'GEOD',
    logoUrl: "/research-logos/geodnet-geod-depin-rtk-positioning-network-revenue-token-risk.svg",
  },
  {
    name: 'Kamino',
    description: 'Solana lending and liquidity vault leader; KMNO value capture still needs fee linkage',
    type: 'Lending',
    slug: 'kamino-kmno-solana-lending-liquidity-vaults-token-value-capture',
    color: '#14B8A6',
    initial: 'KMNO',
    logoUrl: "/research-logos/kamino-kmno-solana-lending-liquidity-vaults-token-value-capture.svg",
  },
  {
    name: 'Nesa',
    description: 'Decentralized AI inference network with ZKML narrative, launch liquidity, and demand risk',
    type: 'AI/DePIN',
    slug: 'nesa-nes-decentralized-ai-inference-zkml-token-launch-risk',
    color: '#7C3AED',
    initial: 'NES',
    logoUrl: "/research-logos/nesa-nes-decentralized-ai-inference-zkml-token-launch-risk.svg",
  },
  {
    name: 'o1.exchange',
    description: 'Onchain exchange token where product breadth, volume quality, and O utility need proof',
    type: 'Perp DEX',
    slug: 'o1-exchange-o-onchain-everything-exchange-ai-trading-token-risk',
    color: '#0891B2',
    initial: 'O',
    logoUrl: "/research-logos/o1-exchange-o-onchain-everything-exchange-ai-trading-token-risk.svg",
  },
  {
    name: 'Osmosis',
    description: 'Cosmos DEX hub where IBC liquidity is real but OSMO value capture remains challenged',
    type: 'DEX',
    slug: 'osmosis-osmo-cosmos-dex-ibc-liquidity-token-value-capture-gap',
    color: '#A855F7',
    initial: 'OSMO',
    logoUrl: "/research-logos/osmosis-osmo-cosmos-dex-ibc-liquidity-token-value-capture-gap.svg",
  },
  {
    name: 'peaq',
    description: 'DePIN L1 for machine economy apps; token demand depends on real device-side usage',
    type: 'AI/DePIN',
    slug: 'peaq-peaq-depin-l1-machine-economy-token-demand-risk',
    color: '#16A34A',
    initial: 'PEAQ',
    logoUrl: "/research-logos/peaq-peaq-depin-l1-machine-economy-token-demand-risk.svg",
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
  'BTCFi/Yield',
  'Consumer/Sports',
  'Interoperability',
  'Identity/PoH',
  'Data/Infra',
  'Restaking/Cloud',
  'AI/DePIN',
  'Meme/AI',
  'SocialFi',
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
          }).map((type) => {
            const count = type === 'All' ? PROJECTS.length : PROJECTS.filter((p) => p.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] backdrop-blur-sm transition-all duration-200 ${
                  activeType === type
                    ? 'border-foreground/80 bg-foreground text-background shadow-[0_12px_28px_-20px_rgba(15,23,42,0.8)]'
                    : 'border-border/70 bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
                }`}>
                {type}
                <span className={`ml-1.5 text-[10px] ${activeType === type ? 'opacity-70' : 'opacity-50'}`}>
                  {count}
                </span>
              </button>
            );
          })}
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
