import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'data', 'research-map');
const OUT_FILE = path.join(OUT_DIR, 'depth-upgrade-queue.json');

function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1] || fallback;
  return fallback;
}

const limit = Number(getArg('limit', '100')) || 100;
const write = process.argv.includes('--write');
const mode = getArg('mode', 'full');

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function relative(filePath) {
  return toPosix(path.relative(ROOT, filePath));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function stripFrontmatter(input) {
  if (!input.startsWith('---')) return input;
  const end = input.indexOf('\n---', 3);
  return end === -1 ? input : input.slice(end + 4);
}

function stripCodeBlocks(input) {
  return input.replace(/```[\s\S]*?```/g, '');
}

function auditBody(raw) {
  const body = stripCodeBlocks(stripFrontmatter(raw));
  const nonWhitespaceChars = (body.match(/\S/g) || []).length;
  const cjkChars = (body.match(/[\u3400-\u9fff\uf900-\ufaff]/gu) || []).length;
  const words = (body.match(/[A-Za-z0-9][A-Za-z0-9'._/-]*/g) || []).length;
  const linkUrls = new Set();

  for (const match of body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)) {
    linkUrls.add(match[1].replace(/[),.;]+$/g, ''));
  }
  for (const match of body.matchAll(/https?:\/\/[^\s)]+/g)) {
    linkUrls.add(match[0].replace(/[),.;]+$/g, ''));
  }

  const tableLines = body
    .split('\n')
    .filter((line) => /^\s*\|.+\|\s*$/.test(line)).length;

  const requiredSections = [
    ['Pre-screen Decision', /pre-screen|depth decision/i],
    ['TL;DR / Executive Summary', /tl;?dr|executive summary/i],
    ['Project Overview', /project overview/i],
    ['Research Question', /research question|investment relevance/i],
    ['Architecture / Mechanism', /architecture|mechanism|product flow/i],
    ['Market Intelligence / Traction', /market intelligence|traction|usage/i],
    ['Economics / Value Capture', /economics|value capture/i],
    ['Tokenomics / Capital Structure', /tokenomics|capital structure|supply/i],
    ['Team / Funding / Governance', /team|funding|governance/i],
    ['Competitive Landscape', /competitive|competition|competitor/i],
    ['Catalysts', /catalyst/i],
    ['Risk Matrix', /risk matrix|key risks/i],
    ['Valuation / Importance', /valuation|importance framework/i],
    ['Bull / Base / Bear', /bull|base|bear/i],
    ['Confidence Score', /confidence score|confidence/i],
    ['Red-team Check', /red-?team/i],
    ['Monitoring Dashboard', /monitoring dashboard|metrics dashboard/i],
    ['Follow-up Triggers', /follow-up|follow up/i],
    ['Final Investment View', /final investment view|investment view|conclusion/i],
  ];

  const missingSections = requiredSections
    .filter(([, pattern]) => !pattern.test(body))
    .map(([label]) => label);

  const thresholds = mode === 'quick'
    ? { words: 1200, cjkChars: 2500, nonWhitespaceChars: 8000, evidenceLinks: 6, tableLines: 6, maxMissingSections: 9 }
    : { words: 6000, cjkChars: 10000, nonWhitespaceChars: 35000, evidenceLinks: 20, tableLines: 18, maxMissingSections: 1 };

  const lengthPass =
    words >= thresholds.words ||
    cjkChars >= thresholds.cjkChars ||
    nonWhitespaceChars >= thresholds.nonWhitespaceChars;
  const evidencePass = linkUrls.size >= thresholds.evidenceLinks;
  const tablePass = tableLines >= thresholds.tableLines;
  const sectionPass = missingSections.length <= thresholds.maxMissingSections;

  return {
    words,
    cjkChars,
    nonWhitespaceChars,
    evidenceLinks: linkUrls.size,
    tableLines,
    missingSections,
    pass: lengthPass && evidencePass && tablePass && sectionPass,
    failures: {
      length: !lengthPass,
      evidence: !evidencePass,
      tables: !tablePass,
      sections: !sectionPass,
    },
  };
}

function readResearchPosts() {
  return walk(CONTENT_DIR)
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(raw);
      if (data.category !== 'research') return null;
      return {
        slug: data.slug || path.basename(filePath, '.mdx'),
        title: data.title || data.slug || path.basename(filePath, '.mdx'),
        publishedAt: data.publishedAt || '',
        file: relative(filePath),
        raw,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const byDate = String(b.publishedAt).localeCompare(String(a.publishedAt));
      if (byDate !== 0) return byDate;
      return a.title.localeCompare(b.title);
    });
}

const posts = readResearchPosts().slice(0, limit);
const audited = posts.map((post) => {
  const audit = auditBody(post.raw);
  return {
    slug: post.slug,
    title: post.title,
    publishedAt: post.publishedAt,
    file: post.file,
    depthStatus: audit.pass ? 'full-depth-pass' : 'needs-upgrade',
    ...audit,
  };
});

const needsUpgrade = audited.filter((item) => item.depthStatus === 'needs-upgrade');
const report = {
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
  mode,
  limit,
  thresholds: mode === 'quick'
    ? { words: 1200, cjkChars: 2500, nonWhitespaceChars: 8000, evidenceLinks: 6, tableLines: 6, maxMissingSections: 9 }
    : { words: 6000, cjkChars: 10000, nonWhitespaceChars: 35000, evidenceLinks: 20, tableLines: 18, maxMissingSections: 1 },
  stats: {
    audited: audited.length,
    fullDepthPass: audited.length - needsUpgrade.length,
    needsUpgrade: needsUpgrade.length,
  },
  queue: needsUpgrade.map((item, index) => ({
    priority: index + 1,
    status: 'needs-upgrade',
    slug: item.slug,
    title: item.title,
    publishedAt: item.publishedAt,
    file: item.file,
    words: item.words,
    evidenceLinks: item.evidenceLinks,
    tableLines: item.tableLines,
    missingSections: item.missingSections,
    failures: item.failures,
  })),
  audited,
};

console.log(`Audited ${report.stats.audited} research report(s).`);
console.log(`Full-depth pass: ${report.stats.fullDepthPass}`);
console.log(`Needs upgrade: ${report.stats.needsUpgrade}`);

for (const item of needsUpgrade.slice(0, 20)) {
  console.log(`- ${item.slug}: ${item.words} words, ${item.evidenceLinks} links, missing ${item.missingSections.length}`);
}

if (write) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${relative(OUT_FILE)}`);
}
