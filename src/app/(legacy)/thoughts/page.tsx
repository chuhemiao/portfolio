import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getTranslator, type Locale } from '@/lib/i18n';
import BlurFade from '@/components/magicui/blur-fade';
import ThoughtsList from '@/components/thoughts-list';
import { DATA } from '@/data/resume';
import { promises as fs } from 'fs';
import type { Metadata } from 'next';
import path from 'path';
import { localizeThought, type Thought, type ThoughtTranslations } from '@/lib/thought-localization';

export const metadata: Metadata = localizedPageMetadata('/thoughts', 'en', {
  title: 'Thoughts',
  description:
    'Short-form crypto market notes, observations, and fragments from kkdemian — synced from Telegram channel @kkdemian2050.',
  alternates: {
    canonical: `${DATA.url}/thoughts`
  },
  openGraph: {
    title: `Thoughts | ${DATA.name}`,
    description:
      'Short-form crypto market notes and observations from kkdemian.',
    url: `${DATA.url}/thoughts`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og.svg`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} thoughts`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Thoughts | ${DATA.name}`,
    description:
      'Short-form crypto market notes and observations from kkdemian.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og.svg`]
  }
});

async function getThoughts() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'thoughts.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { thoughts: [], lastSync: null, totalCount: 0 };
  }
}

export default async function ThoughtsPage() { return renderPage('en'); }

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const { thoughts: originals } = await getThoughts();
  let translations: ThoughtTranslations = {};
  try {
    translations = JSON.parse(await fs.readFile(path.join(process.cwd(), 'content', 'thought-translations.json'), 'utf8'));
  } catch { /* New source messages remain readable before translation. */ }
  const thoughts = originals.map((thought: Thought) => localizeThought(thought, locale, translations));

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.14),transparent_34%)]' />
      <main className='relative mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col gap-8 px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        <section id='thoughts'>
          <div className='mx-auto w-full max-w-2xl space-y-8'>
            <BlurFade delay={0.04}>
              <div className='space-y-4'>
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
                  <span className='h-1.5 w-1.5 rounded-full bg-violet-500' />
                  {t('Stream', '动态', 'ストリーム')}
                </div>
                <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>
                  {t('Thoughts', '思考', '考察')}
                </h1>
                <p className='text-[15px] leading-7 text-muted-foreground'>
                  {t('Notes and observations from kkdemian', '来自小白的碎碎念', '日々の気づきとメモ')}
                </p>
              </div>
            </BlurFade>

            {thoughts.length === 0 ? (
              <p className='text-muted-foreground text-center py-12'>
                {t('No thoughts yet.', '暂无内容', '投稿はまだありません。')}
              </p>
            ) : (
              <>
                <p className='text-xs text-muted-foreground'>{t('Messages follow the selected language. New or edited messages show their original text until translated.', '消息按所选语言显示。新增或修改的消息在译文补齐前显示原文。', '選択した言語で投稿を表示します。新規・変更された投稿は、翻訳が揃うまで原文を表示します。')}</p>
                <ThoughtsList thoughts={thoughts} />
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
