```skill
---
name: portfolio-research-map-builder
description: Use when adding, upgrading, auditing, or syncing kkdemian portfolio Research Map content. Covers Surf-first crypto data refresh, local duplicate checks, MDX placement, /research card sync, logo sync, depth audit, candidate backlog, and quick content creation scripts.
---

# Portfolio Research Map Builder

## First Rules

- Read `AGENTS.md` before starting.
- Use `pnpm`; do not use npm or yarn.
- For crypto data refresh, use Surf first: run `surf list-operations`, then the target command `--help`, then collect fresh market, listing, tokenomics, social, DeFi, on-chain, or research data.
- Use CoinGecko, CMC, explorers, exchanges, DefiLlama, official docs, and web search only when Surf has no data, errors, or the user explicitly asks for another source.
- Do not create duplicate Research Map entries. Check local coverage before writing.

## Current State

As of 2026-07-06:

- Registry: 511 local research projects.
- Candidate pool: 357 total; 59 pending new candidates.
- Upgrade queue: 0 reports currently in the latest generated depth queue.
- Next new candidates begin with `Genius / GENIUS`, `Data Network / DATA`, and `Midas mF-ONE / MF-ONE`.
- The latest generated depth queue has no pending upgrade reports.
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
```

`pnpm quick:add` defaults to dry-run. Add `--write` to create the MDX file. For research posts, pass `--sync-research` only when you want it to run `pnpm sync:research --add` immediately after writing.

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
