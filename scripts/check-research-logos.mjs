import fs from 'node:fs';
import path from 'node:path';
import { PROJECTS as projects } from '../src/data/research-projects.ts';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const LOCAL_PREFIX = '/research-logos/';

const failures = [];
let fallbacks = 0;

for (const project of projects) {
  if (!project.logoUrl) {
    fallbacks += 1;
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

console.log(`Research logo check passed for ${projects.length} projects (${fallbacks} use the initials fallback).`);
