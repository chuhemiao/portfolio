import type { Metadata } from 'next';
import { DATA } from '@/data/resume';
import { getTranslator, LOCALES, localizeHref, OG_LOCALES, type Locale } from '@/lib/i18n';

const PAGE_COPY: Record<string, { title: [string, string, string]; description: [string, string, string] }> = {
  '/': {
    title: ['Crypto Research Hub', '加密研究中心', '暗号資産リサーチハブ'],
    description: ['Crypto research, market structure, and thesis discovery across DeFi, exchanges, stablecoins, and AI.', '研究加密资产、DeFi、交易所、稳定币与 AI，跟踪市场结构和投资逻辑。', '暗号資産、DeFi、取引所、ステーブルコイン、AI のリサーチと市場構造・投資仮説の分析。'],
  },
  '/blog': {
    title: ['Blog', '博客', 'ブログ'],
    description: ['Research, insights, and observations on crypto, DeFi, AI, and market structure.', '关于加密资产、DeFi、AI 与市场结构的研究、观点和观察。', '暗号資産、DeFi、AI、市場構造に関するリサーチ、考察、観察。'],
  },
  '/research': {
    title: ['Research Map', '研究地图', 'リサーチマップ'],
    description: ['Explore crypto project research by sector, type, and investment thesis.', '按赛道、类型和投资逻辑浏览加密项目研究。', '分野、種類、投資仮説から暗号資産プロジェクトのリサーチを探す。'],
  },
  '/topics': {
    title: ['Topics', '研究主题', 'トピック'],
    description: ['Explore research themes across DeFi, blockchains, AI, and market structure.', '探索 DeFi、公链、AI 与市场结构等研究主题。', 'DeFi、ブロックチェーン、AI、市場構造のリサーチテーマを探す。'],
  },
  '/stocks': {
    title: ['Tokenized Equities', '链上美股', 'オンチェーン米国株'],
    description: ['Tokenized US equities by issuer: legal wrapper, custody, proof of reserve, redemption terms and real order-book depth.', '按发行方拆解链上美股：法律包装、托管与储备证明、赎回条款与真实订单簿深度。', '発行体別のトークン化米国株：法的ラッパー、保管と準備金証明、償還条件、実際の板の厚み。'],
  },
  '/thoughts': {
    title: ['Thoughts', '随想', '考察'],
    description: ['Market notes and observations from kkdemian’s Telegram channel.', '来自 kkdemian Telegram 频道的市场随记与观察。', 'kkdemian の Telegram チャンネルからの市場メモと観察。'],
  },
  '/watch': {
    title: ['Listing Watch', '上币监测', '上場ウォッチ'],
    description: ['Track exchange listings and crypto market opportunities.', '跟踪交易所上币动态与加密市场机会。', '取引所の上場情報と暗号資産市場の機会を追跡。'],
  },
  '/pulse': {
    title: ['Market Pulse', '市场脉搏', 'マーケットパルス'],
    description: ['Web3 market intelligence, trends, signals, and research snapshots.', 'Web3 市场情报、趋势、信号与研究快照。', 'Web3 の市場情報、トレンド、シグナル、リサーチのスナップショット。'],
  },
  '/fear': {
    title: ['Fear & Greed', '恐惧与贪婪', '恐怖と強欲'],
    description: ['Monitor Bitcoin and crypto market sentiment and market regimes.', '监测比特币与加密市场情绪及市场状态。', 'ビットコインと暗号資産の市場心理・相場局面を監視。'],
  },
  '/oscillator': {
    title: ['Altcoin Oscillator', '山寨币振荡指标', 'アルトコイン・オシレーター'],
    description: ['Monitor altcoin strength, market breadth, and ALT/BTC cycle signals.', '监测山寨币强弱、市场广度与 ALT/BTC 周期信号。', 'アルトコインの強さ、市場の広がり、ALT/BTC のサイクルシグナルを監視。'],
  },
  '/fund': {
    title: ['Capital Map', '资金地图', '資金マップ'],
    description: ['Explore capital allocation and conviction across portfolio assets.', '查看资产配置、资金流向与投资判断。', 'ポートフォリオの資産配分、資金動向、投資判断を確認。'],
  },
  '/stack': {
    title: ['Stack', '工具栈', 'ツールスタック'],
    description: ['Tools, books, data sources, and workflows for building and research.', '用于开发和研究的工具、书籍、数据源与工作流。', '開発とリサーチに使うツール、書籍、データソース、ワークフロー。'],
  },
};

export function localizedPageMetadata(route: string, locale: Locale, base: Metadata = {}): Metadata {
  const copy = PAGE_COPY[route] ?? PAGE_COPY['/topics'];
  const t = getTranslator(locale);
  const title = t(...copy.title);
  const description = t(...copy.description);
  const url = `${DATA.url}${localizeHref(route, locale)}`;
  return {
    ...base,
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map((language) => [language, `${DATA.url}${localizeHref(route, language)}`])),
      types: { 'application/rss+xml': `${DATA.url}/rss-${locale}.xml` },
    },
    openGraph: { type: 'website', title, description, url, siteName: DATA.name, locale: OG_LOCALES[locale], alternateLocale: LOCALES.filter((language) => language !== locale).map((language) => OG_LOCALES[language]), images: [{ url: `${DATA.url}/og.svg`, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, creator: '@0xkkdemian', images: [`${DATA.url}/og.svg`] },
  };
}
