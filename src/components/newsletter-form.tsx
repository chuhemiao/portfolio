'use client';

import { useI18n } from '@/components/locale-provider';
import { useState } from 'react';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';

export default function NewsletterForm() {
  const { t } = useI18n();
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
      await res.json();
      if (!res.ok) {
        setError(res.status === 400 ? t('Enter a valid email address.', '请输入有效邮箱地址。', '有効なメールアドレスを入力してください。') : t('Subscription failed. Please try again.', '订阅失败，请重试。', '登録できませんでした。もう一度お試しください。'));
        setStatus('error');
      } else {
        setStatus('done');
      }
    } catch {
      setError(t('Network error, please try again.', '网络错误，请重试。', '通信エラーです。もう一度お試しください。'));
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className='flex items-center gap-2 text-sm text-positive'>
        <CheckIcon className='size-4' />
        <span>{t("Subscribed! You'll hear from me soon.", '订阅成功！稍后将收到更新。', '登録しました！更新をお届けします。')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-wrap items-center gap-2'>
      <input
        type='email'
        required
        aria-label={t('Email address', '邮箱地址', 'メールアドレス')}
        placeholder='your@email.com'
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={status === 'loading'}
        className='h-11 min-w-0 flex-1 rounded border border-border-strong bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-subtle focus:border-brand disabled:opacity-50'
      />
      <button
        type='submit'
        disabled={status === 'loading'}
        className='inline-flex h-11 shrink-0 items-center gap-1.5 rounded bg-brand px-5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50'>
        {status === 'loading' ? t('Subscribing…', '订阅中…', '登録中…') : <><span>{t('Subscribe', '订阅', '登録')}</span><ArrowRightIcon className='size-3' /></>}
      </button>
      {status === 'error' && <p role='alert' className='w-full text-xs text-negative'>{error}</p>}
    </form>
  );
}
