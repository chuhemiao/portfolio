import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import readline from 'node:readline/promises';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');
const VALID_CATEGORIES = [
  'thoughts',
  'research',
  'economics',
  'philosophy',
  'investing',
];

function parseArgs(argv) {
  const parsed = {
    description: '',
    title: '',
    category: '',
    date: '',
    slug: '',
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') {
      continue;
    }

    if (arg === '--title') {
      parsed.title = argv[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg === '--category') {
      parsed.category = argv[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg === '--date') {
      parsed.date = argv[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg === '--slug') {
      parsed.slug = argv[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      parsed.description = parsed.description
        ? `${parsed.description} ${arg}`
        : arg;
    }
  }

  return parsed;
}

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function pickFirstSentence(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  const sentence = normalized.split(/[.!?。！？]/)[0].trim();
  return sentence || normalized;
}

function cleanSlugCandidate(input) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function shortHash(input) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 8);
}

function containsCJK(input) {
  return /[\u3400-\u9fff]/.test(input);
}

function inferCategory(text) {
  const input = text.toLowerCase();
  const groups = [
    {
      category: 'research',
      keywords: [
        'research',
        'report',
        'analysis',
        'deep dive',
        'study',
        '研究',
        '报告',
        '分析',
      ],
    },
    {
      category: 'investing',
      keywords: ['invest', 'investment', 'portfolio', 'trade', 'alpha', '投资', '交易', '资产配置'],
    },
    {
      category: 'economics',
      keywords: ['economics', 'macro', 'inflation', 'interest rate', 'economy', '经济', '宏观', '通胀'],
    },
    {
      category: 'philosophy',
      keywords: ['philosophy', 'ethics', 'meaning', 'values', '哲学', '价值观', '伦理'],
    },
    {
      category: 'thoughts',
      keywords: ['thought', 'opinion', 'essay', 'note', '观点', '思考', '随笔'],
    },
  ];

  for (const group of groups) {
    if (group.keywords.some((keyword) => input.includes(keyword))) {
      return group.category;
    }
  }

  return 'thoughts';
}

function yamlSingleQuoted(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function getExistingSlugs() {
  const slugs = new Set();
  const files = [];

  if (fs.existsSync(CONTENT_DIR)) {
    const stack = [CONTENT_DIR];
    while (stack.length > 0) {
      const current = stack.pop();
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
        } else if (entry.isFile() && path.extname(entry.name) === '.mdx') {
          files.push(fullPath);
        }
      }
    }
  }

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(source);
    const metadataSlug = typeof data.slug === 'string' ? data.slug.trim() : '';
    const slug = metadataSlug || path.basename(filePath, '.mdx');
    if (slug) {
      slugs.add(slug);
    }
  }

  return slugs;
}

function ensureUniqueSlug(baseSlug, existingSlugs) {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  while (existingSlugs.has(`${baseSlug}-${index}`)) {
    index += 1;
  }
  return `${baseSlug}-${index}`;
}

function buildSlug(title, description, date) {
  const compactDate = date.replace(/-/g, '');
  const titleTokens = cleanSlugCandidate(title).split('-').filter(Boolean);
  if (titleTokens.length >= 2) {
    return titleTokens.slice(0, 10).join('-');
  }

  const descriptionTokens = cleanSlugCandidate(description).split('-').filter(Boolean);
  if (descriptionTokens.length >= 2) {
    return descriptionTokens.slice(0, 10).join('-');
  }

  if (
    containsCJK(`${title}${description}`) ||
    descriptionTokens.length <= 1
  ) {
    return `post-${compactDate}-${shortHash(description).slice(0, 6)}`;
  }

  return `${descriptionTokens[0]}-${compactDate}`;
}

async function resolveDescription(initialDescription) {
  if (initialDescription.trim()) {
    return initialDescription.trim();
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question('Post description: ');
  rl.close();
  return answer.trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const description = await resolveDescription(args.description);

  if (!description) {
    console.error('Missing description. Usage: pnpm new:post -- "your description"');
    process.exit(1);
  }

  const postDate = args.date || today();
  if (!isValidDate(postDate)) {
    console.error(`Invalid date "${postDate}". Expected YYYY-MM-DD.`);
    process.exit(1);
  }

  const title = args.title || pickFirstSentence(description) || `New ${inferCategory(description)} post`;
  const category = args.category || inferCategory(`${title} ${description}`);
  if (!VALID_CATEGORIES.includes(category)) {
    console.error(
      `Invalid category "${category}". Allowed values: ${VALID_CATEGORIES.join(', ')}`
    );
    process.exit(1);
  }

  const existingSlugs = getExistingSlugs();
  const requestedSlug = args.slug ? cleanSlugCandidate(args.slug) : '';
  const slugBase = requestedSlug || buildSlug(title, description, postDate);
  const slug = ensureUniqueSlug(slugBase, existingSlugs);

  const year = postDate.slice(0, 4);
  const outputDir = path.join(BLOG_CONTENT_DIR, year, category);
  const outputFile = path.join(outputDir, `${slug}.mdx`);
  const summary = description.length > 180 ? `${description.slice(0, 177)}...` : description;

  const content = `---
title: ${yamlSingleQuoted(title)}
publishedAt: ${yamlSingleQuoted(postDate)}
summary: ${yamlSingleQuoted(summary)}
slug: ${yamlSingleQuoted(slug)}
category: ${yamlSingleQuoted(category)}
---

## TL;DR

${description}
`;

  if (args.dryRun) {
    console.log(`dry-run path: ${path.relative(process.cwd(), outputFile)}`);
    console.log(`slug: ${slug}`);
    console.log(`category: ${category}`);
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, content, 'utf-8');

  console.log(`created: ${path.relative(process.cwd(), outputFile)}`);
  console.log(`slug: ${slug}`);
  console.log(`category: ${category}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
