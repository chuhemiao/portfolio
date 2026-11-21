import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { addCardDays, readCardWeeks } from '../src/lib/card-weekly.ts';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const destination = fileURLToPath(new URL('../src/data/pulse-card-weekly.json', import.meta.url));
const endpoints = {
  packOpenings: 'https://api.llama.fi/summary/dexs/collector-crypt',
  protocolRevenue: 'https://api.llama.fi/summary/fees/collector-crypt?dataType=dailyRevenue',
  holdersRevenue: 'https://api.llama.fi/summary/fees/collector-crypt?dataType=dailyHoldersRevenue',
};

function weeklySum(series, start, key) {
  const expected = new Set(Array.from({ length: 7 }, (_, offset) => Date.parse(addCardDays(start, offset)) / 1000));
  const first = Date.parse(start) / 1000;
  const end = Date.parse(addCardDays(start, 7)) / 1000;
  let total = 0;
  for (const row of series) {
    const [timestamp, amount] = Array.isArray(row) ? row : [];
    if (!Number.isSafeInteger(timestamp)) throw new Error(`${key} has an invalid daily timestamp`);
    if (timestamp < first || timestamp >= end) continue;
    if (!expected.delete(timestamp) || typeof amount !== 'number' || !Number.isFinite(amount) ||
      (key !== 'protocolRevenue' && amount < 0)) throw new Error(`${key} has an invalid or duplicate UTC day`);
    total += amount;
  }
  if (expected.size) throw new Error(`${key} is missing ${expected.size} UTC days for ${start}`);
  return total;
}

export function prepareCardWeeklyRefresh(input, weekStart, captures, { currentOnly = false } = {}) {
  const archive = structuredClone(readCardWeeks(input));
  const issue = archive.find(week => week.weekStart === weekStart);
  if (!issue) throw new Error('Expected an existing reviewed UTC week');
  const previousIssue = archive.find(week => week.weekEnd === weekStart);
  const metrics = issue.projects['collector-crypt'].metrics;
  const previousMetrics = previousIssue?.projects['collector-crypt'].metrics;
  const refreshed = {};
  for (const [key, url] of Object.entries(endpoints)) {
    const capture = captures?.[key];
    const payload = capture?.payload;
    const identified = [payload?.slug, payload?.name, payload?.displayName].some(value =>
      typeof value === 'string' && /^(collector crypt|collector-crypt)$/i.test(value.trim()));
    if (capture?.url !== url || !identified || !Array.isArray(payload?.totalDataChart)) {
      throw new Error(`${key} requires a reviewed Collector Crypt capture from ${url}`);
    }
    const source = { title: 'DefiLlama', url };
    const current = { value: weeklySum(payload.totalDataChart, weekStart, key), source };
    const previous = currentOnly ? null : { value: weeklySum(payload.totalDataChart, addCardDays(weekStart, -7), key), source };
    metrics[key] = {
      current,
      previous: previousMetrics ? null : currentOnly ? (metrics[key]?.previous ?? null) : previous,
    };
    if (previous && previousMetrics) previousMetrics[key] = { current: previous, previous: previousMetrics[key]?.previous ?? null };
    refreshed[key] = { current, previous };
  }
  return { archive: readCardWeeks(archive), metrics: refreshed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: {
      week: { type: 'string' },
      captures: { type: 'string' },
      'current-only': { type: 'boolean' },
      write: { type: 'boolean' },
      help: { type: 'boolean' },
    } });
    if (values.help) {
      console.log('pnpm sync:pulse-cards --week YYYY-MM-DD --captures FILE [--current-only] [--write]');
      console.log('FILE is a reviewed JSON object with packOpenings, protocolRevenue and holdersRevenue. Each is { url, payload }, with the full DefiLlama summary response as payload.');
      console.log(JSON.stringify(endpoints, null, 2));
      console.log('Each updated UTC week needs seven daily observations. Use --current-only to update just the selected week.');
      console.log('The default updates the selected and prior week, using the prior archived report when present. Without --write the command prints proposed figures.');
    } else {
      if (!values.week || !values.captures) throw new Error('Provide --week and --captures or use --help');
      const [archive, captures] = await Promise.all([destination, values.captures].map(async file =>
        JSON.parse(await readFile(file, 'utf8'))));
      const result = prepareCardWeeklyRefresh(archive, values.week, captures, { currentOnly: values['current-only'] });
      if (values.write) await writeSnapshot(destination, result.archive);
      console.log(JSON.stringify({ week: values.week, written: !!values.write, metrics: result.metrics }, null, 2));
    }
  } catch (error) {
    console.error(`Pulse card refresh failed: ${error.message}`);
    process.exitCode = 1;
  }
}
