import { promises as fs } from 'fs';
import path from 'path';

export interface IntelItem {
  source: string;
  content: string;
  impact?: string;
  likes?: number;
  retweets?: number;
  link?: string;
  category?: string;
  why?: string;
}

export interface InjuryItem {
  team: string;
  change: string;
  impact?: string;
  link?: string;
}

export interface FixtureItem {
  time: string;
  match: string;
  prediction?: string;
  polymarketOdds?: string;
}

export interface MarketDynamic {
  market: string;
  volumeChange?: string;
  reason?: string;
}

export interface ContentIdea {
  type: '蹭热点' | '数据驱动' | '悬念制造' | string;
  idea: string;
  example?: string;
}

export interface CompetitorActivity {
  handle: string;
  followers?: number;
  posts7d?: number;
  level?: 'high' | 'medium' | 'low' | string;
}

export interface CompetitorNarrative {
  handle: string;
  narrative: string;
}

export interface CompetitorPost {
  handle: string;
  content: string;
  likes?: number;
  retweets?: number;
  link?: string;
}

export interface MindshareRank {
  rank: number;
  project: string;
  trend?: 'up' | 'down' | 'flat' | string;
}

export interface SimpleEntry {
  source: string;
  summary: string;
  link?: string;
  view?: string;
}

export interface MemePost {
  source: string;
  summary: string;
  likes?: number;
  retweets?: number;
  link?: string;
}

export interface RiskItem {
  type: 'security' | 'regulation' | 'competitor' | string;
  description: string;
  link?: string;
}

export interface PulseData {
  weekOf: string;
  context: string;
  updatedAt: string;
  worldCup: {
    topIntel: IntelItem[];
    injuries: InjuryItem[];
    fixtures: FixtureItem[];
    marketDynamics: MarketDynamic[];
    contentIdeas: ContentIdea[];
  };
  topIntel: IntelItem[];
  exchanges: SimpleEntry[];
  chains: SimpleEntry[];
  competitors: {
    activity: CompetitorActivity[];
    narratives: CompetitorNarrative[];
    topPosts: CompetitorPost[];
    mindshare: MindshareRank[];
  };
  kolMedia: SimpleEntry[];
  aiWeb3: SimpleEntry[];
  memes: {
    sentiment: 'optimistic' | 'neutral' | 'pessimistic' | null;
    hotMeme: string;
    borrowable: string;
    topPosts: MemePost[];
  };
  risks: RiskItem[];
  ops: {
    todayContent: string;
    weekFollow: string;
    narrativeOpportunity: string;
  };
}

export async function getPulseData(): Promise<PulseData> {
  const file = path.join(process.cwd(), 'content', 'pulse.json');
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw) as PulseData;
}
