import descriptions from './research-descriptions.json' with { type: 'json' };
import type { ResearchProject } from './research-projects';
import type { Locale } from '@/lib/i18n';

type DescriptionTranslation = { source: string; sourceLocale: string; en?: string; 'zh-CN': string; ja: string };
const translations: Record<string, DescriptionTranslation> = descriptions;

export function getResearchDescription(project: Pick<ResearchProject, 'slug' | 'description'>, locale: Locale) {
  const entry = Object.hasOwn(translations, project.slug) ? translations[project.slug] : undefined;
  if (!entry || entry.source !== project.description) return { text: project.description, available: false };
  const text = locale === 'en' ? entry.en ?? (entry.sourceLocale === 'en' ? entry.source : undefined)
    : locale === 'zh-CN' ? entry['zh-CN'] : locale === 'ja' ? entry.ja : undefined;
  return { text: text ?? project.description, available: Boolean(text) };
}

const categoryLabels: Record<string, [string, string]> = {
  Exchanges: ['交易所', '取引所'], Lending: ['借贷', 'レンディング'], Chains: ['公链', 'チェーン'], Privacy: ['隐私', 'プライバシー'], Consumer: ['消费应用', 'コンシューマー'], Markets: ['市场', '市場'], Infra: ['基础设施', 'インフラ'], Other: ['其他', 'その他'],
  CEX: ['中心化交易所', '中央集権型取引所'], DEX: ['去中心化交易所', '分散型取引所'], 'Perp DEX': ['永续合约 DEX', '無期限先物 DEX'], Yield: ['收益', '利回り'], DeFi: ['DeFi', 'DeFi'], L1: ['L1', 'L1'], L2: ['L2', 'L2'], 'L2 Infra': ['L2 基础设施', 'L2 インフラ'], ZK: ['零知识证明', 'ゼロ知識証明'], FHE: ['全同态加密', '完全準同型暗号'], Prediction: ['预测市场', '予測市場'], Stablecoin: ['稳定币', 'ステーブルコイン'], PayFi: ['支付金融', '決済金融'], 'AI/PayFi': ['AI / 支付金融', 'AI / 決済金融'], 'AI/DePIN': ['AI / 去中心化物理基础设施', 'AI / 分散型物理インフラ'], RWA: ['现实世界资产', '現実世界資産'], 'Identity/Infra': ['身份 / 基础设施', 'ID / インフラ'], 'DePIN/Infra': ['去中心化物理基础设施', '分散型物理インフラ'], 'Meme/Utility': ['Meme / 实用功能', 'Meme / ユーティリティ'], 'PayFi/Governance': ['支付金融 / 治理', '決済金融 / ガバナンス'], AI: ['人工智能', '人工知能'], 'DeFi/Stablecoin': ['DeFi / 稳定币', 'DeFi / ステーブルコイン'], 'PoW/Payments': ['PoW / 支付', 'PoW / 決済'], 'Governance/L1': ['治理 / L1', 'ガバナンス / L1'], 'Move/L1': ['Move / L1', 'Move / L1'], Gaming: ['游戏', 'ゲーム'], 'Gaming/Metaverse': ['游戏 / 元宇宙', 'ゲーム / メタバース'], 'DePIN/AI': ['去中心化物理基础设施 / AI', '分散型物理インフラ / AI'], 'Cross-chain DEX': ['跨链 DEX', 'クロスチェーン DEX'], 'Consumer/Ads': ['消费 / 广告', '消費者 / 広告'], 'DeFi/Reserve': ['DeFi / 储备', 'DeFi / 準備資産'], 'RWA/Credit': ['现实世界资产 / 信贷', '現実世界資産 / 信用'], 'Consumer/Sports': ['消费 / 体育', '消費 / スポーツ'], 'Data/Infra': ['数据 / 基础设施', 'データ / インフラ'], 'Restaking/Cloud': ['再质押 / 云服务', 'リステーキング / クラウド'], 'IoT/Data': ['物联网 / 数据', 'IoT / データ'], 'Liquid Staking': ['流动性质押', 'リキッドステーキング'], 'EVM Chain': ['EVM 公链', 'EVM チェーン'], 'Bitcoin L2': ['Bitcoin L2', 'Bitcoin L2'], Oracle: ['预言机', 'オラクル'], Meme: ['Meme', 'Meme'], 'Meme/PayFi': ['Meme / 支付金融', 'Meme / 決済金融'], 'AI/Trading': ['AI / 交易', 'AI / 取引'], 'NFT/AI': ['NFT / AI', 'NFT / AI'], GameFi: ['游戏金融', 'ゲーム金融'], 'Yield/DeFi': ['收益 / DeFi', '利回り / DeFi'], Trading: ['交易', '取引'], Payments: ['支付', '決済'], 'BTCFi/Yield': ['BTCFi / 收益', 'BTCFi / 利回り'], Interoperability: ['跨链互操作', '相互運用性'], 'Identity/PoH': ['身份 / 人类证明', 'ID / 人間性証明'], 'Meme/AI': ['Meme / AI', 'Meme / AI'], SocialFi: ['社交金融', 'ソーシャル金融'], Wallet: ['钱包', 'ウォレット'],
};

export function getResearchCategoryLabel(category: string, locale: Locale) {
  const labels = Object.hasOwn(categoryLabels, category) ? categoryLabels[category] : undefined;
  return labels ? locale === 'zh-CN' ? labels[0] : locale === 'ja' ? labels[1] : category : category;
}
