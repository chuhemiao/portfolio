import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { researchTerms, sourceProperNames } from './research-terms.mjs';

const knownChains = new Set(["0G", "Abstract", "Algorand", "ApeChain", "Aptos", "Arbitrum Nova", "Arbitrum One", "Archway", "Astar", "Astar zkEVM", "Aurora", "Avalanche", "BNB Chain", "Base", "Berachain", "Bifrost Network", "Binance Smart Chain", "BitTorrent", "Bitlayer", "Blast", "Bob Network", "Boba", "Bsquared Network", "CORE", "Cardano", "Celo", "Conflux", "Corn", "CosmosHub", "Cronos", "Cronos zkEVM", "Cyber", "Dogechain", "DuckChain", "Energi", "Eos Evm", "Ergo", "Ethereum", "Etherlink", "Everscale", "Evmos", "Fantom", "Filecoin", "Flow Evm", "Fraxtal", "Fuse", "Gnosis", "Gravity Alpha", "HECO Chain", "Haqq Network", "Harmony Shard 0", "Hedera", "Hemi", "Henesys", "Hydration", "HyperEVM", "Hyperliquid", "ICP", "Immutable", "Initia", "Injective", "Ink", "IoTeX", "Kaia", "Katana", "Kava", "Linea", "Lisk", "Manta Pacific", "Mantle", "Mantra", "Merlin Chain", "Metal L2", "Meter", "Metis Andromeda", "Mode", "Monad", "Moonbeam", "Moonriver", "Movement", "Near Protocol", "Neon EVM", "NeuroWeb", "Oasis", "Oasis Sapphire", "Ontology", "Optimistic Ethereum", "Ordinals", "Osmosis", "Plasma", "Plume Network", "Polygon Pos", "Polygon zkEVM", "Pundi Aifx Omnilayer", "RSK", "Rari", "Ronin", "Rss3 Vsl", "RuneChain", "SORA", "Scroll", "Secret", "Sei V2", "Shiden Network", "Skale", "Solana", "Soneium", "Sonic", "Sophon", "Starknet", "Stellar", "Sui", "Swellchain", "Tac", "Taiko", "Tdvv Sidechain", "Terra", "Terra 2", "Ton", "Tron", "Unichain", "Vanar Chain", "Viction (TomoChain)", "WAX", "Wanchain", "Wemix Network", "X Layer", "Xdai", "Xdc Network", "Xrp", "Zano", "ZetaChain", "Zilliqa", "Zircuit", "aelf", "opBNB", "peaq", "zkSync Era", "Bitcoin", "Polygon", "Arbitrum", "Optimism", "Proton", "Flare", "Fantom", "BSC"].map(chain=>chain.toLowerCase()));
const catalogue = JSON.parse(fs.readFileSync(new URL('./research-template-rules.json', import.meta.url), 'utf8'));
const extrasPath = new URL('./research-extra-labels.json', import.meta.url);
const extrasSource = fs.existsSync(extrasPath) ? fs.readFileSync(extrasPath, 'utf8') : '{}';
const extraLabels = JSON.parse(extrasSource);
const overviewsPath = new URL('./research-overviews.json',import.meta.url);
const overviewsSource = fs.readFileSync(overviewsPath,'utf8');
const translatedOverviews = JSON.parse(overviewsSource);
const incompleteSourceTitles = new Set(['EcoCash agent hokoyo...Next week tinenge tane ma Bond Coin ...']);
export const translationRuleHash = digest(JSON.stringify(catalogue) + fs.readFileSync(new URL('./research-terms.mjs', import.meta.url), 'utf8') + fs.readFileSync(fileURLToPath(import.meta.url), 'utf8') + extrasSource + overviewsSource);
export function digest(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rules = [...catalogue.rules].sort((a,b)=>b.source.replace(/\{\{\d+\}\}/g,'').length-a.source.replace(/\{\{\d+\}\}/g,'').length).map((rule) => {
  const ids = [];
  const pieces = rule.source.split(/(\{\{\d+\}\})/g).map((piece) => {
    if (/^\{\{\d+\}\}$/.test(piece)) { ids.push(Number(piece.slice(2,-2))); return '([\\s\\S]*?)'; }
    return escape(piece);
  });
  return { ...rule, ids, pattern: new RegExp('^' + pieces.join('') + '$') };
});
function term(value, locale) { return researchTerms.get(value.toLowerCase())?.[locale]; }
function scalar(value, locale) {
  const known = term(value, locale);
  if (known !== undefined) return known;
  if (/^(?:\$?[+-]?(?:\d[\d,]*(?:\.\d+)?)(?:[MBTKx%])?|\d{4}-\d{2}-\d{2})$/.test(value)) return value;
  throw new Error('Unrecognized scalar: ' + value);
}
function seeded(value, locale) {
  const m = /^Seeded (\d{4}-\d{2}-\d{2}) from (Surf market-ranking|DefiLlama protocols); rank (\d+|n\/a), market cap (not disclosed|\$[\d,.]+), 24h volume (not disclosed|\$[\d,.]+)(?:, TVL (not disclosed|\$[\d,.]+), category (.+?))?\. Local registry duplicate check passed; refresh CG\/CMC\/Surf and primary sources before writing\.$/.exec(value);
  if (!m) return null;
  const [,date,source,rank,cap,volume,tvl,category]=m;
  const categoryText=category ? term(category,locale) : null;
  if (category && !categoryText) throw new Error('Unrecognized category: '+category);
  if(locale==='zh-CN') return `于 ${date} 从 ${source==='Surf market-ranking'?'Surf market-ranking':'DefiLlama 协议列表'}建立候选；排名 ${scalar(rank,locale)}，市值 ${scalar(cap,locale)}，24h 成交量 ${scalar(volume,locale)}${tvl ? `，TVL ${scalar(tvl,locale)}，类别${categoryText}` : ''}。本地 registry 查重通过；写作前刷新 CG/CMC/Surf 与第一手来源。`;
  return `${date} に ${source==='Surf market-ranking'?'Surf market-ranking':'DefiLlama プロトコル一覧'}から候補を登録。順位 ${scalar(rank,locale)}、時価総額 ${scalar(cap,locale)}、24h 出来高 ${scalar(volume,locale)}${tvl ? `、TVL ${scalar(tvl,locale)}、分類${categoryText}` : ''}。ローカル registry の重複検査に合格。執筆前に CG/CMC/Surf と一次情報を更新する。`;
}
function note(value, locale) {
  const direct=term(value,locale);if(direct!==undefined)return direct;
  const s=seeded(value,locale);if(s!==null)return s;
  const m=/^DefiLlama category (.+?) on (.+?); TVL (\$[\d,.]+)\. Local registry and current candidates duplicate check passed on (\d{4}-\d{2}-\d{2}); refresh CG\/CMC\/Surf and primary sources before writing\.$/.exec(value);
  const chains=new Set(['Ethereum','Stellar','Solana','Berachain','Kava','Flare','Proton','RSK','Bitcoin','xDai','Base','Avalanche','Arbitrum','Fantom','BNB Chain','Polygon','Multi-Chain']);
  if(m&&term(m[1],locale)!==undefined&&chains.has(m[2])){
    const chain=m[2]==='Multi-Chain'?term(m[2],locale):m[2];
    return locale==='zh-CN'?`DefiLlama 类别为${term(m[1],locale)}，部署于 ${chain}；TVL ${m[3]}。于 ${m[4]} 通过本地 registry 与当前候选查重；写作前刷新 CG/CMC/Surf 与第一手来源。`:`DefiLlama の分類は${term(m[1],locale)}、展開先は ${chain}、TVL は ${m[3]}。${m[4]} にローカル registry と現在の候補の重複検査に合格。執筆前に CG/CMC/Surf と一次情報を更新する。`;
  }
  throw new Error('Untranslated candidate note: '+value);
}
function sourceLabel(value, locale) {
  if(incompleteSourceTitles.has(value)||extraLabels[value]?.complete===false)throw new Error('Source title requires direct translation: '+value);
  const extra=extraLabels[value]?.[locale];
  if(extra!==undefined){if(typeof extra!=='string'||!extra.trim())throw new Error('Invalid extra source-label translation');validateTranslation(value,extra);return extra;}
  const direct=term(value,locale);if(direct!==undefined)return direct;
  if(sourceProperNames.has(value))return value;
  const m=/^Top (Tradable Ecosystem|Stablecoins|Meme|Midas Liquid Yield Tokens|Nest Ecosystem) Coins by Market Cap - CoinGecko$/.exec(value);
  const names={'Tradable Ecosystem':['Tradable 生态','Tradable エコシステム'],Stablecoins:['稳定币','ステーブルコイン'],Meme:['Meme','Meme'],'Midas Liquid Yield Tokens':['Midas 流动收益代币','Midas 流動利回りトークン'],'Nest Ecosystem':['Nest 生态','Nest エコシステム']};
  if(m)return locale==='zh-CN'?`按市值排名的${names[m[1]][0]}币种 - CoinGecko`:`時価総額上位の${names[m[1]][1]}コイン - CoinGecko`;
  const chart=/^(.{1,100})\/USD Live Price Chart, Market Cap & News Today( - CoinGecko)?$/.exec(value);
  if(chart)return locale==='zh-CN'?`${chart[1]}/USD 实时价格图表、市值与今日新闻${chart[2]||''}`:`${chart[1]}/USD 現在の価格チャート・時価総額・本日のニュース${chart[2]||''}`;
  const price=/^(.{1,100}) Price( - CoinGecko)?$/.exec(value);
  if(price)return locale==='zh-CN'?`${price[1]} 价格${price[2]||''}`:`${price[1]} 価格${price[2]||''}`;
  const priceChart=/^(.{1,100}) Price Chart \((PC\d+)\)$/.exec(value);
  if(priceChart)return locale==='zh-CN'?`${priceChart[1]} 价格图表 (${priceChart[2]})`:`${priceChart[1]} 価格チャート (${priceChart[2]})`;
  const labelledChart=/^(.{1,150}) Price Chart \(([^)]+)\)( - CoinGecko)?$/.exec(value);
  if(labelledChart)return locale==='zh-CN'?`${labelledChart[1]} 价格图表 (${labelledChart[2]})${labelledChart[3]||''}`:`${labelledChart[1]} 価格チャート (${labelledChart[2]})${labelledChart[3]||''}`;
  const today=/^(.{1,120}?)\s*price today, (.{1,60}?)\s*to USD live price, marketcap and chart$/.exec(value);
  if(today)return locale==='zh-CN'?`${today[1]} 今日价格、${today[2]} 兑 USD 实时价格、市值与图表`:`${today[1]} 本日の価格、${today[2]} の USD 建て現在価格・時価総額・チャート`;
  const shortToday=/^(.{1,120}?)\s*price today, (.{1,60}?)\s*to USD live (price, marketcap|price, marketcap and chart|price|)\s*\.\.\.$/.exec(value);
  if(shortToday)return locale==='zh-CN'?`${shortToday[1]} 今日价格、${shortToday[2]} 兑 USD 实时${shortToday[3].includes('marketcap')?'价格、市值':shortToday[3]?'价格':''}……`:`${shortToday[1]} 本日の価格、${shortToday[2]} の USD 建て現在${shortToday[3].includes('marketcap')?'価格・時価総額':shortToday[3]?'価格':''}……`;
  const shortChart=/^(.{1,120}?) Price: (.{1,60}?)\/USD Live Price Chart, (Market Cap &|Market Cap|Market) \.\.\.( - CoinGecko)?$/.exec(value);
  if(shortChart)return locale==='zh-CN'?`${shortChart[1]} 价格：${shortChart[2]}/USD 实时价格图表、${shortChart[3]==='Market'?'市场':'市值'}${shortChart[3].endsWith('&')?'与':''}……${shortChart[4]||''}`:`${shortChart[1]} 価格：${shortChart[2]}/USD 現在の価格チャート・${shortChart[3]==='Market'?'市場':'時価総額'}${shortChart[3].endsWith('&')?'と':''}……${shortChart[4]||''}`;
  const history=/^(.{1,120}?) Price History: Download ([A-Za-z0-9]+) Historical Data(?: ([-/|]) CoinGecko)?$/.exec(value);
  if(history)return locale==='zh-CN'?`${history[1]} 历史价格：下载 ${history[2]} 历史数据${history[3]?' '+history[3]+' CoinGecko':''}`:`${history[1]} 過去価格：${history[2]} 過去データをダウンロード${history[3]?' '+history[3]+' CoinGecko':''}`;
  const ranked=/^(.{1,120}?) price ([A-Za-z0-9]+) #(\d+)( - CoinMarketCap)?$/.exec(value);
  if(ranked)return `${ranked[1]} ${locale==='zh-CN'?'价格':'価格'} ${ranked[2]} #${ranked[3]}${ranked[4]||''}`;
  const currencies={Bitcoin:['Bitcoin','Bitcoin'],Ether:['Ether','Ether'],'Hong Kong Dollar':['港元','香港ドル'],'Indian Rupee':['印度卢比','インドルピー'],'Turkish Lira':['土耳其里拉','トルコリラ'],Euro:['欧元','ユーロ'],'US Dollar':['美元','米ドル'],'Indonesian Rupiah':['印尼盾','インドネシアルピア'],'Australian Dollar':['澳元','豪ドル'],'Swedish Krona':['瑞典克朗','スウェーデンクローナ'],'Sri Lankan Rupee':['斯里兰卡卢比','スリランカルピー'],'Japanese Yen':['日元','日本円'],'Philippine Peso':['菲律宾比索','フィリピンペソ'],'Canadian Dollar':['加元','カナダドル'],'British Pound Sterling':['英镑','英ポンド'],'South Korean Won':['韩元','韓国ウォン'],'Brazilian Real':['巴西雷亚尔','ブラジルレアル'],'Russian Ruble':['俄罗斯卢布','ロシアルーブル'],'Swiss Franc':['瑞士法郎','スイスフラン'],'Chinese Yuan':['人民币','人民元'],'Polish Zloty':['波兰兹罗提','ポーランドズウォティ'],'United Arab Emirates Dirham':['阿联酋迪拉姆','UAE ディルハム'],'Saudi Riyal':['沙特里亚尔','サウジリヤル'],'Singapore Dollar':['新加坡元','シンガポールドル'],'New Zealand Dollar':['新西兰元','ニュージーランドドル'],'Vietnamese Dong':['越南盾','ベトナムドン'],'Taiwan Dollar':['新台币','台湾ドル'],'Bangladeshi Taka':['孟加拉塔卡','バングラデシュタカ']};
  const conversion=/^(.{1,60}?)\s*to ([A-Z]{2,6}): (.{1,150}?)\s*Price in (.+?)(?: ([-/|]) CoinGecko)?$/.exec(value);
  if(conversion&&currencies[conversion[4]])return locale==='zh-CN'?`${conversion[1]} 兑 ${conversion[2]}：${conversion[3]} 的${currencies[conversion[4]][0]}价格${conversion[5]?' '+conversion[5]+' CoinGecko':''}`:`${conversion[1]} から ${conversion[2]}：${conversion[3]} の${currencies[conversion[4]][1]}建て価格${conversion[5]?' '+conversion[5]+' CoinGecko':''}`;
  const abbreviatedConversion=/^([A-Z]{2,6}) - (.{1,120}?)\s*Price in (.+?) - CoinGecko$/.exec(value);
  if(abbreviatedConversion&&currencies[abbreviatedConversion[3]])return locale==='zh-CN'?`${abbreviatedConversion[1]} - ${abbreviatedConversion[2]} 的${currencies[abbreviatedConversion[3]][0]}价格 - CoinGecko`:`${abbreviatedConversion[1]} - ${abbreviatedConversion[2]} の${currencies[abbreviatedConversion[3]][1]}建て価格 - CoinGecko`;
  const overview=/^[Ww]hat [Ii]s (.{1,150}?)(?: [Aa]nd [Hh]ow [Dd]oes [Ii]t [Ww]ork)?\?( - CoinMarketCap)?$/.exec(value);
  if(overview)return locale==='zh-CN'?`什么是 ${overview[1]}${/[Aa]nd [Hh]ow/.test(value)?'，它如何运作':''}？${overview[2]||''}`:`${overview[1]} とは${/[Aa]nd [Hh]ow/.test(value)?'、どのように動作するか':''}？${overview[2]||''}`;
  const pairChart=/^(.{1,60}?) to ([A-Z]{2,6}) Chart$/.exec(value);
  if(pairChart)return locale==='zh-CN'?`${pairChart[1]} 兑 ${pairChart[2]} 图表`:`${pairChart[1]} の ${pairChart[2]} 建てチャート`;
  const compoundPrice=/^(.{1,120}?) Price, (.{1,60}?) Price, Live Charts, and Marketcap( - Coinbase)?$/.exec(value);
  if(compoundPrice)return locale==='zh-CN'?`${compoundPrice[1]} 价格、${compoundPrice[2]} 价格、实时图表与市值${compoundPrice[3]||''}`:`${compoundPrice[1]} 価格、${compoundPrice[2]} 価格、現在のチャート・時価総額${compoundPrice[3]||''}`;
  const bybit=/^(.{1,150}?) Price Today ([/|]) Live Chart - Bybit$/.exec(value);
  if(bybit)return locale==='zh-CN'?`${bybit[1]} 今日价格 ${bybit[2]} 实时图表 - Bybit`:`${bybit[1]} 本日の価格 ${bybit[2]} 現在のチャート - Bybit`;
  const shortHistory=/^(.{1,120}?) Price History: Download ([A-Za-z0-9]+) Historical \.\.\.$/.exec(value);
  if(shortHistory)return locale==='zh-CN'?`${shortHistory[1]} 历史价格：下载 ${shortHistory[2]} 历史……`:`${shortHistory[1]} 過去価格：${shortHistory[2]} 履歴をダウンロード……`;
  throw new Error('Untranslated source label: '+value);
}
function sourceLines(value, locale, ledger=false) {
  return value.split('\n').map(line=>{
    if(!ledger){const m=/^- \[(.+)\]\((https?:\/\/[^\s]+)\)$/.exec(line);if(!m)throw new Error('Invalid source list line: '+line);return `- [${sourceLabel(m[1],locale)}](${m[2]})`;}
    const m=/^\| (\d+) \| (.+) \| \[link\]\((https?:\/\/[^\s]+)\) \| Identity, market, social, contract, or discovery cross-check \|$/.exec(line);
    if(!m)throw new Error('Invalid evidence row: '+line);
    return `| ${m[1]} | ${sourceLabel(m[2],locale)} | [${locale==='zh-CN'?'链接':'リンク'}](${m[3]}) | ${locale==='zh-CN'?'身份、市场、社交、合约或发现信息交叉核验':'識別、市場、SNS、契約、発見情報の相互照合'} |`;
  }).join('\n');
}
function slot(value, expression, locale, context) {
  if(expression==='name'){if(value!==context.name)throw new Error('Project identity mismatch');return value;}
  if(expression==='type'){if(value!==context.type)throw new Error('Category mismatch');const t=term(value,locale);if(t===undefined)throw new Error('Untranslated thesis type: '+value);return t;}
  if(expression==='symbol'||expression.startsWith("symbol ||")){if(value===context.symbol && value)return value;const t=term(value,locale);if(t!==undefined)return t;throw new Error('Symbol mismatch');}
  if(expression.startsWith('candidate.notes'))return note(value,locale);
  if(expression==='DATE'){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('Invalid date');return value;}
  if(expression==='contractRows'||expression==='investorRows'||expression==='teamRows'){
    const role=raw=>{
      const value=raw.trim();
      const known=term(value,locale);if(known!==undefined)return known;
      if(/^(CEO|CTO|COO|CFO|CMO|CPO|CCO|CSO|CBO|CGO|CIO|CLO|CRO)$/.test(value))return value;
      const parts=value.split(/, | & /);if(parts.length>1)return parts.map(role).join(' / ');
      throw new Error('Untranslated role: '+value);
    };
    const namedFact=value=>{if(value==='not disclosed')return term(value,locale);if(!value.trim()||/[\n|<>]/.test(value))throw new Error('Invalid named fact');return value;};
    return value.split('\n').map(line=>{
      if(!/^\| .+ \|$/.test(line))throw new Error('Invalid fact row');
      const cells=line.split('|').slice(1,-1).map(v=>v.trim());
      if(cells.length!==(expression==='teamRows'?3:4))throw new Error('Invalid fact row width');
      if(cells.every(c=>c==='not disclosed'))return line.replaceAll('not disclosed',term('not disclosed',locale));
      if(expression==='teamRows'){
        if(cells.length!==3)throw new Error('Invalid team row');
        const link=cells[2]==='not disclosed'?term(cells[2],locale):/^\[X\]\(https:\/\/[^\s]+\)$/.test(cells[2])?cells[2]:null;
        if(link===null)throw new Error('Untranslated team link');
        return `| ${namedFact(cells[0])} | ${role(cells[1])} | ${link} |`;
      }
      if(expression==='investorRows'){
        if(cells.length!==4)throw new Error('Invalid funding row');
        const round=term(cells[1],locale);if(round===undefined)throw new Error('Untranslated funding round: '+cells[1]);
        return `| ${scalar(cells[0],locale)} | ${round} | ${scalar(cells[2],locale)} | ${namedFact(cells[3])} |`;
      }
      if(cells.length!==4||!knownChains.has(cells[0].toLowerCase()))throw new Error('Untranslated contract chain');
      const label=term(cells[1],locale) ?? (cells[1]===context.name||cells[1]===context.symbol||/^[A-Z][A-Z0-9.$_-]{1,30}$/.test(cells[1])?cells[1]:null);
      if(label===null)throw new Error('Untranslated contract label: '+cells[1]);
      const address=cells[2]==='not disclosed'?term(cells[2],locale):/^(?:[A-Za-z0-9._:-]+|(?:ibc|IBC|move)\/[A-Fa-f0-9]{64})$/.test(cells[2])?cells[2]:null;
      if(address===null)throw new Error('Invalid contract address');
      const explorer=cells[3]==='not mapped'?term(cells[3],locale):/^\[explorer\]\(https?:\/\/[^\s]+\)$/.test(cells[3])?cells[3].replace('[explorer]',locale==='zh-CN'?'[浏览器]':'[エクスプローラー]'):null;
      if(explorer===null)throw new Error('Untranslated contract explorer');
      return `| ${cells[0]} | ${label} | ${address} | ${explorer} |`;
    }).join('\n');
  }
  if(expression==='sourceRows')return sourceLines(value,locale,true);
  if(expression==='chains'||expression==='exchanges'||expression==='tags'){
    const t=term(value,locale);if(t!==undefined)return t;

    const properExchanges=new Set(["AARK", "AERODROME", "ASTER", "BINANCE", "BINANCE ALPHA", "BINGX", "BITFLOW", "BITGET", "BITHUMB", "BYBIT", "COINBASE", "DEXS", "GATE", "HTX", "HYENA TRADE", "HYPERLIQUID", "KRAKEN", "KUCOIN", "MEXC", "OKX", "ROBINHOOD", "UNISWAP", "UPBIT", "Gate.io"]);
    return value.split(', ').map(item=>{const translated=term(item,locale);if(translated!==undefined)return translated;if(expression==='chains'&&knownChains.has(item.toLowerCase())||expression==='exchanges'&&[...properExchanges].some(exchange=>exchange.toLowerCase()===item.toLowerCase()))return item;throw new Error('Untranslated '+expression+': '+value);}).join(', ');
  }
  if(expression.startsWith('overview.website ?') && !expression.includes('Official website')){
    if(value==='not disclosed')return term(value,locale);
    if(/^\[(https?:\/\/[^\s]+)\]\(\1\)$/.test(value))return value;
    throw new Error('Unrecognized website: '+value);
  }
  if(expression.startsWith('overview.x_handle ?')){
    if(value==='not disclosed')return term(value,locale);
    if(/^\[@[A-Za-z0-9_]+\]\(https:\/\/x\.com\/[A-Za-z0-9_]+\)$/.test(value))return value;
    throw new Error('Unrecognized X handle');
  }
  if(expression.startsWith('candidate.coingeckoId ?')){
    if(value==='not disclosed'||value==='market discovery')return term(value,locale);
    if(/^\[(?:CoinGecko|[a-z0-9][a-z0-9-]*)\]\(https:\/\/www\.coingecko\.com\/en\/coins\/[a-z0-9-]+\)$/.test(value))return value;
    throw new Error('Unrecognized CoinGecko reference');
  }
  if(expression.startsWith('overview.website ?') || expression.startsWith('compact(overview.tge_status')){const t=term(value,locale);if(t!==undefined)return t;throw new Error('Untranslated project fact: '+value);}
  return scalar(value,locale);
}
export function translateBlock(block, locale, context) {
  const overview=translatedOverviews[block]?.[locale];
  if(overview!==undefined){validateTranslation(block,overview);return overview;}
  const seededText=seeded(block,locale);if(seededText!==null)return seededText;
  if(block.startsWith('DefiLlama category '))return note(block,locale);
  if(block.startsWith('- ['))return sourceLines(block,locale);
  for(const rule of rules){
    const match=rule.pattern.exec(block);if(!match)continue;
    const values=new Map();
    for(let i=0;i<rule.ids.length;i++){
      const id=rule.ids[i];const translated=slot(match[i+1],rule.slots[id],locale,context);
      if(values.has(id)&&values.get(id)!==translated)throw new Error('Repeated slot mismatch');values.set(id,translated);
    }
    return rule[locale].replace(/\{\{(\d+)\}\}/g,(_,id)=>values.get(Number(id)));
  }
  throw new Error('Unsupported complete block: '+block);
}
function protectedTokens(text) {
  return {
    links:[...text.matchAll(/\]\(([^\s]+?)\)/g)].map(m=>m[1]).sort(),
    numbers:(text.match(/\d+(?:,\d{3})*(?:\.\d+)?(?:e[+-]?\d+)?/gi)||[]).sort(),
    code:[...text.matchAll(/```[\s\S]*?```|`[^`\n]+`/g)].map(m=>m[0]).sort(),
    headings:(text.match(/^#{1,6}(?= )/gm)||[]).sort(),
    tableRows:text.split('\n').filter(l=>l.startsWith('|')).map(l=>l.split('|').length),
  };
}
export function validateTranslation(source, target) {
  const a=protectedTokens(source),b=protectedTokens(target);
  for(const key of Object.keys(a))if(JSON.stringify(a[key])!==JSON.stringify(b[key]))throw new Error('Protected '+key+' changed');
}
export function translateResearchSource(parsed, locale) {
  if(!['zh-CN','ja'].includes(locale))throw new Error('Unsupported target locale');
  if(parsed.data.slug==='escoin-elg-defi-infrastructure-token-value-capture-risk'&&/^GorplesCoin is a next-generation memecoin/m.test(parsed.content))return {complete:false,pending:[{reason:'Source identity mismatch: Escoin / ELG overview describes GorplesCoin; correct the original before translating',source:'GorplesCoin overview is attached to an Escoin / ELG report'}]};
  const m=/^(.+) \/ (.*?): (.+) value capture, liquidity, and token risk$/.exec(parsed.data.title||'');
  if(!m||parsed.data.category!=='research')return {complete:false,pending:[{reason:'Not a supported research template',source:''}]};
  const context={name:m[1],symbol:m[2],type:m[3]};
  const pending=[];const blocks=parsed.content.trim().split(/\n\s*\n/);
  const output=blocks.map((block,index)=>{try{return translateBlock(block,locale,context)}catch(error){pending.push({index,reason:error.message.slice(0,500),source:block.slice(0,600),hash:digest(block)});return null;}});
  let title,summary;
  for(const field of ['title','summary']){try{const r=translateBlock(parsed.data[field],locale,context);if(field==='title')title=r;else summary=r;}catch(error){pending.push({field,reason:error.message.slice(0,500),source:parsed.data[field]||''});}}
  if(pending.length)return {complete:false,pending,matchedBlocks:blocks.length-pending.filter(p=>p.index!==undefined).length,totalBlocks:blocks.length};
  const body=output.join('\n\n')+'\n';
  validateTranslation(parsed.content.trim(),body.trim());
  return {complete:true,title,summary,body,totalBlocks:blocks.length};
}
