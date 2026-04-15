import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'data', 'btc-score-cache.json');

function readCache(): object | null {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(data: object) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // non-fatal
  }
}

export async function GET() {
  try {
    const res = await fetch('https://brief.day1global.xyz/api/btc-score', {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    writeCache(data);
    return NextResponse.json(data);
  } catch {
    const cached = readCache();
    if (cached) {
      return NextResponse.json({ ...cached as object, _cached: true });
    }
    return NextResponse.json({ error: 'API unavailable and no cache found' }, { status: 503 });
  }
}
