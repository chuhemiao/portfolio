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

${DATA.name} is a Web3 Product Engineer with 6 years of experience building decentralized applications. Founder of iBuidl, a digital nomad community helping developers transition into Web3.

## About

${DATA.summary}

## Pages

- [Home](${DATA.url}): Portfolio homepage with work experience, projects, and skills overview
- [Blog](${DATA.url}/blog): Articles on Web3, DeFi, crypto investing, blockchain technology, and product engineering
- [Stack](${DATA.url}/stack): Tools, frameworks, and technologies used daily
- [Fund](${DATA.url}/fund): Crypto investment portfolio and fund insights

## Recent Blog Posts

${blogList}

## Skills & Expertise

${DATA.skills.join(', ')}

## Projects

- [Yamaswap](https://yamaswap.com): Permissionless ETFs dApp built on Intent Framework and AI Agent (SOL, BASE)
- [fCurrency](https://farcaster.xyz/miniapps/EGI5BYDYhzwk/fcurrency): Composable conversion engine for fiat and crypto assets
- [AnkiRin](https://rin.kkdemian.com/): AI-powered Japanese vocabulary flashcard app
- [IBuidl](https://ibuidl.org/): Web3 digital nomad community and transformation platform
- [Web3 Crypto Tools](https://tool.ibuidl.org/): Cryptocurrency gadgets and mainstream Web3 tools

## Social & Contact

- GitHub: https://github.com/chuhemiao
- X (Twitter): https://x.com/0xkkdemian
- YouTube: https://www.youtube.com/@kkdemian
- Telegram: https://t.me/kkdemian_laobai
- Crypto Book: https://book.kkdemian.com/
- RSS Feed: ${DATA.url}/rss.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
