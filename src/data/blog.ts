import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');
const DRAFT_DIRECTORY_NAMES = new Set(['drafts', '_drafts']);

function rehypeMermaid() {
  return (tree: any) => {
    function walk(node: any) {
      if (node.children) {
        for (const child of node.children) {
          if (
            child.type === 'element' &&
            child.tagName === 'pre' &&
            child.children?.length === 1 &&
            child.children[0].tagName === 'code'
          ) {
            const code = child.children[0];
            const className = (code.properties?.className as string[]) || [];
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

export type Category = 'thoughts' | 'research' | 'economics' | 'philosophy' | 'investing';

export type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  category?: Category;
  slug?: string;
  draft?: boolean;
  status?: string;
};

type PostIndexEntry = {
  slug: string;
  filePath: string;
};

function getMDXFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return getMDXFiles(fullPath);
    }

    if (entry.isFile() && path.extname(entry.name) === '.mdx') {
      return [fullPath];
    }

    return [];
  });
}

function getLegacyRootMDXFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.mdx')
    .map((entry) => path.join(CONTENT_DIR, entry.name));
}

function getBlogMDXFiles(): string[] {
  return [...getLegacyRootMDXFiles(), ...getMDXFiles(BLOG_CONTENT_DIR)];
}

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/^\/+|\/+$/g, '');
}

function isDraftPath(filePath: string): boolean {
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const segments = relativePath.split(path.sep).map((segment) => segment.toLowerCase());
  return segments.some((segment) => DRAFT_DIRECTORY_NAMES.has(segment));
}

function isDraftPost(metadata: Metadata, filePath: string): boolean {
  if (isDraftPath(filePath)) {
    return true;
  }

  if (metadata.draft === true) {
    return true;
  }

  if (typeof metadata.status === 'string' && metadata.status.toLowerCase() === 'draft') {
    return true;
  }

  return false;
}

function resolveSlug(filePath: string, metadata: Metadata): string {
  const fallbackSlug = path.basename(filePath, path.extname(filePath));
  const configuredSlug =
    typeof metadata.slug === 'string' && metadata.slug.length > 0
      ? metadata.slug
      : fallbackSlug;
  const slug = normalizeSlug(configuredSlug);

  if (!slug) {
    throw new Error(`Empty slug found in ${path.relative(process.cwd(), filePath)}`);
  }

  if (slug.includes('/')) {
    throw new Error(
      `Invalid slug "${slug}" in ${path.relative(process.cwd(), filePath)}. Nested slugs are not supported with /blog/[slug].`
    );
  }

  return slug;
}

function getPostIndex(includeDrafts = false): PostIndexEntry[] {
  const mdxFiles = getBlogMDXFiles();
  const slugToPath = new Map<string, string>();
  const entries: PostIndexEntry[] = [];

  for (const filePath of mdxFiles) {
    const source = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(source);
    const metadata = data as Metadata;

    if (!includeDrafts && isDraftPost(metadata, filePath)) {
      continue;
    }

    const slug = resolveSlug(filePath, metadata);
    const existingPath = slugToPath.get(slug);

    if (existingPath) {
      throw new Error(
        `Duplicate slug "${slug}" found in ${path.relative(process.cwd(), existingPath)} and ${path.relative(process.cwd(), filePath)}`
      );
    }

    slugToPath.set(slug, filePath);
    entries.push({ slug, filePath });
  }

  return entries;
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

async function parsePostFile(filePath: string, slug: string) {
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

export async function getPost(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const entry = getPostIndex().find((post) => post.slug === normalizedSlug);

  if (!entry) {
    return null;
  }

  return parsePostFile(entry.filePath, entry.slug);
}

async function getAllPosts() {
  const postIndex = getPostIndex();

  return Promise.all(
    postIndex.map(async ({ slug, filePath }) => {
      let { metadata, source } = await parsePostFile(filePath, slug);
      return {
        metadata: metadata as Metadata,
        slug,
        source
      };
    })
  );
}

export async function getBlogPosts() {
  return getAllPosts();
}
