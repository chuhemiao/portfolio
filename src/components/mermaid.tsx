'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function Mermaid() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const nodes = document.querySelectorAll('pre.mermaid');
    if (nodes.length === 0) return;

    import('mermaid').then((mod) => {
      const mermaid = mod.default;
      // Clear previous renders
      nodes.forEach((node) => {
        node.removeAttribute('data-processed');
      });
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      });
      mermaid.run({ nodes: nodes as NodeListOf<HTMLElement> });
    });
  }, [resolvedTheme]);

  return null;
}
