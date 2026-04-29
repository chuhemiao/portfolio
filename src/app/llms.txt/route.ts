import { getBlogPosts } from '@/data/blog';
import { DATA } from '@/data/resume';

export async function GET() {
  const posts = await getBlogPosts();
  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, 20);

  const blogList = recentPosts
    .map(
      (post) =>
        `- [${post.metadata.title}](${DATA.url}/blog/${post.slug})${post.metadata.summary ? ': ' + post.metadata.summary : ''}`
    )
    .join('\n');

  const content = `# ${DATA.name}

> ${DATA.description}

${DATA.name} (KK) is a Web3 Product Engineer, digital nomad, and crypto researcher. Founder of iBuidl, TPM at Yamaswap. He builds and ships live market tools, publishes deep-dive crypto research, and writes about DeFi architecture and AI agent systems. Core thesis: exchange rate (ALT/BTC) is truth, USD price is the illusion.

## About

${DATA.summary}

## Pages

- [Home](${DATA.url}/): Personal portfolio — bio, current roles, work history, projects, and philosophy
- [Research](${DATA.url}/research): Deep-dive investment research on 60+ crypto projects across exchanges, DeFi, L1/L2, ZK, AI/DePIN, RWA, and market structure
- [Oscillator](${DATA.url}/oscillator): Altcoin strength monitor using ALT/BTC oscillator thesis — research watchlist, market breadth table (top 500), BTC market heat index with 12 on-chain indicators
- [Fund](${DATA.url}/fund): Live capital map of crypto assets, L1s, DeFi infrastructure, US equities, and prediction markets with conviction tracking
- [Blog](${DATA.url}/blog): Technical articles on Web3, DeFi protocols, AI agents, long-term memory architecture, and crypto market analysis
- [Thoughts](${DATA.url}/thoughts): Short-form crypto market notes and observations synced from Telegram channel @kkdemian2050
- [Stack](${DATA.url}/stack): Personal workflow — recommended books, data sources, crypto tools, and AI stack

## External Tools Built

- [Stablecoin Watch](https://usdt.kkdemian.com/): USDC/USDT supply flow and stablecoin market dashboard
- [Fear Dashboard](https://fear.kkdemian.com/): Crypto market regime, risk scoring, and cycle-timing dashboard
- [Crypto Master](https://book.kkdemian.com/): Web3 educational resource and research archive

## Recent Blog Posts

${blogList}

## Research Coverage

Exchanges: Binance, OKX, Bybit, Coinbase, Hyperliquid
DeFi: Uniswap, Aave, Curve, Pendle, GMX, Ethena, Morpho
L1/L2: Ethereum, Solana, TON, ICP, Base, Arbitrum, Optimism, Sui, Aptos
ZK: zkSync, Starknet, Scroll, Polygon zkEVM
AI/DePIN: Render, Akash, io.net, Bittensor, Grass
RWA: Ondo, Maple, Centrifuge

## Projects

- [iBuidl](https://ibuidl.org/): Web3 digital nomad community — accelerating Web2-to-Web3 career transitions
- [Yamaswap](https://yamaswap.com/): Permissionless ETF dApp on Solana and BASE using Intent Framework and AI Agents
- fCurrency: Farcaster mini app for fiat/crypto conversion using CMC, CoinGecko, and Coinapi
- [AnkiRin](https://rin.kkdemian.com/): AI-powered Japanese vocabulary flashcard tool using Gemini AI and Firebase

## Skills & Expertise

${DATA.skills.join(', ')}

## Social & Contact

- GitHub: https://github.com/chuhemiao
- X (Twitter): https://x.com/0xkkdemian
- Telegram: https://t.me/kkdemian_laobai
- Telegram Channel: https://t.me/kkdemian2050 (market notes, research drops)
- YouTube: https://www.youtube.com/@kkdemian
- RSS Feed: ${DATA.url}/rss.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
