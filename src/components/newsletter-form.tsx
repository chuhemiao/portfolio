'use client';

import { useState } from 'react';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('done');
      }
    } catch {
      setError('Network error, please try again.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className='flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400'>
        <CheckIcon className='size-4' />
        <span>Subscribed! You'll hear from me soon.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='flex items-center gap-2'>
      <input
        type='email'
        required
        placeholder='your@email.com'
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={status === 'loading'}
        className='flex-1 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-foreground/30 disabled:opacity-50'
      />
      <button
        type='submit'
        disabled={status === 'loading'}
        className='inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition hover:opacity-80 disabled:opacity-50'>
        {status === 'loading' ? 'Subscribing…' : <><span>Subscribe</span><ArrowRightIcon className='size-3' /></>}
      </button>
      {status === 'error' && <p className='text-xs text-red-500'>{error}</p>}
    </form>
  );
}
