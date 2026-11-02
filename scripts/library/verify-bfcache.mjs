import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const evidence = process.argv[2];
if (!evidence || !process.env.M4_PLAYWRIGHT_ENTRY) throw new Error('Requires evidence directory and isolated Playwright entry.');
const { chromium } = await import(pathToFileURL(process.env.M4_PLAYWRIGHT_ENTRY).href);
const source = 'http://127.0.0.1:4174'; const out = path.resolve('out');
const report = { schema_version: 'library-bfcache-probe/v1', started_at: new Date().toISOString(), requests: [], reasons: [], limits: ['Test-only same-origin blank exit and cacheable HTTP responses isolate the actual exported Library BFCache lifecycle.', 'This does not prove deployment cache headers or that every browser admits this document to BFCache.'] };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, source).pathname);
  if (pathname === '/__m4-away') { res.writeHead(200, { 'content-type': 'text/html', 'cache-control': 'private, max-age=600' }); res.end('<!doctype html><title>M4 lifecycle fixture</title><p>Test-only native exit</p>'); return; }
  let filename = path.resolve(out, pathname.replace(/^\//u, '') || 'index');
  if (!filename.startsWith(out + path.sep)) { res.writeHead(400); res.end(); return; }
  if (!path.extname(filename)) filename += '.html';
  try { const bytes = await fs.readFile(filename); res.writeHead(200, { 'content-type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.txt': 'text/x-component' })[path.extname(filename)] ?? 'application/octet-stream', 'cache-control': 'private, max-age=600' }); res.end(bytes); } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(4174, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ channel: 'chromium', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
  report.ignored_default_arguments = ['--disable-back-forward-cache'];
  report.effective_chromium_arguments = [];
  for (const entry of await fs.readdir('/proc')) { if (!/^\d+$/u.test(entry)) continue; try { const args = (await fs.readFile(`/proc/${entry}/cmdline`, 'utf8')).split('\0').filter(Boolean); if (args.includes('--remote-debugging-pipe')) report.effective_chromium_arguments.push(args); } catch { /* Process may exit while enumerating this disposable VM. */ } }
  assert.ok(report.effective_chromium_arguments.length > 0);
  assert.ok(report.effective_chromium_arguments.every(args => !args.includes('--disable-back-forward-cache')));
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page); await cdp.send('Network.enable'); await cdp.send('Network.setBlockedURLs', { urls: ['*google-analytics.com/*', '*analytics.google.com/*', '*googletagmanager.com/*'] }); await cdp.send('Page.enable');
  cdp.on('Page.backForwardCacheNotUsed', event => report.reasons.push(event));
  page.on('request', req => report.requests.push(req.url()));
  await ctx.addInitScript(() => { window.__m4Identity = Math.random(); window.__m4Persisted = false; addEventListener('pageshow', event => { window.__m4Persisted = event.persisted; }); });
  await page.goto(source + '/en/library?q=ERC7702'); await page.waitForFunction(() => document.querySelectorAll('article').length === 1); await page.getByRole('button', { name: /^Save:/u }).click();
  const identity = await page.evaluate(() => window.__m4Identity);
  await page.evaluate(() => { const a = document.createElement('a'); a.href = '/__m4-away'; a.textContent = 'M4 native lifecycle exit'; document.body.append(a); }); await page.getByRole('link', { name: 'M4 native lifecycle exit', exact: true }).click(); await page.waitForURL('**/__m4-away');
  const second = await ctx.newPage(); await second.goto(source + '/en/library?q=ERC7702'); await second.waitForFunction(() => document.querySelectorAll('article').length === 1); await second.getByRole('button', { name: /^Remove saved:/u }).waitFor(); await second.getByRole('button', { name: 'Clear local reading data', exact: true }).click(); await second.close();
  await page.goBack(); await page.waitForFunction(() => document.querySelectorAll('article').length === 1); await page.getByRole('button', { name: /^Save:/u }).waitFor();
  report.restoration = await page.evaluate(previous => ({ persisted: window.__m4Persisted, same_document: window.__m4Identity === previous, q: document.querySelector('input[type=search]').value, saved_count: document.querySelectorAll('button[aria-label^="Remove saved:"]').length }), identity);
  assert.equal(report.restoration.q, 'ERC7702'); assert.equal(report.restoration.saved_count, 0);
  assert.equal(report.requests.some(url => /google-analytics|analytics\.google|googletagmanager/u.test(url)), false);
  report.status = report.restoration.persisted && report.restoration.same_document ? 'passed' : 'not-observed';
} catch (error) { report.status = 'failed'; report.error = { message: String(error), stack: error.stack }; process.exitCode = 1; }
finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); await fs.writeFile(path.join(evidence, 'bfcache-report.json'), JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify({ status: report.status, restoration: report.restoration, reasons: report.reasons })); }
