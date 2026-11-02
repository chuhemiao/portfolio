import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const [evidence, id, slug] = process.argv.slice(2);
if (process.env.LIBRARY_CONTROLLED_VM !== '1' || !evidence || !id || !slug || !process.env.M4_PLAYWRIGHT_ENTRY) throw new Error('Controlled withdrawal browser probe requires evidence, real withdrawn ID/slug and isolated Playwright.');
const out = path.resolve('out'); const source = 'http://127.0.0.1:4175'; const key = 'kkdemian:library:v1';
const manifest = JSON.parse(await fs.readFile(path.join(out, 'data/library/v1/manifest.json'))); const valid = JSON.parse(await fs.readFile(path.join(out, 'data/library/v1/snapshots', manifest.snapshot_id, 'items.json'))).data.find(item => item.id !== id); assert.ok(valid);
const report = { schema_version: 'library-stale-state-check/v1', id, slug, preserved_id: valid.id, requests: [], statuses: [] };
const server = http.createServer(async (req, res) => {
  let filename = path.resolve(out, decodeURIComponent(new URL(req.url, source).pathname).replace(/^\//u, '') || 'index');
  if (!filename.startsWith(out + path.sep)) { res.writeHead(400); res.end(); return; } if (!path.extname(filename)) filename += '.html';
  let status = 200; let bytes; try { bytes = await fs.readFile(filename); } catch { status = 404; filename = path.join(out, '404.html'); bytes = await fs.readFile(filename); }
  res.writeHead(status, { 'content-type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/x-component', '.woff2': 'font/woff2' })[path.extname(filename)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); res.end(bytes);
});
await new Promise(resolve => server.listen(4175, '127.0.0.1', resolve)); let browser;
try {
  const { chromium } = await import(pathToFileURL(process.env.M4_PLAYWRIGHT_ENTRY).href); browser = await chromium.launch({ headless: true }); const ctx = await browser.newContext();
  await ctx.route('**/*', async route => { const url = route.request().url(); report.requests.push(url); if (url.startsWith(source)) await route.continue(); else await route.abort(); });
  await ctx.addInitScript(({ key, id, validId, source }) => { if (location.origin === source && !sessionStorage.getItem('m4-seed')) { sessionStorage.setItem('m4-seed', '1'); localStorage.setItem('m4-unrelated', 'keep'); localStorage.setItem(key, JSON.stringify({ version: 1, items: { [id]: { saved: true, reading: 'later', hidden: false }, [validId]: { saved: true, reading: 'read', hidden: false } } })); } }, { key, id, validId: valid.id, source });
  const page = await ctx.newPage(); await page.goto(source + '/en/library'); await page.getByText(/Removed or replaced resource IDs were reconciled/u).waitFor();
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key); assert.deepEqual(stored.items, { [valid.id]: { saved: true, reading: 'read', hidden: false } }); assert.equal(await page.evaluate(() => localStorage.getItem('m4-unrelated')), 'keep');
  await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('saved'); assert.equal(await page.getByRole('article').count(), 1); assert.ok((await page.getByRole('article').getByRole('heading').getByRole('link').getAttribute('href')).endsWith(valid.slug));
  for (const prefix of ['', '/en', '/zh-CN', '/ja']) { const response = await page.goto(`${source}${prefix}/library/items/${slug}?q=m4-withdrawal-private`); assert.equal(response.status(), 404); report.statuses.push({ path: prefix + '/library/items/' + slug, status: response.status() }); }
  assert.equal(report.requests.some(url => /google-analytics|analytics\.google|googletagmanager/u.test(url)), false); report.status = 'passed';
} catch (error) { report.status = 'failed'; report.error = { message: String(error), stack: error.stack }; process.exitCode = 1; }
finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); await fs.writeFile(path.join(evidence, 'stale-state-report.json'), JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify({ status: report.status, statuses: report.statuses, error: report.error })); }
