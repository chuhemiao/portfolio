import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RESEARCH_FILE = path.join(ROOT, 'src/app/research/research-client.tsx');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LOCAL_PREFIX = '/research-logos/';

const source = fs.readFileSync(RESEARCH_FILE, 'utf8');
const blocks = [...source.matchAll(/  \{\n([\s\S]*?)\n  \},?/g)];

const projects = blocks
  .map(([, body]) => {
    const get = (key) => body.match(new RegExp(`${key}: '([^']+)'`))?.[1];
    const logoUrl = body.match(/logoUrl:\s*["'`]([^"'`]+)["'`]/)?.[1];

    return {
      name: get('name'),
      slug: get('slug'),
      logoUrl,
    };
  })
  .filter((project) => project.name && project.slug);

const failures = [];

for (const project of projects) {
  if (!project.logoUrl) {
    failures.push(`${project.slug}: missing logoUrl`);
    continue;
  }

  if (!project.logoUrl.startsWith(LOCAL_PREFIX)) {
    failures.push(`${project.slug}: logoUrl must start with ${LOCAL_PREFIX}`);
    continue;
  }

  const filePath = path.join(PUBLIC_DIR, project.logoUrl.replace(/^\//, ''));

  if (!fs.existsSync(filePath)) {
    failures.push(`${project.slug}: local logo file missing at ${filePath}`);
  }
}

if (failures.length > 0) {
  console.error(`Research logo check failed (${failures.length} issues):`);
  for (const failure of failures.slice(0, 50)) {
    console.error(`- ${failure}`);
  }

  if (failures.length > 50) {
    console.error(`- ...and ${failures.length - 50} more`);
  }

  process.exit(1);
}

console.log(`Research logo check passed for ${projects.length} projects.`);
