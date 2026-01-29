'use client';

import { useEffect, useState } from 'react';
import { TocItem } from '@/data/blog';

interface TableOfContentsProps {
  toc: TocItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      }
    );

    const headings = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (toc.length === 0) return null;

  const minLevel = Math.min(...toc.map((item) => item.level));

  return (
    <aside className="hidden min-[1400px]:block fixed top-24 max-h-[calc(100vh-6rem)] overflow-y-auto w-44 right-[calc(50%+350px)]">
      <div className="border-l-2 border-border/50 pl-3">
        <h2 className="text-xs font-medium uppercase tracking-wider mb-3 text-muted-foreground">
          On this page
        </h2>
        <ul className="space-y-1">
          {toc.map((item, index) => {
            const indent = (item.level - minLevel) * 6;
            return (
              <li key={index} style={{ paddingLeft: `${indent}px` }}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block py-0.5 leading-snug transition-colors hover:text-foreground line-clamp-2 text-xs ${
                    activeId === item.id
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
