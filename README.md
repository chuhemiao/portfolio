# kkdemian

Personal portfolio site for [kkdemian](https://kkdemian.com) — Web3 Product Engineer, digital nomad, Bitcoin & ETH HODL.

Built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI. Deployed on Vercel.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/chuhemiao/portfolio
   cd portfolio
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Edit personal data in [`src/data/resume.tsx`](./src/data/resume.tsx)

## Pages

| Route         | Description                            |
| ------------- | -------------------------------------- |
| `/`           | Home — bio, work, projects, hackathons |
| `/blog`       | Blog posts organized by year/category  |
| `/stack`      | Tools and tech stack                   |
| `/fund`       | Fund tracker                           |
| `/fear`       | Crypto Fear & Greed index              |
| `/philosophy` | Personal philosophy                    |

## Content Management

Blog posts live under `content/blog/` and can be organized in nested folders (e.g. `content/blog/2026/research/`).

**Frontmatter:**

```md
---
title: 'Post title'
publishedAt: '2026-02-25'
summary: 'One line summary'
slug: 'my-post-slug'
category: 'research'
---
```

- Routes are always `/blog/[slug]` regardless of folder location.
- Draft posts: place in a `drafts/` or `_drafts/` folder, or set `draft: true` in frontmatter.

**Useful commands:**

```bash
# Create a new post (auto-generates category, slug, and path)
pnpm new:post -- "A deep research report about BTC and macro liquidity"

# Validate content before publishing
pnpm content:check

# One-time batch organize root-level files into year folders
pnpm content:organize
```

`new:post` supports optional flags: `--title`, `--category`, `--date`, `--slug`, `--dry-run`

## License

MIT
