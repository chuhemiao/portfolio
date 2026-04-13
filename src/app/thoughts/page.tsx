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
    <main className='mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col space-y-10 px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
      <section id='thoughts'>
        <div className='mx-auto w-full max-w-2xl space-y-8'>
          <BlurFade delay={0.04}>
            <h1 className='text-3xl font-bold'>Thoughts</h1>
            <p className='text-muted-foreground'>来自 kk 的碎碎念</p>
          </BlurFade>

          {thoughts.length === 0 ? (
            <p className='text-muted-foreground text-center py-12'>暂无内容</p>
          ) : (
            <ThoughtsList thoughts={thoughts} />
          )}
        </div>
      </section>
    </main>
  );
}
