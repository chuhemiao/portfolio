/**
 * pnpm sync:research:registry
 *
 * Builds a local lookup index for researched projects so new Research Map work
 * can check local coverage before calling live market APIs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const RESEARCH_CLIENT = path.join(ROOT, 'src/app/research/research-client.tsx');
const OUT_DIR = path.join(ROOT, 'data/research-map');
const REGISTRY_FILE = path.join(OUT_DIR, 'registry.json');
const CANDIDATES_FILE = path.join(OUT_DIR, 'candidates.json');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function relative(filePath) {
  return toPosix(path.relative(ROOT, filePath));
}

function normalize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function cleanAlias(value = '') {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
    .trim();
}

function uniq(values) {
  const seen = new Set();
  return values
    .map(cleanAlias)
    .filter(Boolean)
    .filter((value) => {
      const key = normalize(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function makeName(title) {
  const clean = title
    .replace(/deep.?research.*$/i, '')
    .replace(/investment.?grade.*$/i, '')
    .replace(/in.?depth.*$/i, '')
    .replace(/comprehensive.*$/i, '')
    .replace(/analysis.*$/i, '')
    .replace(/report.*$/i, '')
    .replace(/[:—–].*$/, '')
    .trim();

  return clean || title.split(/[:—–]/)[0].trim();
}

function extractSymbols(title, initial = '') {
  const ignore = new Set([
    'AI',
    'AMM',
    'API',
    'DAO',
    'DEX',
    'EVM',
    'FDV',
    'LST',
    'RWA',
    'TVL',
    'ZK',
  ]);
  const firstPart = title.split(/[:—–]/)[0] || title;
  const symbols = [...firstPart.matchAll(/\b[A-Z0-9]{2,12}\b/g)]
    .map((match) => match[0])
    .filter((symbol) => !ignore.has(symbol));

  if (initial && initial.length <= 12 && !ignore.has(initial.toUpperCase())) {
    symbols.unshift(initial);
  }

  return uniq(symbols);
}

function getStringField(block, field) {
  const match = block.match(new RegExp(`${field}:\\s*(['"\`])([\\s\\S]*?)\\1\\s*,`));
  return match?.[2]?.replace(/\\'/g, "'").replace(/\\"/g, '"') ?? '';
}

function readResearchCards() {
  if (!fs.existsSync(RESEARCH_CLIENT)) return new Map();

  const src = fs.readFileSync(RESEARCH_CLIENT, 'utf8');
  const cards = new Map();

  for (const match of src.matchAll(/\{\s*name:[\s\S]*?\n\s*\},/g)) {
    const block = match[0];
    const slug = getStringField(block, 'slug');
    if (!slug) continue;

    cards.set(slug, {
      name: getStringField(block, 'name'),
      type: getStringField(block, 'type'),
      initial: getStringField(block, 'initial'),
      logoUrl: getStringField(block, 'logoUrl'),
    });
  }

  return cards;
}

function readResearchPosts() {
  return walk(CONTENT_DIR)
    .map((filePath) => {
      const src = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(src);
      if (data.category !== 'research') return null;

      const slug = typeof data.slug === 'string' && data.slug.trim()
        ? data.slug.trim()
        : path.basename(filePath, '.mdx');

      return {
        slug,
        title: data.title || slug,
        summary: data.summary || '',
        publishedAt: data.publishedAt || '',
        file: relative(filePath),
      };
    })
    .filter(Boolean);
}

function buildAliases(post, card) {
  const name = card?.name || makeName(post.title);
  const titleHead = post.title.split(/[:—–]/)[0] || post.title;
  const symbols = extractSymbols(post.title, card?.initial);

  return uniq([
    post.slug,
    post.slug.replace(/-/g, ' '),
    post.slug.replace(/_/g, ' '),
    post.title,
    titleHead,
    name,
    card?.initial,
    ...symbols,
  ]);
}

function buildRegistry() {
  const cards = readResearchCards();
  const posts = readResearchPosts();
  const postSlugs = new Set(posts.map((post) => post.slug));
  const projects = posts
    .map((post) => {
      const card = cards.get(post.slug);
      const aliases = buildAliases(post, card);
      const lookupKeys = uniq(aliases.map(normalize));

      return {
        slug: post.slug,
        name: card?.name || makeName(post.title),
        symbol: extractSymbols(post.title, card?.initial)[0] || card?.initial || '',
        type: card?.type || '',
        title: post.title,
        publishedAt: post.publishedAt,
        file: post.file,
        logoUrl: card?.logoUrl || '',
        aliases,
        lookupKeys,
      };
    });

  for (const [slug, card] of cards.entries()) {
    if (postSlugs.has(slug)) continue;

    const post = {
      slug,
      title: card.name || slug,
      summary: '',
      publishedAt: '',
      file: '',
    };
    const aliases = buildAliases(post, card);

    projects.push({
      slug,
      name: card.name || makeName(slug),
      symbol: card.initial || '',
      type: card.type || '',
      title: card.name || slug,
      publishedAt: '',
      file: '',
      logoUrl: card.logoUrl || '',
      source: 'research-card',
      aliases,
      lookupKeys: uniq(aliases.map(normalize)),
    });
  }

  projects.sort((a, b) => a.name.localeCompare(b.name));

  return {
    schemaVersion: 1,
    updatedAt: today(),
    description:
      'Generated local index of researched projects. Check this before calling CoinGecko or CoinMarketCap for duplicate detection.',
    stats: {
      projects: projects.length,
    },
    projects,
  };
}

function readCandidates() {
  if (!fs.existsSync(CANDIDATES_FILE)) {
    return {
      schemaVersion: 1,
      updatedAt: today(),
      description:
        'Manual backlog for CoinGecko/CoinMarketCap/Surf research candidates. Keep raw targets here before turning them into Research Map entries.',
      statuses: ['backlog', 'next', 'researching', 'researched', 'skip'],
      candidates: [],
    };
  }

  return JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
}

function candidateAliases(candidate) {
  return uniq([
    candidate.name,
    candidate.coingeckoId,
    candidate.coinmarketcapSlug,
    candidate.contract,
    candidate.symbol,
    candidate.target,
    candidate.surfSlug,
  ]);
}

function matchProject(projects, aliases) {
  const keys = aliases.map(normalize).filter(Boolean);
  if (keys.length === 0) return null;

  for (const key of keys) {
    const match = projects.find((project) => project.lookupKeys.includes(key));
    if (match) return match;
  }

  return null;
}

function syncCandidates(registry) {
  const data = readCandidates();
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  let changed = !fs.existsSync(CANDIDATES_FILE);

  const synced = candidates.map((candidate) => {
    const match = matchProject(registry.projects, candidateAliases(candidate));

    if (!match || candidate.status === 'skip') return candidate;

    if (
      candidate.status === 'researched' &&
      candidate.researchedSlug === match.slug
    ) {
      return candidate;
    }

    changed = true;
    return {
      ...candidate,
      status: 'researched',
      researchedSlug: match.slug,
      researchedAt: candidate.researchedAt || today(),
    };
  });

  const nextData = {
    schemaVersion: data.schemaVersion || 1,
    updatedAt: today(),
    description:
      data.description ||
      'Manual backlog for CoinGecko/CoinMarketCap/Surf research candidates. Keep raw targets here before turning them into Research Map entries.',
    statuses: data.statuses || ['backlog', 'next', 'researching', 'researched', 'skip'],
    candidates: synced,
  };

  if (JSON.stringify(nextData, null, 2) !== JSON.stringify(data, null, 2)) {
    changed = true;
  }

  if (changed) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(CANDIDATES_FILE, `${JSON.stringify(nextData, null, 2)}\n`);
  }

  return nextData;
}

function writeJsonIfChanged(filePath, data) {
  const next = `${JSON.stringify(data, null, 2)}\n`;
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

  if (current !== next) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, next);
  }
}

function findMatches(registry, query) {
  const key = normalize(query);
  if (!key) return [];

  return registry.projects
    .map((project) => {
      if (project.lookupKeys.includes(key)) return { project, score: 100 };
      if (project.lookupKeys.some((candidate) => candidate.startsWith(key))) {
        return { project, score: 80 };
      }
      if (key.length >= 4 && project.lookupKeys.some((candidate) => candidate.includes(key))) {
        return { project, score: 60 };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name))
    .slice(0, 12);
}

function printMatches(matches, query) {
  if (matches.length === 0) {
    console.log(`No local research match for "${query}".`);
    return;
  }

  console.log(`Local research matches for "${query}":`);
  for (const { project, score } of matches) {
    const symbol = project.symbol ? ` (${project.symbol})` : '';
    console.log(`- ${project.name}${symbol} — ${project.slug} [score ${score}]`);
    console.log(`  ${project.file || 'Research Map card only; no MDX file found'}`);
  }
}

function printNextCandidates(candidatesData, count) {
  const pending = candidatesData.candidates.filter((candidate) =>
    ['next', 'backlog'].includes(candidate.status || 'backlog')
  );

  if (pending.length === 0) {
    console.log('No pending research candidates.');
    return;
  }

  console.log(`Next ${Math.min(count, pending.length)} research candidate(s):`);
  for (const candidate of pending.slice(0, count)) {
    const label = candidate.name || candidate.target || candidate.coingeckoId || candidate.coinmarketcapSlug;
    console.log(`- [${candidate.status || 'backlog'}] ${label}`);
  }
}

export function syncResearchRegistry({ silent = false } = {}) {
  const registry = buildRegistry();
  const candidatesData = syncCandidates(registry);

  registry.stats.candidates = candidatesData.candidates.length;
  registry.stats.pendingCandidates = candidatesData.candidates.filter((candidate) =>
    ['next', 'backlog', 'researching'].includes(candidate.status || 'backlog')
  ).length;

  writeJsonIfChanged(REGISTRY_FILE, registry);

  if (!silent) {
    console.log(
      `✓ research registry synced — ${registry.stats.projects} projects, ${registry.stats.pendingCandidates} pending candidates.`
    );
  }

  return { registry, candidatesData };
}

function main() {
  const args = process.argv.slice(2);
  const { registry, candidatesData } = syncResearchRegistry();

  const checkIndex = args.indexOf('--check');
  if (checkIndex !== -1) {
    const query = args.slice(checkIndex + 1).join(' ').trim();
    printMatches(findMatches(registry, query), query);
  }

  const nextIndex = args.indexOf('--next');
  if (nextIndex !== -1) {
    const count = Number(args[nextIndex + 1]) || 10;
    printNextCandidates(candidatesData, count);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
