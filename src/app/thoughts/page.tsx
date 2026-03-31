import BlurFade from '@/components/magicui/blur-fade';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Thoughts',
  description: '我的碎碎念'
};

interface Thought {
  id: string;
  text: string;
  date: string;
  timestamp: number;
}

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
    <main className='flex flex-col min-h-[100dvh] space-y-10'>
      <section id='thoughts'>
        <div className='mx-auto w-full max-w-2xl space-y-8'>
          <BlurFade delay={0.04}>
            <h1 className='text-3xl font-bold'>Thoughts</h1>
            <p className='text-muted-foreground'>来自 Telegram 的碎碎念</p>
          </BlurFade>

          {thoughts.length === 0 ? (
            <p className='text-muted-foreground text-center py-12'>暂无内容</p>
          ) : (
            <div className='space-y-4'>
              {thoughts.map((t: Thought, i: number) => (
                <BlurFade key={t.id} delay={0.08 + i * 0.05}>
                  <div className='rounded-lg border p-4 space-y-2'>
                    <p className='text-sm leading-7'>{t.text}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatDistanceToNow(new Date(t.date), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </p>
                  </div>
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
