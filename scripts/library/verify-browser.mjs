import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const evidence = process.argv[2];
if (!evidence || !process.env.M4_PLAYWRIGHT_ENTRY) throw new Error('Usage: M4_PLAYWRIGHT_ENTRY=/isolated/playwright/index.mjs node scripts/library/verify-browser.mjs EVIDENCE_DIR');
const { chromium } = await import(pathToFileURL(process.env.M4_PLAYWRIGHT_ENTRY).href);
const out = path.resolve('out');
await fs.mkdir(evidence, { recursive: true });
const manifest = JSON.parse(await fs.readFile(path.join(out, 'data/library/v1/manifest.json')));
const dataRoot = path.join(out, 'data/library/v1/snapshots', manifest.snapshot_id);
const items = JSON.parse(await fs.readFile(path.join(dataRoot, 'items.json'))).data;
const ranks = JSON.parse(await fs.readFile(path.join(dataRoot, 'rankings.json'))).data;
const first = items.find(item => item.id === ranks.sorts.best[0]);
const key = 'kkdemian:library:v1';
const token = 'm4_private_98bce7d';
const source = 'http://127.0.0.1:4173';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/x-component', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, source);
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index' : pathname.replace(/^\//u, '');
    let filename = path.resolve(out, relative);
    if (!filename.startsWith(out + path.sep)) throw new Error('Invalid path');
    if (!path.extname(filename)) filename += '.html';
    let status = 200;
    let bytes;
    try { bytes = await fs.readFile(filename); } catch { filename = path.join(out, '404.html'); bytes = await fs.readFile(filename); status = 404; }
    response.writeHead(status, { 'content-type': mime[path.extname(filename)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); response.end(bytes);
  } catch { response.writeHead(400); response.end('Invalid test request'); }
});
await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
const report = { schema_version: 'library-browser-check/v1', started_at: new Date().toISOString(), snapshot_id: manifest.snapshot_id, source, browser: null, cases: [], requests: [], collectors: [], page_errors: [], console_errors: [], screenshots: [], limits: ['Internal static-artifact HTTP server; no publicly exposed port or production cookies.', 'GA collectors are aborted; outside resource links receive synthetic HTML rather than fetching third-party bodies.', 'Actual deployment CDN/header/cache policy and backend retention are not tested.'] };
let currentCase = '';
let browser;
const collector = url => /(?:google-analytics\.com|analytics\.google\.com)\//u.test(url);
async function context(options = {}, storageSetup) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
  ctx.setDefaultTimeout(5000); ctx.setDefaultNavigationTimeout(15000);
  await ctx.addInitScript(() => { window.__m4Document = Math.random().toString(36); window.__m4Persisted = false; addEventListener('pageshow', event => { window.__m4Persisted = event.persisted; }); });
  if (storageSetup) await ctx.addInitScript(storageSetup, { key, id: first.id, ids: items.map(item => item.id) });
  await ctx.route('**/*', async route => {
    const request = route.request(); const url = request.url();
    report.requests.push({ case: currentCase, url, method: request.method(), post: request.postData() ?? null });
    if (collector(url)) { report.collectors.push({ case: currentCase, url }); await route.abort(); return; }
    if (url.startsWith(source)) { await route.continue(); return; }
    if (url.startsWith('https://www.googletagmanager.com/gtag/js?')) { await route.continue(); return; }
    if (request.isNavigationRequest()) { report.external_navigation = { url, headers: await request.allHeaders() }; await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Synthetic external target</title><p>Browser link validation only</p>' }); return; }
    await route.abort();
  });
  ctx.on('page', page => { page.on('pageerror', error => report.page_errors.push({ case: currentCase, message: String(error) })); page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ case: currentCase, text: message.text(), location: message.location() }); }); });
  return ctx;
}
async function visit(ctx, route = '/en/library') { const page = await ctx.newPage(); await page.goto(source + route); await page.getByRole('heading', { level: 1 }).waitFor(); if (route.includes('/library') && !route.includes('missing')) await page.getByRole('combobox', { name: /^(Site language|网站语言|サイトの言語)$/u }).waitFor(); return page; }
async function ready(page) { await page.getByRole('button', { name: /^Save:|^Remove saved:/u }).first().waitFor(); await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => /^(\+ Save|✓ Remove saved)/u.test(button.textContent) && !button.disabled)); }
async function noGA() { assert.equal(report.collectors.filter(row => row.case === currentCase).length, 0); assert.equal(report.requests.filter(row => row.case === currentCase && row.url.includes('googletagmanager.com')).length, 0); }
async function run(name, fn) { currentCase = name; const start = performance.now(); try { await fn(); report.cases.push({ name, status: 'passed', ms: performance.now() - start }); } catch (error) { report.cases.push({ name, status: 'failed', ms: performance.now() - start, error: String(error), stack: error.stack }); } console.log(JSON.stringify(report.cases.at(-1))); }
async function changedDocument(page, action) { const previous = await page.evaluate(() => window.__m4Document); await action(); await page.waitForFunction(old => window.__m4Document !== old, previous); }

