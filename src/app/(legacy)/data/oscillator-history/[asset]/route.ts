import { getOscillatorHistory, getOscillatorHistoryAssetIds } from '@/lib/oscillator-data';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return getOscillatorHistoryAssetIds().map((id) => ({ asset: `${id}.json` }));
}

export async function GET(_: Request, context: { params: Promise<{ asset: string }> }) {
  const { asset } = await context.params;
  const id = /^([a-z0-9-]+)\.json$/.exec(asset)?.[1];
  const history = id ? getOscillatorHistory(id) : null;
  return history ? Response.json(history) : new Response(null, { status: 404 });
}
