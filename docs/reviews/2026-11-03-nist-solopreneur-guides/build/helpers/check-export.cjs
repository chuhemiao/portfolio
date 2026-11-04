const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root='/vercel/portfolio',ev='/vercel/nist-evidence';
const matter=require(root+'/node_modules/gray-matter');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(ev+'/input-manifest.json','utf8'));
const paths=require(root+'/scripts/lib/content/paths.mjs');
const index=JSON.parse(fs.readFileSync(paths.BLOG_INDEX_FILE,'utf8'));
const posts=index.posts;
if(!Array.isArray(posts))throw new Error('Expected generated posts array');
const check=(v,m)=>{if(!v)throw new Error(m)};
const urlpath=s=>new URL(s,'https://kkdemian.com').pathname.replace(/\/$/,'');
const outfile=href=>{const p=root+'/out'+urlpath(href);return [p+'/index.html',p+'.html'].find(f=>fs.existsSync(f))};
const getAttr=(s,a)=>s.match(new RegExp('\\b'+a+'="([^"]*)"','i'))?.[1];
const rows=[];
for(const f of manifest.files){
 const input=fs.readFileSync(root+'/'+f.path);check(sha(input)===f.sha256,'Changed input '+f.path);
 const p=posts.find(p=>p.sourcePath===f.path);check(p,'Missing generated index post '+f.path);
 const parsed=matter(input.toString('utf8'));check(p.language===parsed.data.language,'Language mismatch');
 check(Object.keys(p.translations).length===3,'Translation coverage '+p.slug);
 const href='/'+p.language+'/blog/'+p.slug, file=outfile(href);check(file,'Missing canonical HTML '+href);
 const html=fs.readFileSync(file,'utf8'), body=fs.readFileSync(paths.artifactHtmlPath(p.artifact),'utf8');
 check(body.length>500,'Unexpected empty/short compiled body');check(html.includes(body),'Complete compiled body not present '+href);
 const canon=(html.match(/<link\b[^>]*rel="canonical"[^>]*>/i)||[])[0];check(canon&&urlpath(getAttr(canon,'href'))===href,'Canonical mismatch '+href);
 const alternates=[...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/gi)].map(m=>({locale:getAttr(m[0],'hrefLang'),href:getAttr(m[0],'href')}));
 for(const [locale,slug] of Object.entries(p.translations))check(alternates.some(a=>a.locale===locale&&urlpath(a.href)==='/'+locale+'/blog/'+slug),'Missing alternate '+locale+' '+href);
 const links=[...body.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replace(/&amp;/g,'&'));
 const sources=links.filter(h=>h.startsWith('https://csrc.nist.gov/pubs/cswp/50/')||h.startsWith('https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.50.pdf'));
 check(sources.length>=2,'Missing official source links '+href);
 const crosslinks=links.filter(h=>/^\/(zh-CN|en|ja)\/blog\/nist-solopreneur-cybersecurity-/.test(h));
 check(new Set(crosslinks).size===2,'Expected 2 series links '+href);
 for(const h of crosslinks){check(h.startsWith('/'+p.language+'/'),'Series link wrong language '+h);check(outfile(h),'Broken series link '+h)}
 const legacy=outfile('/blog/'+p.slug);check(legacy,'Missing legacy redirect '+p.slug);check(fs.readFileSync(legacy,'utf8').includes(href),'Legacy redirect missing destination '+href);
 rows.push({source:f.path,sha256:f.sha256,slug:p.slug,language:p.language,canonical:href,html_path:path.relative(root,file),html_sha256:sha(fs.readFileSync(file)),complete_compiled_body:true,compiled_body_bytes:Buffer.byteLength(body),compiled_body_sha256:sha(Buffer.from(body)),translations:p.translations,source_links:sources,series_links:crosslinks,legacy_redirect:true});
}
check(rows.length===9,'Nine guides required');check(new Set(rows.map(r=>Object.values(r.translations).sort().join('|'))).size===3,'Three translation groups required');
const tree=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.isFile())tree.push(f)}}walk(root+'/out');tree.sort();
const digest=crypto.createHash('sha256');for(const f of tree){const b=fs.readFileSync(f);digest.update(path.relative(root+'/out',f)+'\0'+b.length+'\0'+sha(b)+'\n')}
const result={status:'passed',assertion_scope:'Static-file read only; no server/browser/preview.',guide_count:9,translation_groups:3,complete_bodies:9,series_crosslinks:rows.reduce((n,r)=>n+r.series_links.length,0),out_file_count:tree.length,out_html_file_count:tree.filter(f=>f.endsWith('.html')).length,out_tree_digest_sha256:digest.digest('hex'),source_manifest_sha256:sha(fs.readFileSync(ev+'/input-manifest.json')),rows};
fs.writeFileSync(ev+'/export-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,guide_count:result.guide_count,translation_groups:result.translation_groups,out_html_file_count:result.out_html_file_count,out_tree_digest_sha256:result.out_tree_digest_sha256}));

