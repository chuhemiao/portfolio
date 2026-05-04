import { NextRequest, NextResponse } from 'next/server';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // If RESEND_API_KEY is set, add to Resend audience
  const resendKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (resendKey && audienceId) {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[subscribe] Resend error:', res.status, JSON.stringify(err));
      // Already subscribed is not an error
      if ((err as { name?: string }).name !== 'contact_already_exists') {
        return NextResponse.json({ error: 'Failed to subscribe, please try again.', _debug: err }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
