import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
  return res.json();
}

function formatDateRange(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

async function main() {
  // 1. Fetch Fear & Greed Index
  let fng;
  try {
    const fngData = await fetchJson('https://api.alternative.me/fng/');
    fng = fngData.data[0];
  } catch (e) {
    console.error('Failed to fetch FNG:', e.message);
    process.exit(0);
  }

  // 2. Fetch global market data
  let globalData;
  try {
    globalData = await fetchJson('https://api.coingecko.com/api/v3/global');
  } catch (e) {
    console.error('Failed to fetch global market data:', e.message);
    process.exit(0);
  }

  // 3. Fetch token prices
  let prices;
  try {
    prices = await fetchJson(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,tao&vs_currencies=usd&include_24hr_change=true&include_7d_change=true'
    );
  } catch (e) {
    console.error('Failed to fetch token prices:', e.message);
    process.exit(0);
  }

  // 4. Build market context string
  const g = globalData.data;
  const totalMarketCap = (g.total_market_cap.usd / 1e12).toFixed(2);
  const btcDominance = g.market_cap_percentage.btc.toFixed(1);
  const marketCapChange = g.market_cap_change_percentage_24h_usd.toFixed(2);

  const fmt = (n) => (n == null ? 'N/A' : Number(n).toFixed(2));

  const marketContext = `
恐惧贪婪指数: ${fng.value} (${fng.value_classification})
全球总市值: $${totalMarketCap}T, 24h变化: ${marketCapChange}%
BTC 市场占比: ${btcDominance}%

主要代币价格:
- BTC: $${fmt(prices.bitcoin?.usd)}, 24h: ${fmt(prices.bitcoin?.usd_24h_change)}%, 7d: ${fmt(prices.bitcoin?.usd_7d_change)}%
- ETH: $${fmt(prices.ethereum?.usd)}, 24h: ${fmt(prices.ethereum?.usd_24h_change)}%, 7d: ${fmt(prices.ethereum?.usd_7d_change)}%
- SOL: $${fmt(prices.solana?.usd)}, 24h: ${fmt(prices.solana?.usd_24h_change)}%, 7d: ${fmt(prices.solana?.usd_7d_change)}%
- BNB: $${fmt(prices.binancecoin?.usd)}, 24h: ${fmt(prices.binancecoin?.usd_24h_change)}%, 7d: ${fmt(prices.binancecoin?.usd_7d_change)}%
- TAO: $${fmt(prices.tao?.usd)}, 24h: ${fmt(prices.tao?.usd_24h_change)}%, 7d: ${fmt(prices.tao?.usd_7d_change)}%
`.trim();

  // 5. Call Claude API
  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch (e) {
    console.error('Failed to import @anthropic-ai/sdk:', e.message);
    process.exit(0);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `你是一个加密货币和宏观经济研究员。基于以下市场数据，生成本周的研究报告。
返回纯 JSON，不要任何 markdown 格式。

市场数据：
${marketContext}

JSON 结构要求：
{
  "id": "YYYY-MM-DD",
  "dateRange": "Mon DD, YYYY",
  "headline": "本周最重要的一句话总结（中文，20字内）",
  "generatedAt": "MM/DD HH:mm",
  "coreMacro": "宏观分析，200字左右，中文",
  "coreCrypto": "加密市场分析，200字左右，中文",
  "coreActions": ["操作建议1", "操作建议2", "操作建议3", "操作建议4", "操作建议5"],
  "cryptoAssets": ["BTC动态", "ETH动态", "SOL动态", "BNB动态", "TAO动态"],
  "mustRead": [
    {"category": "加密", "title": "标题", "source": "来源", "summary": "摘要", "action": "操作建议"},
    {"category": "宏观", "title": "标题", "source": "来源", "summary": "摘要", "action": "操作建议"},
    {"category": "科技", "title": "标题", "source": "来源", "summary": "摘要", "action": "操作建议"}
  ],
  "disclaimer": "以上内容仅供参考，不构成任何投资建议，投资有风险，决策需谨慎。"
}`;

  let reportJson;
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = message.content[0].text.trim();
    reportJson = JSON.parse(raw);
  } catch (e) {
    console.error('Claude API or JSON parse failed:', e.message);
    process.exit(0);
  }

  // 6. Read existing file and extract WEEKLY_REPORTS entries
  const filePath = path.join(__dirname, '../src/data/weekly-research.ts');
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error('Failed to read weekly-research.ts:', e.message);
    process.exit(0);
  }

  // Extract the interfaces block (everything before WEEKLY_REPORTS array)
  const arrayStart = fileContent.indexOf('export const WEEKLY_REPORTS: WeeklyReport[] = [');
  if (arrayStart === -1) {
    console.error('Could not find WEEKLY_REPORTS array in file');
    process.exit(0);
  }

  const interfaceBlock = fileContent.slice(0, arrayStart);

  // Extract existing entries from the array body
  const arrayBody = fileContent.slice(arrayStart);
  // Find each top-level object: split by '},\n  {' pattern
  const innerStart = arrayBody.indexOf('[') + 1;
  const innerEnd = arrayBody.lastIndexOf(']');
  const existingEntriesRaw = arrayBody.slice(innerStart, innerEnd).trim();

  // Parse existing entries as text blocks, split by top-level object boundaries
  // We'll just keep the raw text of each entry and prepend the new one
  let existingEntries = [];
  if (existingEntriesRaw.length > 0) {
    // Split on occurrences of "},\n  {" or "},\n{" to separate entries
    // We reassemble by tracking brace depth
    let depth = 0;
    let current = '';
    for (let i = 0; i < existingEntriesRaw.length; i++) {
      const ch = existingEntriesRaw[i];
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      current += ch;
      if (depth === 0 && current.trim().startsWith('{')) {
        existingEntries.push(current.trim().replace(/,\s*$/, ''));
        current = '';
      }
    }
    if (current.trim()) {
      existingEntries.push(current.trim().replace(/,\s*$/, ''));
    }
  }

  // Prepend new entry, keep max 12
  const newEntryStr = JSON.stringify(reportJson, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? '  ' + line : '  ' + line))
    .join('\n');

  const allEntries = [newEntryStr, ...existingEntries.slice(0, 11)];
  const newArrayContent = allEntries.join(',\n');

  // 7. Write back full TypeScript file
  const newFile = `${interfaceBlock}export const WEEKLY_REPORTS: WeeklyReport[] = [\n${newArrayContent}\n];\n`;

  try {
    fs.writeFileSync(filePath, newFile, 'utf-8');
    console.log(`Weekly research generated: ${reportJson.id}`);
  } catch (e) {
    console.error('Failed to write file:', e.message);
    process.exit(0);
  }
}

main();
