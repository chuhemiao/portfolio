'use client';

import BlurFade from '@/components/magicui/blur-fade';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';

interface Thought {
  id: string;
  text: string;
  date: string;
  timestamp: number;
}

function parseLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 hover:underline'
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function ThoughtsList({ thoughts }: { thoughts: Thought[] }) {
  const [visible, setVisible] = useState(10);
  const hasMore = visible < thoughts.length;

  return (
    <>
      <div className='space-y-4'>
        {thoughts.slice(0, visible).map((t, i) => (
          <BlurFade key={t.id} delay={0.08 + i * 0.05}>
            <div className='rounded-lg border p-4'>
              <p className='text-sm leading-7'>{parseLinks(t.text)}</p>
              <p className='text-xs text-muted-foreground text-right mt-2'>
                {format(new Date(t.date), 'M月d日', { locale: zhCN })}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisible(v => v + 10)}
          className='w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          加载更多 ({thoughts.length - visible} 条)
        </button>
      )}
    </>
  );
}
