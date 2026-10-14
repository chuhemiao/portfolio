import fs from 'node:fs/promises';

import matter from 'gray-matter';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

function rehypeMermaid() {
  return (tree) => {
    function walk(node) {
      if (node.children) {
        for (const child of node.children) {
          if (
            child.type === 'element' &&
            child.tagName === 'pre' &&
            child.children?.length === 1 &&
            child.children[0].tagName === 'code'
          ) {
            const code = child.children[0];
            const className = code.properties?.className || [];
            if (className.includes('language-mermaid')) {
              const text = code.children[0]?.value || '';
              child.properties = { className: ['mermaid'] };
              child.children = [{ type: 'text', value: text }];
            }
          }
          walk(child);
        }
      }
    }
    walk(tree);
  };
}

function generateId(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}_\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function headingText(node) {
  if (node.type === 'html') return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'image') return node.alt ?? '';
  if (node.type === 'element' && node.tagName === 'img') return node.properties?.alt ?? '';
  return (node.children ?? []).map(headingText).join('');
}

function headingIds() {
  const used = new Set();
  return (text) => {
    const base = generateId(text) || 'section';
    let id = base;
    let suffix = 0;
    while (used.has(id)) id = `${base}-${++suffix}`;
    used.add(id);
    return id;
  };
}

function rehypeHeadingIds() {
  return (tree) => {
    const nextId = headingIds();
    function walk(node) {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName) && !node.properties?.id) {
        node.properties = { ...node.properties, id: nextId(headingText(node)) };
      }
      for (const child of node.children ?? []) walk(child);
    }
    walk(tree);
  };
}

let processor = null;

function getProcessor() {
  if (!processor) {
    processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeHeadingIds)
      .use(rehypeMermaid)
      .use(rehypePrettyCode, {
        // https://rehype-pretty.pages.dev/#usage
        theme: {
          light: 'min-light',
          dark: 'min-dark'
        },
        keepBackground: false
      })
      .use(rehypeStringify)
      .freeze();
  }

  return processor;
}

export async function markdownToHTML(markdown) {
  const p = await getProcessor().process(markdown);
  return p.toString();
}

export function extractToc(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const toc = [];
  const nextId = headingIds();
  function walk(node) {
    if (node.type === 'heading') {
      const text = headingText(node);
      toc.push({ id: nextId(text), text, level: node.depth });
    }
    for (const child of node.children ?? []) walk(child);
  }
  walk(tree);
  return toc;
}

export async function compilePostFile(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const { content: rawContent, data } = matter(source);
  const [html, toc] = [await markdownToHTML(rawContent), extractToc(rawContent)];
  return { html, toc, data };
}
