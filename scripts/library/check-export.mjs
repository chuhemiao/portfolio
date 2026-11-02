import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { readCurrentLibrary } from './public-reader.mjs';
import { resolveGeneratedDir } from '../lib/content/paths.mjs';
import { countInitialHeaderLanguageMenus } from '../lib/export-html.mjs';

const root = process.cwd();
const reportPath = process.argv[2];
if (!reportPath) throw new Error('Usage: node scripts/library/check-export.mjs REPORT_JSON');
const out = path.join(root, 'out');
const snapshot = await readCurrentLibrary(root);
const locales = ['zh-CN', 'en', 'ja'];
const details = snapshot.items.filter(item => item.detail_enabled);
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[char]);
const fileFor = route => path.join(out, `${decodeURIComponent(route).replace(/^\//u, '') || 'index'}.html`);
const failures = [];
const record = { schema_version: 'library-export-check/v1', recorded_at: new Date().toISOString(), snapshot_id: snapshot.manifest.snapshot_id, detail_items: details.length, library_html_count: 0, canonical_detail_urls: 0, checked_editorial_bodies: 0, checked_library_local_links: 0, library_html_bytes: {}, files: {}, failures };
const check = (condition, message) => { if (!condition) failures.push(message); };
const serializedPrivateCatalog = bytes => /(?:\bfield_provenance|["']field_provenance["'])\s*:|expected_catalog_hash|(?:\bactor_cluster_ref|["']actor_cluster_ref["'])\s*:/u.test(bytes.toString());
assert.equal(serializedPrivateCatalog('if ("field_provenance" in item) throw Error("Private catalog refused")'), false);
assert.equal(serializedPrivateCatalog('{"field_provenance":{"original_title":{"origin_source_id":"private"}}}'), true);
assert.equal(serializedPrivateCatalog('const item={field_provenance:{origin:"private"}}'), true);
record.private_js_oracle_controls = { public_rejection_guard_allowed: true, serialized_private_json_refused: true, serialized_private_object_refused: true };

record.library_namespaces = [];
for (const prefix of ['', '/zh-CN', '/en', '/ja']) {
  const directory = path.join(out, prefix.slice(1), 'library');
  const actual = (await fs.readdir(path.join(directory, 'items'))).filter(name => name.endsWith('.html')).sort();
  assert.deepEqual(actual, details.map(item => `${item.slug}.html`).sort(), `unexpected or missing detail routes in ${prefix || 'legacy'}`);
  record.library_namespaces.push({ prefix: prefix || 'legacy', list_html: 1, detail_html: actual.length, shared_slugs: details.length });
}

for (const locale of locales) for (const item of [null, ...details]) {
  const suffix = item ? `/items/${item.slug}` : '';
  const canonical = `https://kkdemian.com/${locale}/library${suffix}`;
  const html = await fs.readFile(fileFor(`/${locale}/library${suffix}`), 'utf8');
  record.library_html_count++; record.library_html_bytes[`/${locale}/library${suffix}`] = Buffer.byteLength(html);
  check(html.includes(`<html lang="${locale}"`), `wrong html lang: ${canonical}`);
  check(html.includes(`rel="canonical" href="${canonical}"`), `wrong canonical: ${canonical}`);
  check(html.includes('<meta name="referrer" content="no-referrer"'), `missing no-referrer: ${canonical}`);
  check(html.includes(`<meta name="robots" content="${item ? 'index' : 'noindex'}, follow"`), `wrong robots: ${canonical}`);
  for (const language of locales) check(new RegExp(`<link rel="alternate" href[Ll]ang="${language}" href="https://kkdemian.com/${language}/library${suffix}"`, 'u').test(html), `wrong alternate ${language}: ${canonical}`);
  check(!/googletagmanager\.com\/gtag|gtag\('config'/u.test(html), `GA initialized in HTML: ${canonical}`);
  check(!/field_provenance|actor_cluster_ref|expected_catalog_hash|reviewer_id/u.test(html), `private catalog field in HTML: ${canonical}`);
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gu, '');
  check(countInitialHeaderLanguageMenus(markup) === 1, `wrong initial header language menu count: ${canonical}`);
  if (item) {
    for (const paragraph of snapshot.details[item.id].locales[locale].editorial_body.split(/\n\n/u)) check(html.includes(escapeHtml(paragraph)), `missing full body paragraph: ${locale}/${item.id}`);
    record.checked_editorial_bodies++;
  } else check((markup.match(/<h3\b[^>]*>[\s\S]*?<a\b[^>]*href="\/(?:en|ja|zh-CN)\/library\/items\//gu) ?? []).length === Math.min(20, details.length), `list is not statically readable: ${locale}`);
  for (const [, rawHref] of markup.matchAll(/href="(\/(?:zh-CN|en|ja)(?:\/[^"?#]*)?)(?:[?#][^"]*)?"/gu)) {
    check(await fs.stat(fileFor(rawHref)).then(stat => stat.isFile()).catch(() => false), `broken Library local link: ${rawHref}`);
    record.checked_library_local_links++;
  }
}
for (const item of [null, ...details]) {
  const suffix = item ? `/items/${item.slug}` : '';
  const html = await fs.readFile(fileFor(`/library${suffix}`), 'utf8');
  check(html.includes(`rel="canonical" href="https://kkdemian.com/en/library${suffix}"`), `legacy canonical mismatch: ${suffix}`);
  check(html.includes('<meta name="referrer" content="no-referrer"'), `legacy referrer mismatch: ${suffix}`);
  record.library_html_count++;
}

const exportedManifest = JSON.parse(await fs.readFile(path.join(out, 'data/library/v1/manifest.json')));
check(exportedManifest.snapshot_id === snapshot.manifest.snapshot_id, 'exported snapshot identity differs from current policy-qualified snapshot');
for (const [name, info] of Object.entries(snapshot.manifest.files)) {
  const bytes = await fs.readFile(path.join(out, 'data/library/v1/snapshots', snapshot.manifest.snapshot_id, name));
  check(createHash('sha256').update(bytes).digest('hex') === info.sha256, `exported data hash mismatch: ${name}`);
}
const sitemapNames = (await fs.readdir(path.join(out, 'sitemaps'))).filter(name => /^library-\d{4}\.xml$/u.test(name));
const urls = [];
for (const name of sitemapNames) urls.push(...[...(await fs.readFile(path.join(out, 'sitemaps', name), 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/gu)].map(([, url]) => url));
assert.deepEqual(urls.sort(), details.flatMap(item => locales.map(locale => `https://kkdemian.com/${locale}/library/items/${item.slug}`)).sort());
record.canonical_detail_urls = urls.length;

const index = JSON.parse(await fs.readFile(path.join(resolveGeneratedDir(root), 'blog-index.json')));
record.canonical_articles = index.posts.length; record.legacy_article_redirects = 0;
for (const post of index.posts) {
  check(await fs.stat(fileFor(`/${post.language}/blog/${post.slug}`)).then(stat => stat.isFile()).catch(() => false), `missing old article: ${post.slug}`);
  const html = await fs.readFile(fileFor(`/blog/${post.slug}`), 'utf8');
  check(html.includes('http-equiv="refresh"') && html.includes('location.replace('), `missing legacy redirect behavior: ${post.slug}`);
  record.legacy_article_redirects++;
}

const digest = createHash('sha256');
async function walk(directory) {
  for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { await walk(filename); continue; }
    if (!entry.isFile()) continue;
    const bytes = await fs.readFile(filename); const relative = path.relative(out, filename);
    const ext = path.extname(entry.name) || '(none)'; const value = record.files[ext] ??= { count: 0, bytes: 0, individual_gzip_bytes: 0 };
    value.count++; value.bytes += bytes.length;
    if (['.js', '.json', '.html', '.txt'].includes(ext)) value.individual_gzip_bytes += gzipSync(bytes).length;
    digest.update(relative + '\0' + createHash('sha256').update(bytes).digest('hex') + '\n');
    if (ext === '.js') check(!serializedPrivateCatalog(bytes), `serialized private catalog found in shipped JS: ${relative}`);
  }
}
await walk(out);
record.artifact_file_map_sha256 = digest.digest('hex');
record.status = failures.length ? 'failed' : 'passed';
record.limits = ['Static artifact checks; browser network, focus, layout and deployment caches are separate.', 'Artifact digest binds this particular build; Next build IDs and snapshot clocks are not claimed byte-reproducible across rebuilds.'];
await fs.writeFile(reportPath, JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ status: record.status, library_html_count: record.library_html_count, canonical_detail_urls: record.canonical_detail_urls, checked_editorial_bodies: record.checked_editorial_bodies, canonical_articles: record.canonical_articles, legacy_article_redirects: record.legacy_article_redirects, artifact_file_map_sha256: record.artifact_file_map_sha256, failures }));
process.exitCode = failures.length ? 1 : 0;
