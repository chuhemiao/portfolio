# Getting Started Locally

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/dillionverma/portfolio
   ```

2. Move to the cloned directory

   ```bash
   cd portfolio
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the local Server:

   ```bash
   pnpm dev
   ```

5. Open the [Config file](./src/data/resume.tsx) and make changes

## Content Management

- You can organize posts in nested folders under `content/blog/` (for example: `content/blog/2026/research/`).
- Legacy root files in `content/*.mdx` are still supported for compatibility.
- Keep public URL stable with frontmatter `slug`:

  ```md
  ---
  title: 'Post title'
  publishedAt: '2026-02-25'
  summary: 'One line summary'
  slug: 'coinbase-report-2026'
  category: 'research'
  ---
  ```

- Routes stay as `/blog/[slug]` even if the file moves to a different folder.
- Draft posts can be excluded from publish by either:
  - placing files in a `drafts` or `_drafts` directory, or
  - setting `draft: true` or `status: 'draft'` in frontmatter.
- Validate content before release:

  ```bash
  pnpm content:check
  ```

- One-time batch organize existing root files:

  ```bash
  pnpm content:organize
  ```

- Create a new post from your description (auto category + slug + path):

  ```bash
  pnpm new:post -- "A deep research report about BTC and macro liquidity in 2026"
  ```

- Optional flags for `new:post`: `--title`, `--category`, `--date`, `--slug`, `--dry-run`
- For non-Latin descriptions, slug falls back to `post-YYYYMMDD-xxxxxx`. Use `--slug` if you want a custom SEO slug.

# License

Licensed under the [MIT license](https://github.com/dillionverma/portfolio/blob/main/LICENSE.md).
