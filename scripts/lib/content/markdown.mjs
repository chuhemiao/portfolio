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
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-');
}

function addHeadingIds(html) {
  return html.replace(/<(h[1-6])>([^<]+)<\/h[1-6]>/g, (_, tag, content) => {
    const id = generateId(content);
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
}

let processor = null;

function getProcessor() {
  if (!processor) {
    processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
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
  return addHeadingIds(p.toString());
}

export function extractToc(markdown) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
      .replace(/\s+/g, '-');
    toc.push({ id, text, level });
  }

  return toc;
}

export async function compilePostFile(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const { content: rawContent, data } = matter(source);
  const [html, toc] = [await markdownToHTML(rawContent), extractToc(rawContent)];
  return { html, toc, data };
}
