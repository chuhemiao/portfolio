'use client';

import BlurFade from '@/components/magicui/blur-fade';
import { useI18n } from '@/components/locale-provider';
import { formatLocaleDate, type Locale } from '@/lib/i18n';
import { useState } from 'react';

interface ThoughtImage {
  src: string;
  width: number;
  height: number;
}

interface Thought {
  id: string;
  text: string;
  date: string;
  timestamp: number;
  language: Locale;
  fallbackOriginal: boolean;
  images?: ThoughtImage[];
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
  const { locale, t: translate } = useI18n();
  const [visible, setVisible] = useState(10);
  const hasMore = visible < thoughts.length;

  return (
    <>
      <div className='space-y-4'>
        {thoughts.slice(0, visible).map((t, i) => (
          <BlurFade key={t.id} delay={0.08 + i * 0.05}>
            <div className='rounded-lg border p-4'>
              {t.fallbackOriginal && <p className='mb-2 text-xs text-muted-foreground'>{translate('Translation pending · original message', '译文待补充 · 显示原文', '翻訳準備中 · 原文を表示')}</p>}
              {t.text.trim() && <p lang={t.language} className='text-sm leading-7 whitespace-pre-line'>{parseLinks(t.text)}</p>}
              {t.images && t.images.length > 0 && (
                <div className={`grid gap-2 ${t.text.trim() ? 'mt-3' : ''} ${t.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {t.images.map(image => (
                    <img
                      key={image.src}
                      src={image.src}
                      width={image.width}
                      height={image.height}
                      alt=''
                      loading='lazy'
                      className='w-full h-auto rounded-sm border'
                    />
                  ))}
                </div>
              )}
              <p className='text-xs text-muted-foreground text-right mt-2'>
                {formatLocaleDate(t.date, locale, { year: undefined, month: 'short', day: 'numeric' })}
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
          {translate(`Load more (${thoughts.length - visible} remaining)`, `加载更多（剩余 ${thoughts.length - visible} 条）`, `さらに表示（残り ${thoughts.length - visible} 件）`)}
        </button>
      )}
    </>
  );
}
