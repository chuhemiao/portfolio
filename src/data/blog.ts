import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export type Category = 'thoughts' | 'research' | 'economics' | 'philosophy' | 'investing';

export type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  category?: Category;
};

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-');
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<(h[1-6])>([^<]+)<\/h[1-6]>/g,
    (_, tag, content) => {
      const id = generateId(content);
      return `<${tag} id="${id}">${content}</${tag}>`;
    }
  );
}

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: 'min-light',
        dark: 'min-dark'
      },
      keepBackground: false
    })
    .use(rehypeStringify)
    .process(markdown);

  return addHeadingIds(p.toString());
}

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: TocItem[] = [];
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

export async function getPost(slug: string) {
  const filePath = path.join('content', `${slug}.mdx`);
  let source = fs.readFileSync(filePath, 'utf-8');
  const { content: rawContent, data: metadata } = matter(source);
  const content = await markdownToHTML(rawContent);
  const toc = extractToc(rawContent);
  return {
    source: content,
    metadata: metadata as Metadata,
    slug,
    toc
  };
}

async function getAllPosts(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return Promise.all(
    mdxFiles.map(async (file) => {
      let slug = path.basename(file, path.extname(file));
      let { metadata, source } = await getPost(slug);
      return {
        metadata: metadata as Metadata,
        slug,
        source
      };
    })
  );
}

export async function getBlogPosts() {
  return getAllPosts(path.join(process.cwd(), 'content'));
}
