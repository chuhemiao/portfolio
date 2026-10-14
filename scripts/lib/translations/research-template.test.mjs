import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import matter from 'gray-matter';
import { translateBlock, translateResearchSource, validateTranslation } from './research-template.mjs';
import { toIndexMetadata, buildTranslationGroups } from '../content/discovery.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const slug='yummy-yummy-defi-infrastructure-token-value-capture-risk';
const original=fs.readFileSync(path.join(root,'content/blog/2026/research',slug+'.mdx'),'utf8');
function fixture(t){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-template-translation-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  fs.mkdirSync(path.join(dir,'scripts/lib/translations'),{recursive:true});
  fs.mkdirSync(path.join(dir,'content/blog/2026/research'),{recursive:true});
  for(const name of ['research-template.mjs','research-terms.mjs','research-template-rules.json','research-extra-labels.json','research-overviews.json']){
    const source=path.join(root,'scripts/lib/translations',name);if(fs.existsSync(source))fs.copyFileSync(source,path.join(dir,'scripts/lib/translations',name));
  }
  fs.copyFileSync(path.join(root,'scripts/translate-research-content.mjs'),path.join(dir,'scripts/translate-research-content.mjs'));
  fs.symlinkSync(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
  const source=path.join(dir,'content/blog/2026/research',slug+'.mdx');fs.writeFileSync(source,original);
  const target=locale=>path.join(path.dirname(source),`${slug}-${locale}.mdx`);
  const run=(...args)=>spawnSync(process.execPath,[path.join(dir,'scripts/translate-research-content.mjs'),...args],{encoding:'utf8',cwd:dir});
  return {dir,source,target,run};
}
test('fully translates source paragraphs, 26 sections, figures and evidence links in both languages',()=>{
  for(const locale of ['zh-CN','ja']){
    const p=matter(original,{}),r=translateResearchSource(p,locale);assert.equal(r.complete,true);
    assert.equal((r.body.match(/^## /gm)||[]).length,26);
    assert.equal(r.totalBlocks,p.content.trim().split(/\n\s*\n/).length);
    validateTranslation(p.content.trim(),r.body.trim());
    assert.equal(/not disclosed|The first analytical frame|Final Investment View/.test(r.body),false);
    if(locale==='ja')assert.equal(r.body.includes('治理'),false);
    assert.ok(r.body.includes('2026-07-06'));assert.ok(r.body.includes('$2,091,616'));
  }
});
test('English source with Chinese project name groups without a duplicate Chinese locale',()=>{
  const parsed=matter(original,{});parsed.data.title=parsed.data.title.replaceAll('Yummy','吉祥马');parsed.data.summary=parsed.data.summary.replaceAll('Yummy','吉祥马');parsed.content=parsed.content.replaceAll('Yummy','吉祥马');
  const inferred={slug,...toIndexMetadata(parsed.data)};assert.equal(inferred.language,'zh-CN');
  parsed.data.language='en';const source={slug,...toIndexMetadata(parsed.data)};assert.equal(source.language,'en');
  const translations=['zh-CN','ja'].map(locale=>{const result=translateResearchSource(parsed,locale);assert.equal(result.complete,true);return {slug:`${slug}-${locale}`,...toIndexMetadata({...parsed.data,title:result.title,summary:result.summary,language:locale,translationKey:slug,sourceSlug:slug})};});
  assert.throws(()=>buildTranslationGroups([inferred,...translations]),/duplicate zh-CN language/);
  const groups=buildTranslationGroups([source,...translations]);for(const group of groups)assert.deepEqual(Object.keys(group.translations).sort(),['en','ja','zh-CN']);
});
test('all directly translated overview literals preserve figures and require an exact complete source match',()=>{
  const descriptions=JSON.parse(fs.readFileSync(path.join(root,'scripts/lib/translations/research-overviews.json'),'utf8'));
  assert.ok(Object.keys(descriptions).length>=190);
  for(const [source,translations] of Object.entries(descriptions))for(const locale of ['zh-CN','ja']){assert.ok(translations[locale]);validateTranslation(source,translations[locale]);assert.equal(translateBlock(source,locale,{}),translations[locale]);}
  assert.throws(()=>translateBlock('Wojak is a meme token on the Solana. An unreviewed new assertion.','ja',{}),/Unsupported complete block/);
});
test('known source identity mismatch remains pending with no partial translation',()=>{
  const parsed=matter(fs.readFileSync(path.join(root,'content/blog/2026/research/escoin-elg-defi-infrastructure-token-value-capture-risk.mdx'),'utf8'),{});
  for(const locale of ['zh-CN','ja']){const result=translateResearchSource(parsed,locale);assert.equal(result.complete,false);assert.match(result.pending[0].reason,/Source identity mismatch/);assert.equal(result.body,undefined);}
});
test('unknown prose, ticker mismatch and nonnumeric market data reject full publication',()=>{
  const unknown=matter(original,{});unknown.content+='\n\nThis unique claim was not translated by an agent.\n';
  assert.equal(translateResearchSource(unknown,'ja').complete,false);
  const ticker=matter(original,{});ticker.content=ticker.content.replace('whether YUMMY captures','whether OTHER captures');assert.equal(translateResearchSource(ticker,'zh-CN').complete,false);
  const malformed=matter(original,{});malformed.content=malformed.content.replace('| Price | not disclosed |','| Price | buy this asset |');assert.equal(translateResearchSource(malformed,'zh-CN').complete,false);
  assert.throws(()=>translateResearchSource(matter(original,{}),'fr'),/Unsupported target locale/);
});
test('verified taxonomy and proper market names translate, unknown facets remain pending',()=>{
  const known=matter(original,{});known.content=known.content.replace('| Tags | not disclosed |','| Tags | Governance & Treasury, RWA (Real World Assets) |').replace('| Exchanges | not disclosed |','| Exchanges | BINANCE, BYBIT |');
  for(const locale of ['zh-CN','ja']){const result=translateResearchSource(known,locale);assert.equal(result.complete,true);assert.ok(result.body.includes('BINANCE, BYBIT')); assert.equal(result.body.includes('Real World Assets'),false);}
  const unknown=matter(original,{});unknown.content=unknown.content.replace('| Tags | not disclosed |','| Tags | Pretend this unmatched claim is translated |');assert.equal(translateResearchSource(unknown,'ja').complete,false);
});
test('structured funding, team and contract facts preserve names, addresses and known roles',()=>{
  const p=matter(original,{});
  p.content=p.content.replace('| Chain | Label | Address | Explorer |\n|---|---|---|---|\n| not disclosed | not disclosed | not disclosed | not disclosed |','| Chain | Label | Address | Explorer |\n|---|---|---|---|\n| ethereum | YUMMY | 0x1111111111111111111111111111111111111111 | [explorer](https://etherscan.io/address/0x1111111111111111111111111111111111111111) |');
  p.content=p.content.replace('| Date | Round | Amount | Investors |\n|---|---|---|---|\n| not disclosed | not disclosed | not disclosed | not disclosed |','| Date | Round | Amount | Investors |\n|---|---|---|---|\n| 2024-01-02 | Seed | $1,000,000 | Example Capital |');
  p.content=p.content.replace('| Team member | Role | Link |\n|---|---|---|\n| not disclosed | not disclosed | not disclosed |','| Team member | Role | Link |\n|---|---|---|\n| Alice Example | Co-Founder, CEO | [X](https://x.com/alice) |');
  for(const locale of ['zh-CN','ja']){const r=translateResearchSource(p,locale);assert.equal(r.complete,true);assert.ok(r.body.includes('Example Capital'));assert.ok(r.body.includes('Alice Example'));assert.ok(r.body.includes('0x1111111111111111111111111111111111111111'));assert.equal(r.body.includes('Co-Founder'),false);assert.equal(r.body.includes('| Seed |'),false);validateTranslation(p.content,r.body);}
  const unsupported={...p,content:p.content.replace('Co-Founder, CEO','Untranslated novel role')};assert.equal(translateResearchSource(unsupported,'ja').complete,false);
  const invalid=matter(original,{});invalid.content=invalid.content.replace('| not disclosed | not disclosed | not disclosed | not disclosed |','| not disclosed | not disclosed | not disclosed | not disclosed | not disclosed |');assert.equal(translateResearchSource(invalid,'zh-CN').complete,false);
});
test('partially understood source-language title cannot be published as a full translation',()=>{
  const source='- [EcoCash agent hokoyo...Next week tinenge tane ma Bond Coin ...](https://example.com/source)';
  for(const locale of ['zh-CN','ja'])assert.throws(()=>translateBlock(source,locale,{}),/Source title requires direct translation/);
});
test('protected figure, URL, code, heading and table boundaries cannot change',()=>{
  const source='# Sample\n\n| Value | Link |\n|---|---|\n| 25% | [source](https://example.com/123) |\n\n`BTC`';
  for(const target of [source.replace('25%','26%'),source.replace('https://example.com/123','https://other.com/123'),source.replace('`BTC`','`ETH`'),source.replace('# Sample','## Sample'),source.replace('| 25% |','| 25% | extra |')])assert.throws(()=>validateTranslation(source,target),/Protected/);
});
test('real CLI defaults to dry-run, creates atomically and reruns without rewriting',t=>{
  const f=fixture(t);assert.equal(f.run().status,0);assert.equal(fs.existsSync(f.target('ja')),false);
  const first=f.run('--write');assert.equal(first.status,0,first.stderr);assert.equal(JSON.parse(first.stdout).created,2);
  const bytes=fs.readFileSync(f.target('ja'),'utf8');const before=fs.statSync(f.target('ja')).mtimeMs;
  assert.equal(f.run('--write').status,0);assert.equal(fs.readFileSync(f.target('ja'),'utf8'),bytes);assert.equal(fs.statSync(f.target('ja')).mtimeMs,before);
  assert.equal(f.run('--check').status,0);assert.equal(fs.readdirSync(path.dirname(f.source)).some(name=>name.endsWith('.tmp')),false);
});
test('rule expansion retains original provenance; source changes fail without overwriting',t=>{
  const f=fixture(t);assert.equal(f.run('--write').status,0);
  const target=f.target('ja');const bytes=fs.readFileSync(target,'utf8').replace(/^translationRuleHash:.+$/m,'translationRuleHash: original-rule-version');fs.writeFileSync(target,bytes);
  assert.equal(f.run('--check').status,0);assert.equal(fs.readFileSync(target,'utf8'),bytes);
  fs.writeFileSync(f.source,original.replace('$2,091,616','$2,091,617'));
  const dirty=f.run('--write');assert.equal(dirty.status,1);assert.match(dirty.stdout,/Source or translated content differs/);assert.equal(fs.readFileSync(target,'utf8'),bytes);
});
test('manual translations are preserved, and unsupported sources never publish partial bodies',t=>{
  const f=fixture(t);const manual="---\ntitle: 手工译文\nlanguage: ja\n---\n既有译者正文。\n";fs.writeFileSync(f.target('ja'),manual);
  assert.equal(f.run('--write').status,0);assert.equal(fs.readFileSync(f.target('ja'),'utf8'),manual);
  fs.rmSync(f.target('zh-CN'));fs.writeFileSync(f.source,original+'\n\nAn unsupported new factual paragraph.\n');
  const partial=f.run('--write');assert.equal(partial.status,0);assert.equal(JSON.parse(partial.stdout).pending,1);assert.equal(fs.existsSync(f.target('zh-CN')),false);
});
test('invalid invocation and path escape fail before mutation',t=>{
  const f=fixture(t);
  for(const args of [['--write','--check'],['--source','../../outside'],['--limit','0'],['--limit','NaN'],['--unknown']]){assert.equal(f.run(...args).status,1);assert.equal(fs.existsSync(f.target('ja')),false);}
});
