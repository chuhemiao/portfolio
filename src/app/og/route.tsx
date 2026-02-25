import { DATA } from '@/data/resume';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || DATA.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at 20% 20%, #1f2937 0%, #111827 30%, #020617 100%)',
          color: '#f8fafc',
          padding: '64px'
        }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid rgba(248, 250, 252, 0.35)',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: 24
          }}>
          kkdemian.com
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 70,
              lineHeight: 1.1,
              margin: 0,
              maxWidth: 1050
            }}>
            {title}
          </h1>
          <p style={{ fontSize: 30, opacity: 0.9, margin: 0 }}>
            Web3 Product Engineer - Crypto Research - Builder
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
