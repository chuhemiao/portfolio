```skill
---
name: portfolio-research-map-builder
description: Use when adding, upgrading, auditing, or syncing kkdemian portfolio Research Map content. Covers local and user-provided crypto data, local duplicate checks, MDX placement, /research card sync, logo sync, depth audit, candidate backlog, and quick content creation scripts.
---

# Portfolio Research Map Builder

## First Rules

- Read `AGENTS.md` before starting.
- Use `pnpm`; do not use npm or yarn.
- For crypto data refresh, default to user-provided material, repository data, CoinGecko, CMC, explorers, exchanges, DefiLlama, official docs, and web search.
- Do not call Surf unless the user explicitly requests it.
- Do not create duplicate Research Map entries. Check local coverage before writing.
- For a separate research article about a project already in the registry, set `researchProjectSlug` to the canonical project's slug. The article remains publishable under `/research`, while registry generation keeps one project entry.

## Multilingual Content

- New Blog, Research, and Thoughts articles default to complete `zh-CN`, `en`, and `ja` versions in the same task, including titles, summaries, full bodies, chart labels, and source limitations. Empty scaffolds or summary-only translations do not complete a new publication. Follow an explicit user scope override when given.
- Supported article languages are `zh-CN`, `en`, and `ja`. Legacy `zh`, `en-US`, and `ja-JP` metadata is normalized at build time. Set `language` explicitly for new content, especially Japanese text without kana.
- Keep one MDX file per language. Existing `translationSlug` pairs and matching `-en` / `-ja` / `-zh-CN` suffixes remain supported.
- Use the same stable `translationKey` for all language variants. The original article can keep its existing slug. Set `sourceSlug` to that original slug when variants use unrelated slugs or the original is ambiguous.
- Example: an original `bitcoin-research` article with `language: en` and `translationKey: bitcoin-research` may have `bitcoin-research-zh-CN` and `bitcoin-research-ja` variants with the same key. A Chinese original and its existing `-en` translation need no metadata migration.
- Only published variants appear in article language links. Missing translations fall back to the original article's actual language. Related articles exclude other variants of the same article, and topic membership is shared across a translation group.
- Research registry generation keeps the original article once per translation group, regardless of original language. Keep `researchProjectSlug` on topical report originals to exclude an additional project entry.
- The site supports all three UI languages independently of historical article translation coverage; changing UI language does not translate article bodies.
- Blog, home, and topic lists select one actual translation per group for the current locale. `?lang=all` exposes all variants explicitly; locale filters never treat a source fallback as a translated body.
- `pnpm content:translate:research -- --write --report` creates fully supported offline template translations only. Unmatched prose stays pending in `scripts/lib/translations/research-template-status.json`; existing translations are preserved. Use `--check --report` to validate after dictionary changes.
- Generated translations bind `translationSourceHash` to the original MDX. Content validation and builds reject stale hashes; source updates require translation review. This template report covers only its own source family, not all historical article coverage.

```bash
pnpm quick:add -- "日本語の記事" --language ja
pnpm quick:add -- "Translated research" --category research --language en --translation-key bitcoin-research --source-slug bitcoin-research
pnpm content:check
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test scripts/lib/content/tests/multilingual.test.mjs
pnpm content:build
```

## Current State

As of 2026-07-07:

- Registry: 2811 local research projects.
- Candidate pool: 3815 total; 381 pending new candidates.
- Upgrade queue: 0 reports currently in the latest generated depth queue.
- Latest target-1000 CMC/CGO batch: 1000/1000 recent reports pass full-depth audit.
- Raw pending candidates may include older targets now covered by registry; use `scripts/generate-cmc-cgo-research-batch.mjs --from-pending --list-only` as the write queue.
- The latest generated depth queue has no pending upgrade reports.
- Data-quality note: the latest target-1000 run generated 1000 reports after Surf returned `PAID_BALANCE_ZERO` and CoinGecko APIs returned `429 Too Many Requests`; DefiLlama protocol list was used as fallback candidate expansion. They are acceptable for structural coverage but should be live-data refreshed before high-conviction publication reuse.
- The old `research-map-builder` installed skill path is not present in the current Codex skill directories; this file is the repo-local workflow reference.

## Quick Commands

```bash
pnpm quick:add -- "A short idea for a post" --category thoughts
pnpm quick:add -- "Deep research on USDa stablecoin risk" --category research
pnpm quick:add -- "Deep research on USDa stablecoin risk" --category research --write

pnpm new:post -- "A deep research report about BTC and macro liquidity" --category research
pnpm sync:research:registry -- --check "USDa USDA"
pnpm sync:research:registry -- --next 10
pnpm status:research:run
pnpm sync:research --add
pnpm audit:research:depth -- --limit 100 --write
pnpm check:research:logos
pnpm content:check

node scripts/generate-cmc-cgo-research-batch.mjs --from-pending --target-count=100 --list-only
node scripts/generate-cmc-cgo-research-batch.mjs --from-pending --target-count=100
```

`pnpm quick:add` defaults to dry-run. Add `--write` to create the MDX file. For research posts, pass `--sync-research` only when you want it to run `pnpm sync:research --add` immediately after writing.

`generate-cmc-cgo-research-batch.mjs` is the current batch writer for CMC/CGO-oriented candidates. It performs registry filtering before selection, gives Surf child commands a bounded timeout and credit-error short-circuit, handles non-Latin slug fallback, and can use an opt-in CoinGecko API fallback when Surf has no data or credit. Candidate seeding supports Surf, CoinGecko markets/list, and DefiLlama fallback.

## Add New Research

1. Check local duplicates:

   ```bash
   pnpm sync:research:registry -- --check "Project Symbol"
   ```

2. If no high-confidence match exists, refresh live data:

   ```bash
   surf list-operations
   surf <operation> --help
   ```

3. Create or edit the MDX under `content/blog/YYYY/research/`.

4. Connect it to `/research`:

   ```bash
   pnpm sync:research --add
   pnpm check:research:logos
   ```

5. Validate depth and project health:

   ```bash
   pnpm audit:research:depth -- --limit 100 --write
   pnpm exec tsc --noEmit
   git diff --check
   ```

## Upgrade Existing Research

1. Pick from the upgrade queue:

   ```bash
   pnpm status:research:run
   ```

2. Refresh current data with Surf and primary sources.

3. Upgrade the MDX to full-depth format. Required sections include pre-screen decision, TL;DR, project overview, research question, architecture/mechanism, market intelligence, economics/value capture, tokenomics, team/funding/governance, competition, catalysts, risk matrix, valuation, bull/base/bear, confidence score, red-team check, monitoring dashboard, follow-up triggers, and final investment view.

4. Audit the result:

   ```bash
   pnpm audit:research:depth -- --limit 100 --write
   ```

Full-depth pass target: at least 6000 English words or comparable CJK length, 20 independent evidence links, 18 table lines, and no more than one missing required section.

## Candidate Pool

- `data/research-map/candidates.json` is the backlog for not-yet-researched projects.
- `data/research-map/registry.json` is generated local coverage and duplicate lookup.
- `data/research-map/depth-upgrade-queue.json` is generated upgrade debt for already-published research.
- `pnpm sync:research:registry` does local registry and candidate status sync only; it should not call live market APIs.
- `pnpm seed:research:candidates` expands backlog from market-ranking sources and should be used deliberately.
```
