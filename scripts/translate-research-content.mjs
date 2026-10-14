import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { digest, translateResearchSource, translationRuleHash } from './lib/translations/research-template.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'content/blog');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.isFile()&&e.name.endsWith('.mdx')?[path.join(dir,e.name)]:[]).sort();}
function atomicCreate(target, content){const temporary=target+`.${process.pid}.tmp`;try{fs.writeFileSync(temporary,content,{flag:'wx'});fs.linkSync(temporary,target);}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}}
function main(){
  const args=process.argv.slice(2);const valid=new Set(['--write','--check','--dry-run','--source','--limit','--report','--help']);
  if(args[0]==='--')args.shift();
  if(args.includes('--'))throw new Error('Unexpected argument separator: --');
  let selected=null,limit=Infinity,report=false;
  for(let i=0;i<args.length;i++){
    if(!valid.has(args[i]))throw new Error('Unknown argument: '+args[i]);
    if(args[i]==='--source'){selected=args[++i];if(!selected||!/^[-A-Za-z0-9_]+$/.test(selected))throw new Error('Invalid source slug');}
    if(args[i]==='--limit'){limit=Number(args[++i]);if(!Number.isSafeInteger(limit)||limit<1)throw new Error('Invalid limit');}
    if(args[i]==='--report')report=true;
  }
  if(args.includes('--help')){console.log('node scripts/translate-research-content.mjs [--dry-run | --write | --check] [--source SLUG] [--limit N] [--report]\nStrict offline, fully translated research templates only. Existing translations are never overwritten. --report writes scripts/lib/translations/research-template-status.json.');return;}
  if(['--write','--check','--dry-run'].filter(f=>args.includes(f)).length>1)throw new Error('Choose one execution mode');
  const write=args.includes('--write'),check=args.includes('--check');const status={schemaVersion:1,translationRuleHash,scope:'historical-cmc-cgo-full-depth-research',scanned:0,completeSources:0,created:0,existing:0,pending:[],failures:[]};
  const seen=new Set();
  for(const file of files(directory)){
    const source=fs.readFileSync(file,'utf8'),parsed=matter(source);
    if(!parsed.content.includes('## Pre-screen Decision')||parsed.data.category!=='research'||parsed.data.sourceSlug||['zh-CN','zh','ja'].includes(parsed.data.language))continue;
    const slug=parsed.data.slug||path.basename(file,'.mdx');if(selected&&slug!==selected)continue;
    if(!/^[-A-Za-z0-9_]+$/.test(slug))throw new Error('Invalid authoritative source slug: '+slug);
    if(status.scanned>=limit)break;status.scanned++;
    if(seen.has(slug))throw new Error('Duplicate authoritative source slug');seen.add(slug);
    const results=['zh-CN','ja'].map(locale=>({locale,result:translateResearchSource(parsed,locale)}));
    if(results.some(({result})=>!result.complete)){status.pending.push({source:path.relative(root,file),sourceSlug:slug,sourceHash:digest(source),locales:results.filter(x=>!x.result.complete).map(({locale,result})=>({locale,matchedBlocks:result.matchedBlocks,totalBlocks:result.totalBlocks,blocks:result.pending.map(({reason,source,...location})=>({...location,reason:reason.slice(0,260),source:(source||'').slice(0,160)}))}))});continue;}
    status.completeSources++;
    for(const {locale,result} of results){
      const target=path.join(path.dirname(file),path.basename(file,'.mdx')+`-${locale}.mdx`);
      const metadata={...parsed.data,title:result.title,summary:result.summary,slug:`${slug}-${locale}`,language:locale,translationKey:parsed.data.translationKey||slug,sourceSlug:slug,translationSourceHash:digest(source),translationMethod:'agent-translated-template',translationRuleHash};
      delete metadata.translationSlug;delete metadata.translations;
      const content=matter.stringify(result.body,metadata);
      if(fs.existsSync(target)){
        status.existing++;
        const existing=fs.readFileSync(target,'utf8');
        // A rule addition does not invalidate a complete unchanged translation. Keep its original provenance.
        const comparable=value=>value.replace(/^translationRuleHash:.*\n/gm,'');
        const owned=matter(existing).data.translationMethod==='agent-translated-template';
        if(owned&&comparable(existing)!==comparable(content))status.failures.push({target:path.relative(root,target),reason:'Source or translated content differs; preserve existing translation for explicit review'});
        continue;
      }
      if(check){status.failures.push({target:path.relative(root,target),reason:'Missing complete translation'});continue;}
      if(write){if(fs.readFileSync(file,'utf8')!==source)throw new Error('Source changed during translation');atomicCreate(target,content);status.created++;}
    }
  }
  if(selected&&!status.scanned)throw new Error('Source not found in supported template scope');
  if(report){const target=path.join(root,'scripts/lib/translations/research-template-status.json');const temporary=target+`.${process.pid}.tmp`;try{fs.writeFileSync(temporary,JSON.stringify(status,null,2)+'\n',{flag:'wx'});fs.renameSync(temporary,target);}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}}
  console.log(JSON.stringify({...status,pending:status.pending.length,failures:status.failures.slice(0,10),failureCount:status.failures.length,pendingExamples:status.pending.slice(0,3).map(p=>({source:p.source,unsupported:p.locales[0].blocks.map(b=>b.reason).slice(0,3)}))},null,2));
  if(status.failures.length)process.exitCode=1;
}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&fs.realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){try{main()}catch(error){console.error(error.message);process.exitCode=1;}}
