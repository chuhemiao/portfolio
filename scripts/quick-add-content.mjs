import { spawnSync } from 'node:child_process';
import process from 'node:process';

const CATEGORY_ALIASES = {
  thought: 'thoughts',
  thoughts: 'thoughts',
  research: 'research',
  economics: 'economics',
  philosophy: 'philosophy',
  investing: 'investing',
  story: 'story',
};
const VALUE_FLAGS = new Set(['--category', '--title', '--date', '--slug']);

function printHelp() {
  console.log(`Usage:
  pnpm quick:add -- "post idea" [--category research] [--title "..."] [--write]

Defaults to dry-run. Add --write to create the MDX file.

Options:
  --category <name>      thoughts | research | economics | philosophy | investing | story
  --kind <name>          Alias for --category; "thought" maps to "thoughts"
  --title <title>        Override generated title
  --date <YYYY-MM-DD>    Override publish date
  --slug <slug>          Override generated slug
  --sync-research        After --write research posts, run pnpm sync:research --add`);
}

function getValue(args, flag) {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);

  const index = args.indexOf(flag);
  return index === -1 ? '' : args[index + 1] || '';
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function normalizeCategory(value) {
  const key = String(value || '').toLowerCase().trim();
  return CATEGORY_ALIASES[key] || key;
}

function splitInlineValue(arg) {
  const index = arg.indexOf('=');
  if (index === -1) return null;

  const flag = arg.slice(0, index);
  if (!VALUE_FLAGS.has(flag)) return null;

  return [flag, arg.slice(index + 1)];
}

function buildForwardArgs(args, write) {
  const forwarded = [];
  const explicitCategory = Boolean(getValue(args, '--category'));
  const kind = normalizeCategory(getValue(args, '--kind'));

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (['--write', '--sync-research'].includes(arg)) continue;
    if (arg.startsWith('--write=') || arg.startsWith('--sync-research=')) continue;

    if (arg === '--kind') {
      index += 1;
      continue;
    }
    if (arg.startsWith('--kind=')) continue;

    const inlineValue = splitInlineValue(arg);
    if (inlineValue) {
      forwarded.push(...inlineValue);
      continue;
    }

    forwarded.push(arg);
  }

  if (kind && !explicitCategory) {
    forwarded.push('--category', kind);
  }

  if (!write && !forwarded.includes('--dry-run')) {
    forwarded.push('--dry-run');
  }

  return forwarded;
}

function runNode(args, stdio = ['inherit', 'pipe', 'inherit']) {
  return spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio,
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || hasFlag(args, '--help') || hasFlag(args, '-h')) {
    printHelp();
    return;
  }

  const write = hasFlag(args, '--write');
  const syncResearch = hasFlag(args, '--sync-research');
  const result = runNode(['scripts/new-post.mjs', ...buildForwardArgs(args, write)]);

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  const category = result.stdout?.match(/^category:\s*(.+)$/m)?.[1]?.trim();
  const didDryRun = /^dry-run path:/m.test(result.stdout || '');

  if (!write || didDryRun) {
    console.log('dry-run only. Re-run with --write to create the file.');
    return;
  }

  if (category === 'research') {
    if (syncResearch) {
      const sync = runNode(['scripts/sync-research.mjs', '--add'], 'inherit');
      if (sync.status !== 0) process.exit(sync.status || 1);
      return;
    }

    console.log('next: pnpm sync:research --add');
  }

  console.log('next: pnpm content:check');
}

main();
