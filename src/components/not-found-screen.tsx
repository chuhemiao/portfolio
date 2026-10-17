'use client';

import Link from 'next/link';
import { useI18n } from '@/components/locale-provider';

export default function NotFoundScreen() {
  const { t, href } = useI18n();
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 pb-dock-safe text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">{t('Page not found', '页面不存在', 'ページが見つかりません')}</h1>
      <p className="text-sm text-muted-foreground">{t('This page or translation is not available.', '此页面或译文尚不可用。', 'このページまたは翻訳は利用できません。')}</p>
      <Link href={href('/')} className="rounded-sm border px-4 py-2 text-sm">{t('Back to home', '返回首页', 'ホームに戻る')}</Link>
    </main>
  );
}
