import { readFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { writeSnapshot } from './lib/write-snapshot.mjs';
import { retainFearArchive, retainFearBitviewTrend } from '../src/lib/fear-signals.ts';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/src/lib/fear-data.ts')) {
      if (specifier === '@/data/fear-manual-snapshot') {
        return nextResolve(new URL('../src/data/fear-manual-snapshot.ts', import.meta.url).href, context);
      }
      if (specifier === './fear-signals') {
        return nextResolve(new URL('../src/lib/fear-signals.ts', import.meta.url).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const destination = fileURLToPath(new URL('../src/data/fear-dashboard-snapshot.json', import.meta.url));

try {
  let previous = null;
  try {
    previous = JSON.parse(await readFile(destination, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const { getFearDashboardData } = await import('../src/lib/fear-data.ts');
  const data = await getFearDashboardData({ useManualFallback: false, previousBitviewDays: previous?.bitviewValuationHistory });
  const { btcPrice, btcPriceSeries } = data.layer1;
  const { fearGreed, fearGreedSeries } = data.layer3;
  const history = data.signalHistory ?? [];
  const paired = history.filter(day => day.btcClose !== null && day.signals.fearGreed !== 'unknown');
  const latestDay = history.at(-1);
  if (!data.observedAt.btcPrice || !(btcPrice > 0) || btcPriceSeries.length < 30 ||
    !data.observedAt.fearGreed || fearGreed === null || fearGreed < 0 || fearGreed > 100 ||
    fearGreedSeries.length < 30 || paired.length < 30 || !latestDay || latestDay.btcClose === null ||
    latestDay.signals.fearGreed === 'unknown' || !data.historySources) {
    throw new Error('Recent BTC price and Fear & Greed, plus at least 30 paired closed days through the latest closed UTC day, are required');
  }
  const archive = retainFearArchive({
    generatedAt: data.generatedAt,
    signalHistory: history,
    historySources: data.historySources,
  }, previous);
  const bitviewTrend = data.bitviewTrend ?? retainFearBitviewTrend(previous?.bitviewTrend, Date.parse(data.generatedAt));
  await writeSnapshot(destination, { ...data, ...archive, bitviewTrend });
  console.log(JSON.stringify({
    generatedAt: data.generatedAt,
    observedAt: data.observedAt,
    histories: { btcPrice: btcPriceSeries.length, fearGreed: fearGreedSeries.length },
    bitviewTrend: { days: bitviewTrend?.points.length ?? 0, collectedAt: bitviewTrend?.collectedAt ?? null },
    signalHistory: {
      days: history.length,
      pairedDays: paired.length,
      first: history[0].date,
      last: latestDay.date,
      uniqueAddressCoverage: archive.signalHistory.filter(day => day.signals.uniqueAddresses !== 'unknown').length,
      fundingCoverage: archive.signalHistory.filter(day => day.signals.funding !== 'unknown').length,
      realizedPriceCoverage: archive.signalHistory.filter(day => day.signals.realizedPrice !== 'unknown').length,
      mvrvZCoverage: archive.signalHistory.filter(day => day.signals.mvrvZ !== 'unknown').length,
    },
    historySources: archive.historySources,
    sources: data.sources.map(({ name, status }) => ({ name, status })),
  }, null, 2));
} catch (error) {
  console.error(`Fear sync failed; previous snapshot retained. ${error.message}`);
  process.exitCode = 1;
}
