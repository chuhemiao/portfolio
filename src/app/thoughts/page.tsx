import BlurFade from '@/components/magicui/blur-fade';
import ThoughtsList from '@/components/thoughts-list';
import { promises as fs } from 'fs';
import type { Metadata } from 'next';
import path from 'path';

export const metadata: Metadata = {
  title: 'Thoughts',
  description: '我的碎碎念'
};

async function getThoughts() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'thoughts.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { thoughts: [], lastSync: null, totalCount: 0 };
  }
}

export default async function ThoughtsPage() {
  const { thoughts } = await getThoughts();

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.14),transparent_34%)]' />
      <main className='relative mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col gap-8 px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
        <section id='thoughts'>
          <div className='mx-auto w-full max-w-2xl space-y-8'>
            <BlurFade delay={0.04}>
              <div className='space-y-4'>
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
                  <span className='h-1.5 w-1.5 rounded-full bg-violet-500' />
                  Stream
                </div>
                <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>
                  Thoughts
                </h1>
                <p className='text-[15px] leading-7 text-muted-foreground'>
                  来自 kk 的碎碎念
                </p>
              </div>
            </BlurFade>

            {thoughts.length === 0 ? (
              <p className='text-muted-foreground text-center py-12'>暂无内容</p>
            ) : (
              <ThoughtsList thoughts={thoughts} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
