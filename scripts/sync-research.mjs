/**
 * pnpm sync:research
 *
 * Scans all MDX blog posts with category: 'research' and detects
 * which ones are missing from the PROJECTS array in research-client.tsx.
 *
 * With --add flag: appends scaffold entries for missing projects.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { syncResearchLogos } from './sync-research-logos.mjs';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const RESEARCH_CLIENT = path.join(
  process.cwd(),
  'src/app/research/research-client.tsx'
);

const ADD_FLAG = process.argv.includes('--add');

// Color palette for auto-generated entries
const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#0EA5E9', '#0891B2', '#2563EB', '#7C3AED',
  '#059669', '#D97706', '#DC2626', '#0284C7', '#4F46E5',
];

function hashColor(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

function inferType(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  if (/\bperp(etual)?\b|perp dex/.test(text)) return 'Perp DEX';
  if (/\bcex\b|exchange(?! protocol)|trading platform/.test(text)) return 'CEX';
  if (/\bdex\b|amm\b|swap\b|liquidity pool/.test(text)) return 'DEX';
  if (/\blending\b|borrow/.test(text)) return 'Lending';
  if (/\byield\b/.test(text)) return 'Yield';
  if (/\bzk\b|zero.knowledge|zk.rollup|zkml/.test(text)) return 'ZK';
  if (/\bfhe\b|fully homomorphic/.test(text)) return 'FHE';
  if (/\bprivacy\b/.test(text)) return 'Privacy';
  if (/\bl2\b|layer.?2|rollup/.test(text)) return 'L2';
  if (/\bl1\b|layer.?1|layer one/.test(text)) return 'L1';
  if (/\bprediction market/.test(text)) return 'Prediction';
  if (/\bstablecoin\b|stable coin\b/.test(text)) return 'Stablecoin';
  if (/\bpayfi\b|payment/.test(text)) return 'PayFi';
  if (/\brwa\b|real.world asset|tokeniz/.test(text)) return 'RWA';
  if (/\bai\b|depin\b|compute\b|gpu\b|machine learning/.test(text)) return 'AI/DePIN';
  if (/\bwallet\b/.test(text)) return 'Wallet';
  if (/\binfra(structure)?\b|data infra|analytics/.test(text)) return 'Infra';
  return 'DeFi';
}

function makeInitial(name) {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length >= 2) return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return (words[0] || 'XX').slice(0, 4).toUpperCase();
}

function makeName(title) {
  // Take first meaningful word(s) — strip "deep research report" boilerplate
  const clean = title
    .replace(/deep.?research.*$/i, '')
    .replace(/investment.?grade.*$/i, '')
    .replace(/in.?depth.*$/i, '')
    .replace(/comprehensive.*$/i, '')
    .replace(/analysis.*$/i, '')
    .replace(/report.*$/i, '')
    .replace(/[:—–-].*$/, '')
    .trim();
  return clean || title.split(/[:—–-]/)[0].trim();
}

// Collect all research blog posts
function getAllResearchPosts() {
  const posts = [];
  const stack = [CONTENT_DIR];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.name.endsWith('.mdx')) {
        const src = fs.readFileSync(full, 'utf-8');
        const { data } = matter(src);
        if (data.category === 'research') {
          const slug = (typeof data.slug === 'string' && data.slug.trim())
            ? data.slug.trim()
            : path.basename(entry.name, '.mdx');
          posts.push({ slug, title: data.title || slug, summary: data.summary || '' });
        }
      }
    }
  }
  return posts;
}

// Extract slugs already in PROJECTS array
function getExistingSlugs() {
  const src = fs.readFileSync(RESEARCH_CLIENT, 'utf-8');
  const slugs = new Set();
  for (const m of src.matchAll(/slug:\s*['"`]([^'"`]+)['"`]/g)) {
    slugs.add(m[1]);
  }
  return slugs;
}

function buildScaffold(post) {
  const name = makeName(post.title);
  const description = post.summary.length > 80
    ? post.summary.slice(0, 77) + '...'
    : post.summary;
  const type = inferType(post.title, post.summary);
  const color = hashColor(post.slug);
  const initial = makeInitial(name);

  return `  {
    name: '${name}',
    description: '${description.replace(/'/g, "\\'")}',
    type: '${type}',
    slug: '${post.slug}',
    color: '${color}',
    initial: '${initial}',
  },`;
}

function appendToProjects(scaffolds) {
  let src = fs.readFileSync(RESEARCH_CLIENT, 'utf-8');
  const insertBefore = '];\n\nconst ALL_TYPES';
  const idx = src.indexOf(insertBefore);
  if (idx === -1) {
    console.error('Could not find insertion point in research-client.tsx');
    process.exit(1);
  }
  const newEntries = scaffolds.join('\n') + '\n';
  src = src.slice(0, idx) + newEntries + src.slice(idx);
  fs.writeFileSync(RESEARCH_CLIENT, src, 'utf-8');
}

async function main() {
  const posts = getAllResearchPosts();
  const existing = getExistingSlugs();
  const missing = posts.filter(p => !existing.has(p.slug));

  if (missing.length === 0) {
    console.log('✓ research-client.tsx is in sync — no missing entries.');

    if (ADD_FLAG) {
      console.log('↻ Syncing local research logos...');
      await syncResearchLogos();
    }

    return;
  }

  console.log(`Found ${missing.length} research post(s) not in research-client.tsx:\n`);
  const scaffolds = [];
  for (const post of missing) {
    console.log(`  slug: ${post.slug}`);
    console.log(`  title: ${post.title}`);
    if (ADD_FLAG) {
      scaffolds.push(buildScaffold(post));
      console.log(`  → scaffold generated`);
    }
    console.log('');
  }

  if (ADD_FLAG) {
    appendToProjects(scaffolds);
    console.log(`✓ Appended ${scaffolds.length} scaffold entry(s) to PROJECTS.`);
    console.log('↻ Syncing local research logos...');
    await syncResearchLogos();
  } else {
    console.log('Run with --add to auto-append scaffold entries:');
    console.log('  pnpm sync:research --add');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