try {
  browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] }); report.browser = browser.version();
  for (const [locale, languageName] of [['zh-CN', '网站语言'], ['en', 'Site language'], ['ja', 'サイトの言語']]) for (const width of [1440, 390]) await run(`render-${locale}-${width}`, async () => {
    const ctx = await context({ viewport: { width, height: 1000 } });
    try {
      const page = await visit(ctx, `/${locale}/library`); await page.getByRole('searchbox').waitFor(); await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.getByRole('combobox', { name: languageName, exact: true }).count(), 1);
      assert.equal(await page.getByRole('article').count(), 20);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await page.evaluate(() => document.fonts.status), 'loaded');
      const shot = `library-${locale}-${width}.png`; await page.screenshot({ path: path.join(evidence, shot), fullPage: true }); report.screenshots.push(shot);
      const detailTitle = await page.getByRole('article').first().getByRole('heading', { level: 3 }).textContent(); await page.getByRole('article').first().getByRole('heading', { level: 3 }).getByRole('link').click(); await page.waitForURL(`**/${locale}/library/items/**`); await page.getByRole('heading', { level: 1, name: detailTitle, exact: true }).waitFor();
      assert.ok(page.url().includes(`/${locale}/library/items/`)); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await noGA();
    } finally { await ctx.close(); }
  });
  await run('javascript-disabled-list-and-full-detail', async () => {
    const ctx = await context({ javaScriptEnabled: false }); try { const page = await ctx.newPage(); await page.goto(source + '/en/library'); assert.equal(await page.getByRole('article').count(), 20); await page.goto(source + `/ja/library/items/${first.slug}`); assert.ok((await page.getByRole('heading', { level: 1 }).textContent()).length > 0); assert.ok((await page.locator('main').textContent()).length > 600); await noGA(); } finally { await ctx.close(); }
  });
  await run('legacy-english-detail', async () => {
    const ctx = await context(); try { const page = await visit(ctx, `/library/items/${first.slug}`); assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), first.locales.en.title); assert.equal(await page.locator('html').getAttribute('lang'), 'en'); assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://kkdemian.com/en/library/items/${first.slug}`); await noGA(); } finally { await ctx.close(); }
  });
  await run('three-language-query-identifiers-and-explicit-empty', async () => {
    const ctx = await context(); try { const page = await ctx.newPage(); for (const locale of ['zh-CN', 'en', 'ja']) { await page.goto(source + `/${locale}/library?q=ＥＲＣ７７０２`); await page.waitForFunction(() => document.querySelectorAll('article').length === 1); assert.ok((await page.getByRole('article').textContent()).includes('7702')); await page.goto(source + `/${locale}/library?q=${encodeURIComponent('链上'.repeat(40) + ' ERC987654321')}`); await page.waitForFunction(() => document.querySelectorAll('article').length === 0); assert.ok((await page.locator('main').textContent()).includes(locale === 'en' ? 'No matching resources' : locale === 'ja' ? '条件に一致する資料はありません' : '没有匹配的资源')); } await noGA(); } finally { await ctx.close(); }
  });
  await run('filters-pagination-url-refresh-back-and-keyboard', async () => {
    const ctx = await context(); try { const page = await visit(ctx); await ready(page); await page.getByRole('group', { name: 'Resource type', exact: true }).getByText('Video', { exact: true }).click(); await page.waitForURL('**/en/library?type=video'); assert.equal(await page.getByRole('article').count(), 20); await page.reload(); await page.getByRole('radio', { name: 'Video', exact: true }).waitFor({ state: 'attached' }); await page.waitForFunction(() => document.querySelector('input[name="library-type"][value=video]').checked); await page.goBack(); await page.waitForFunction(() => document.querySelector('input[name="library-type"][value=""]').checked); await page.getByRole('link', { name: 'Page 2', exact: true }).click(); await page.waitForURL('**page=2'); await page.getByRole('searchbox').focus(); await page.keyboard.press('Tab'); assert.equal(await page.getByRole('button', { name: 'Search', exact: true }).evaluate(el => el === document.activeElement), true); await page.getByRole('button', { name: 'Reset filters', exact: true }).first().click(); await page.getByRole('combobox', { name: 'Topic', exact: true }).selectOption('l1-l2'); await page.getByRole('combobox', { name: 'Original language', exact: true }).selectOption('en'); await page.getByRole('combobox', { name: 'Publication year', exact: true }).selectOption('unknown'); await page.getByRole('combobox', { name: 'Level', exact: true }).selectOption('unknown'); await page.getByRole('combobox', { name: 'Sort', exact: true }).selectOption('recently-published'); assert.ok(page.url().includes('sort=recently-published')); await noGA(); } finally { await ctx.close(); }
  });
  await run('all-five-types-and-top-language-menu-query-hash', async () => {
    const ctx = await context(); try { const page = await visit(ctx); await ready(page); for (const name of ['Specification', 'Paper', 'Book', 'Article', 'Video']) { await page.getByRole('group', { name: 'Resource type', exact: true }).getByText(name, { exact: true }).click(); await page.waitForFunction(() => document.querySelectorAll('article').length === 20); assert.equal(await page.getByRole('article').count(), 20); } await page.goto(source + '/en/library?q=ERC7702#library-results'); await changedDocument(page, () => page.getByRole('combobox', { name: 'Site language', exact: true }).selectOption('ja')); assert.ok(page.url().includes('/ja/library?q=ERC7702#library-results')); await page.waitForFunction(() => document.querySelectorAll('article').length === 1); await noGA(); } finally { await ctx.close(); }
  });
  await run('saved-read-later-hidden-focus-refresh-cross-tab-clear', async () => {
    const ctx = await context(); try { const page = await visit(ctx); const second = await visit(ctx); await ready(page); await ready(second); const save = page.getByRole('button', { name: /^Save:/u }).first(); await save.click(); await second.getByRole('button', { name: /^Remove saved:/u }).first().waitFor(); await page.getByRole('combobox', { name: /^Reading status:/u }).first().selectOption('later'); await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('later'); assert.equal(await page.getByRole('article').count(), 1); await page.getByRole('combobox', { name: /^Reading status:/u }).first().selectOption('read'); assert.equal(await page.getByRole('heading', { name: /^Reading list/u }).evaluate(el => el === document.activeElement), true); await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('read'); assert.equal(await page.getByRole('article').count(), 1); await page.getByRole('button', { name: /^Hide:/u }).click(); assert.equal(await page.getByRole('article').count(), 0); await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('hidden'); await page.getByRole('button', { name: /^Unhide:/u }).click(); await page.reload(); await ready(page); assert.equal(await page.getByRole('button', { name: /^Remove saved:/u }).count(), 1); await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('saved'); await page.getByRole('button', { name: /^Remove saved:/u }).click(); assert.equal(await page.getByRole('heading', { name: /^Reading list/u }).evaluate(el => el === document.activeElement), true); await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('read'); assert.equal(await page.getByRole('article').count(), 1); await second.getByRole('button', { name: 'Clear local reading data', exact: true }).click(); await page.waitForFunction(() => document.querySelectorAll('article').length === 0); assert.equal(await page.evaluate(k => localStorage.getItem(k), key), null); assert.ok(!page.url().includes(first.id)); await noGA(); } finally { await ctx.close(); }
  });
  await run('browser-search-submit-to-render-latency', async () => {
    const ctx = await context(); const samples = [];
    try { const page = await ctx.newPage(); for (const locale of ['zh-CN', 'en', 'ja']) { await page.goto(source + `/${locale}/library`); await page.waitForFunction(() => [...document.querySelectorAll('button[aria-pressed]')].some(value => !value.disabled)); for (let i = 0; i < 20; i++) { const q = i % 2 ? 'm4-no-matching-resource-987654321' : 'ＥＲＣ７７０２'; await page.getByRole('searchbox').fill(q); samples.push(await page.evaluate(({ q, expected }) => new Promise((resolve, reject) => { const start = performance.now(); const timeout = setTimeout(() => reject(new Error('Result did not render within five seconds.')), 5000); document.querySelector('input[type=search]').form.requestSubmit(); const frame = () => { if (new URL(location.href).searchParams.get('q') === q && document.querySelectorAll('article').length === expected) { clearTimeout(timeout); resolve(performance.now() - start); } else requestAnimationFrame(frame); }; requestAnimationFrame(frame); }), { q, expected: i % 2 ? 0 : 1 })); } } samples.sort((a, b) => a - b); report.search_latency = { samples: samples.length, p50_ms: samples[Math.floor(samples.length / 2)], p95_ms: samples[Math.ceil(samples.length * 0.95) - 1], max_ms: samples.at(-1), scope: 'Actual browser form submit through result DOM and next animation frame; warm 100-item index, no typing or network latency; not RUM/LCP.' }; assert.ok(report.search_latency.p95_ms <= 100); await noGA(); } finally { await ctx.close(); }
  });
  for (const mode of ['denied', 'quota', 'corrupt', 'failed-clear', 'all-hidden']) await run(`storage-${mode}`, async () => {
    const ctx = await context({}, ({ key, id, ids }) => {
      if (location.origin !== 'http://127.0.0.1:4173') return; const mode = new URL(location.href).searchParams.get('m4mode') ?? sessionStorage.getItem('m4-mode'); if (mode) sessionStorage.setItem('m4-mode', mode); const nativeSet = Storage.prototype.setItem;
      if (!sessionStorage.getItem('m4-seeded')) { sessionStorage.setItem('m4-seeded', '1'); localStorage.setItem('m4-unrelated', 'keep'); if (mode === 'corrupt') nativeSet.call(localStorage, key, JSON.stringify({ version: 1, items: { [id]: { saved: true, reading: null, hidden: false }, ['lib_' + 'f'.repeat(32)]: { saved: 'bad' } } })); if (mode === 'failed-clear') nativeSet.call(localStorage, key, JSON.stringify({ version: 1, items: { [id]: { saved: true, reading: null, hidden: false } } })); if (mode === 'all-hidden') nativeSet.call(localStorage, key, JSON.stringify({ version: 1, items: Object.fromEntries(ids.map(value => [value, { saved: false, reading: null, hidden: true }])) })); }
      window.__m4NativeRemove = Storage.prototype.removeItem;
      for (const method of mode === 'denied' ? ['getItem', 'setItem', 'removeItem'] : mode === 'quota' ? ['setItem'] : mode === 'failed-clear' ? ['removeItem'] : []) { const original = Storage.prototype[method]; Storage.prototype[method] = function (value, ...args) { if (value === key) throw new DOMException('Synthetic browser storage failure', mode === 'quota' ? 'QuotaExceededError' : 'SecurityError'); return original.call(this, value, ...args); }; }
    });
    try {
      const page = await visit(ctx, `/en/library?m4mode=${mode}`); await page.getByRole('button', { name: 'Reset filters', exact: true }).first().click();
      if (mode === 'all-hidden') { assert.equal(await page.getByRole('article').count(), 0); await page.getByRole('combobox', { name: 'Local view', exact: true }).selectOption('hidden'); assert.equal(await page.getByRole('article').count(), 20); }
      else if (mode === 'corrupt') { await page.getByText(/Stored reading data could not be read/u).waitFor(); assert.equal(await page.getByRole('button', { name: /^Remove saved:/u }).count(), 0); }
      else if (mode === 'failed-clear') { await page.getByRole('button', { name: /^Remove saved:/u }).waitFor(); await page.getByRole('button', { name: 'Clear local reading data', exact: true }).click(); await page.getByText(/Previously stored data may return after refresh/u).waitFor(); assert.ok(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).items, key)); await page.reload(); await page.getByRole('button', { name: /^Remove saved:/u }).waitFor(); await page.getByRole('button', { name: 'Clear local reading data', exact: true }).click(); await page.evaluate(() => { Storage.prototype.removeItem = window.__m4NativeRemove; }); await page.getByRole('button', { name: 'Retry clearing local reading data', exact: true }).click(); assert.equal(await page.evaluate(k => localStorage.getItem(k), key), null); }
      else { await ready(page); await page.getByRole('button', { name: /^Save:/u }).first().click(); await page.getByRole('button', { name: /^Remove saved:/u }).first().waitFor(); await page.getByText(mode === 'quota' ? /Browser storage is full/u : /Browser storage is unavailable/u).waitFor(); }
      assert.equal(await page.evaluate(() => localStorage.getItem('m4-unrelated')), 'keep'); await noGA();
    } finally { await ctx.close(); }
  });
  await run('invalid-date-and-stale-facet-recovery', async () => {
    const ctx = await context(); try { const page = await visit(ctx, '/en/library?topic=retired-topic&language=fr&year=2099'); await page.getByRole('option', { name: /retired-topic \(unavailable\)/u }).waitFor({ state: 'attached' }); assert.equal(await page.getByRole('article').count(), 0); await page.getByRole('button', { name: 'Reset filters', exact: true }).first().click(); await page.getByText('Community recommendation dates', { exact: true }).click(); await page.getByLabel('From (UTC)', { exact: true }).fill('2026-11-02'); const previous = page.url(); await page.getByLabel('Through (UTC)', { exact: true }).fill('2026-01-01'); await page.getByRole('alert').filter({ hasText: 'Search or filter values were not applied.' }).waitFor(); assert.equal(page.url(), previous); await noGA(); } finally { await ctx.close(); }
  });
  await run('legacy-locales-encoded-and-unknown-slug-query-privacy', async () => {
    const ctx = await context(); try { const page = await ctx.newPage(); for (const pathname of ['/library', '/zh-CN/library', '/en/library', '/ja/library', '/%65n/%6cibrary', '/en/library/items/missing']) { await page.goto(source + pathname + '?q=' + token); await page.getByRole('heading', { level: 1 }).waitFor(); await page.waitForLoadState('domcontentloaded'); } report.global_404 = { link_count: await page.getByRole('link').count(), headings: await page.getByRole('heading').allTextContents(), behavior: 'existing generic framework 404; no site return link' }; await page.goBack(); await page.getByRole('heading', { level: 1 }).waitFor(); await noGA(); } finally { await ctx.close(); }
  });
  await run('cross-boundary-document-navigation-and-sanitized-ga-positive-control', async () => {
    const ctx = await context(); try { const page = await visit(ctx); await ready(page); const positive = page.waitForRequest(request => collector(request.url()), { timeout: 15000 }); await changedDocument(page, () => page.getByRole('banner').getByRole('link', { name: 'KKDEMIAN', exact: true }).click()); await positive; await page.waitForFunction(() => Array.isArray(window.dataLayer)); const config = await page.evaluate(() => window.dataLayer.map(value => Array.from(value)).find(value => value[0] === 'config')?.[2]); assert.ok(config); await changedDocument(page, () => page.getByRole('banner').getByRole('link', { name: 'Library', exact: true }).click()); await page.getByRole('searchbox').fill(token); await page.getByRole('button', { name: 'Search', exact: true }).click(); const afterEntry = report.collectors.length; await changedDocument(page, () => page.getByRole('banner').getByRole('link', { name: 'Search', exact: true }).click()); await page.waitForFunction(() => Array.isArray(window.dataLayer)); assert.equal(report.collectors.slice(afterEntry).some(row => row.url.includes(token)), false); await page.goto(source + '/en/library/items/missing?q=' + token); report.referrer_fixture = 'test-only native anchor added to the actual generic 404; not a product return-home control'; await page.evaluate(() => { const anchor = document.createElement('a'); anchor.href = '/en'; anchor.textContent = 'M4 synthetic native exit'; document.body.append(anchor); }); await changedDocument(page, () => page.getByRole('link', { name: 'M4 synthetic native exit', exact: true }).click()); await page.waitForFunction(() => window.dataLayer?.some(value => value[0] === 'config')); const from404 = await page.evaluate(() => window.dataLayer.map(value => Array.from(value)).find(value => value[0] === 'config')?.[2]); assert.ok(!JSON.stringify(from404).includes(token)); assert.equal(from404.page_referrer, source + '/'); report.ga_positive_control = { script_attempted: report.requests.some(row => row.case === currentCase && row.url.includes('googletagmanager.com/gtag/js')), collector_attempted: report.collectors.some(row => row.case === currentCase), config, from404 }; assert.equal(report.ga_positive_control.script_attempted, true); assert.equal(report.ga_positive_control.collector_attempted, true); } finally { await ctx.close(); }
  });
  await run('actual-browser-back-restores-library-state-and-telemetry-isolation', async () => {
    const ctx = await context(); try { const page = await visit(ctx, '/en/library?q=ERC7702'); await ready(page); await page.getByRole('button', { name: /^Save:/u }).click(); const documentId = await page.evaluate(() => window.__m4Document); await changedDocument(page, () => page.getByRole('banner').getByRole('link', { name: 'KKDEMIAN', exact: true }).click()); await page.waitForFunction(() => window.dataLayer?.some(value => value[0] === 'config')); const collectorCount = report.collectors.length; const scriptCount = report.requests.filter(row => row.url.includes('googletagmanager.com')).length; await page.goBack(); await page.getByRole('button', { name: /^Remove saved:/u }).waitFor(); assert.equal(await page.getByRole('searchbox').inputValue(), 'ERC7702'); report.back_navigation = await page.evaluate(previous => ({ persisted: window.__m4Persisted, same_document: window.__m4Document === previous, navigation_type: performance.getEntriesByType('navigation')[0]?.type }), documentId); assert.equal(report.collectors.length, collectorCount); assert.equal(report.requests.filter(row => row.url.includes('googletagmanager.com')).length, scriptCount); } finally { await ctx.close(); }
  });
  await run('topic-article-entry-mobile-exit-and-source-no-referrer-opener', async () => {
    const ctx = await context({ viewport: { width: 390, height: 1000 } }); try { const page = await ctx.newPage(); await page.goto(source + '/en'); await changedDocument(page, () => page.getByRole('contentinfo').getByRole('link', { name: 'Library', exact: true }).click()); await page.goto(source + '/en/topics/l1-l2'); await changedDocument(page, () => page.getByRole('region', { name: 'Further reading from the Library', exact: true }).getByRole('link').first().click()); await page.getByRole('heading', { level: 1 }).waitFor(); const popupPromise = page.waitForEvent('popup'); await page.getByRole('link', { name: /Open original source/u }).click(); const popup = await popupPromise; await popup.waitForLoadState(); assert.equal(await popup.evaluate(() => window.opener === null), true); assert.equal(report.external_navigation.headers.referer, undefined); await popup.close(); await changedDocument(page, () => page.getByRole('banner').getByRole('link', { name: 'Writing', exact: true }).click()); await page.goto(source + '/en/blog/eip-7702-signing-flow-from-hash-to-code-en'); await changedDocument(page, () => page.getByRole('region', { name: 'Further reading from the Library', exact: true }).getByRole('link').first().click()); assert.ok(page.url().includes('/en/library/items/')); } finally { await ctx.close(); }
  });
} finally {
  if (browser) await browser.close(); await new Promise(resolve => server.close(resolve));
  report.finished_at = new Date().toISOString(); report.status = report.browser && report.cases.length > 0 && report.cases.every(value => value.status === 'passed') && report.page_errors.length === 0 && !report.console_errors.some(value => /hydration|Hydration|Minified React error/u.test(value.text)) ? 'passed' : 'failed';
  await fs.writeFile(path.join(evidence, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, cases: report.cases.length, failed: report.cases.filter(value => value.status !== 'passed').map(value => value.name), page_errors: report.page_errors.length, console_errors: report.console_errors.length }));
}
process.exitCode = report.status === 'passed' ? 0 : 1;
