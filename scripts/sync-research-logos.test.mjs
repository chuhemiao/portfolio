import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SCRIPT_PATH = '/Users/kk/indie/portfolio/scripts/sync-research-logos.mjs';

function makeWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-logo-sync-'));

  fs.mkdirSync(path.join(root, 'src', 'app', 'research'), { recursive: true });
  fs.mkdirSync(path.join(root, 'content', 'blog'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public', 'research-logos'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'src', 'app', 'research', 'research-client.tsx'),
    `'use client';

type ResearchProject = {
  name: string;
  description: string;
  type: string;
  slug: string;
  color: string;
  initial: string;
  logoUrl?: string;
};

const PROJECTS: ResearchProject[] = [
  {
    name: 'Unknown Project',
    description: 'Test fallback path',
    type: 'DeFi',
    slug: 'unknown-project',
    color: '#111827',
    initial: 'UP',
  },
];

const ALL_TYPES = ['All'];

export default function ResearchClient() {
  return null;
}
`,
    'utf8'
  );

  return root;
}

test('syncResearchLogos keeps running when Coinpaprika coin list fetch fails', async () => {
  const root = makeWorkspace();
  const previousCwd = process.cwd();
  const previousFetch = global.fetch;

  process.chdir(root);

  global.fetch = async (url) => {
    if (url === 'https://api.coinpaprika.com/v1/coins') {
      const error = new TypeError('fetch failed');
      error.cause = { code: 'ECONNRESET', host: 'api.coinpaprika.com' };
      throw error;
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const module = await import(`${pathToFileURL(SCRIPT_PATH).href}?test=${Date.now()}`);
    await module.syncResearchLogos();

    const logoPath = path.join(root, 'public', 'research-logos', 'unknown-project.svg');
    const researchFile = path.join(root, 'src', 'app', 'research', 'research-client.tsx');
    const source = fs.readFileSync(researchFile, 'utf8');

    assert.equal(fs.existsSync(logoPath), true);
    assert.match(source, /logoUrl:\s*"\/research-logos\/unknown-project\.svg"/);
  } finally {
    process.chdir(previousCwd);
    global.fetch = previousFetch;
    fs.rmSync(root, { recursive: true, force: true });
  }
});
