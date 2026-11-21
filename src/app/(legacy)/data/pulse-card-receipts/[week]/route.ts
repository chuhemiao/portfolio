import archive from '@/data/pulse-card-weekly.json';
import { addCardDays, readCardWeeks, summarizeCardReceipts } from '@/lib/card-weekly';

export const dynamic = 'force-static';
export const dynamicParams = false;

const editions = readCardWeeks(archive);

export function generateStaticParams() {
  return editions.flatMap(({ weekStart, comparisonReceipts }) => [
    { week: `${weekStart}.json` },
    ...(comparisonReceipts?.length ? [{ week: `${addCardDays(weekStart, -7)}.json` }] : []),
  ]);
}

export async function GET(_: Request, context: { params: Promise<{ week: string }> }) {
  const { week } = await context.params;
  const start = /^(\d{4}-\d{2}-\d{2})\.json$/.exec(week)?.[1];
  if (!start) return new Response(null, { status: 404 });

  const report = editions.find(({ weekStart }) => weekStart === start);
  if (report) return Response.json({ weekStart: start, weekEnd: report.weekEnd, receipts: summarizeCardReceipts(report).settlements });

  const comparison = editions.find(({ weekStart, comparisonReceipts }) => comparisonReceipts?.length && addCardDays(weekStart, -7) === start);
  return comparison ? Response.json({ weekStart: start, weekEnd: comparison.weekStart, receipts: summarizeCardReceipts(comparison).comparisonSettlements })
    : new Response(null, { status: 404 });
}
