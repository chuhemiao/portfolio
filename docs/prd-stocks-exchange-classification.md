# PRD：/stocks 按交易所细分链上股票

> 状态：待评审 · 2026-10-28 · 对应需求「针对不同交易所发行的链上股票进行更详细的分类」

## 一、现状为什么支撑不了更细的分类

不是页面写得不够细，是**数据模型里缺了一整个轴**。

### 1.1 `distribution` 是自由文本，混了五类完全不同的东西

```ts
distribution: string[]   // 当前类型
```

实际存进去的 13 个值：

| 值 | 实际是什么 |
|---|---|
| Binance, Kraken, Bybit, OKX, Bitget, Backpack | 中心化交易所 |
| Uniswap, Aerodrome, Jupiter | 链上 DEX / AMM |
| Aave, Morpho | 借贷协议（能当抵押品，不是买入场所） |
| LI.FI | 跨链聚合器 |
| Robinhood app | 券商 App |

这五类的**风险性质完全不同**：在 Binance 买是交易所托管 + 订单簿，在 Uniswap 买是自托管 + AMM 滑点，而 Aave 根本不是买入渠道。现在全部拍平成一个字符串数组，所以：

- 无法按「在哪买」筛选
- 无法回答「哪些代币能在 Bybit 买到」这种最常见的问题
- `Aave` 和 `Binance` 并排显示会误导读者以为都是购买渠道

### 1.2 「谁发行」和「谁分发」是两回事，但数据里只有后者

这是本次需求的**核心缺口**：

| 发行方 | 法律发行主体 | 实际销售渠道 | 关系 |
|---|---|---|---|
| xStocks | Backed Assets (JE) Limited | Kraken / Bybit / OKX | **第三方发行，多所分发** |
| bStocks | BTech Holdings Limited | Binance | **交易所自营发行自营分发** |
| Robinhood | Robinhood Assets (Jersey) Limited | Robinhood app | 券商自营 |
| Coinbase | — | Uniswap / Aerodrome / Aave / Morpho | 交易所发行，**全部链上分发** |

`ISSUERS` 里既没有字段表达这个区别，也无法从现有数据推导（我试过用 slug 匹配 distribution，10 个里只能猜对 2 个）。

**而这恰恰是风险分层的关键**：交易所自营发行意味着发行、托管、做市、上架全在一个主体手里，没有第三方制衡；第三方发行则至少把发行主体和销售渠道分开了。站上已发布的那篇长尾研究正是在论证这一点（Binance / Robinhood / Backpack / Coinbase 四次同样的实验，结果取决于可触达用户而非用户总数）。

### 1.3 一个确定的数据 bug

`chains` 同样是自由文本，且**同一条链有两个名字**：

```
ondo      → ["Ethereum", "BNB Chain", "Solana", "HyperEVM"]
bstocks   → ["BNB Chain"]
xstocks   → ["Solana", "Ethereum", "Arbitrum", "BSC", ...]   ← BSC
```

任何按链分组都会把 BNB Chain 和 BSC 劈成两组。

### 1.4 一个必须尊重的约束

你在上一轮明确说过「stock 页面现在内容过于多了」，并砍掉了 4 个章节。**所以这次「更详细的分类」不能靠加章节实现** —— 否则是把刚砍掉的东西换个名字加回来。

---

## 二、目标与非目标

**目标**

1. 读者能在一个视图内回答：*「我能在 ×× 交易所买到哪些链上股票？它是谁发的？」*
2. 把「交易所自营发行」和「第三方发行」作为一等维度呈现，这是风险分层的主线
3. 分类更细，但**页面不变长**

**非目标**

- 不接实时行情（当前是 `DATA_AS_OF` 快照，保持）
- 不做新页面，不动 `/stocks` 的 URL
- 不扩充发行方数量（10 家够用，先把结构做对）
- 不碰 `/research` registry

---

## 三、数据模型改动

全部在 `src/data/tokenized-equities.ts`。

### 3.1 新增发行模型维度

```ts
export type IssuanceModel =
  | 'exchange-self'      // 交易所发行自家代币，自己分发：bStocks / Backpack
  | 'exchange-onchain'   // 交易所发行，但只在链上流通：Coinbase
  | 'broker-self'        // 持牌券商自营：Robinhood
  | 'independent'        // 独立发行方，多渠道分发：xStocks / Ondo / Dinari
  | 'unknown';

export const ISSUANCE_LABEL: Record<IssuanceModel, L10n> = {
  'exchange-self':    ['exchange self-issued', '交易所自营发行', '取引所の自社発行'],
  'exchange-onchain': ['exchange-issued, on-chain only', '交易所发行·仅链上流通', '取引所発行・オンチェーンのみ'],
  'broker-self':      ['broker self-issued', '券商自营发行', 'ブローカーの自社発行'],
  'independent':      ['independent issuer', '独立发行方', '独立した発行体'],
  unknown:            UNKNOWN_LABEL,
};
```

### 3.2 把 `distribution` 升级成带类型的场所

```ts
export type VenueKind = 'cex' | 'dex' | 'lending' | 'aggregator' | 'broker-app';

export const VENUE_KIND_LABEL: Record<VenueKind, L10n> = {
  cex:         ['CEX', '中心化交易所', '中央集権取引所'],
  dex:         ['DEX', '链上 DEX', 'オンチェーン DEX'],
  lending:     ['collateral only', '仅作抵押品', '担保のみ'],
  aggregator:  ['aggregator', '聚合器', 'アグリゲーター'],
  'broker-app':['broker app', '券商 App', 'ブローカーアプリ'],
};

export type Venue = {
  name: string;
  kind: VenueKind;
  /** 该场所是否由发行方自己运营 —— 自营发行的判定依据 */
  operatedByIssuer?: boolean;
};
```

`Issuer.distribution: string[]` → `venues: Venue[]`。现有 13 个值的映射已在 §1.1 表里给出，照抄即可。

**`lending` 这个 kind 很关键**：Aave / Morpho 不是购买渠道，标上它之后 UI 可以把这类排除在「在哪买」之外，避免误导。

### 3.3 归一化链名

```ts
const CHAIN_ALIASES: Record<string, string> = { BSC: 'BNB Chain' };
export const normalizeChain = (c: string) => CHAIN_ALIASES[c] ?? c;
```

写入时归一，而不是在渲染层补丁。顺便加一条测试断言 `chains` 里不出现别名。

### 3.4 派生：交易所视角的倒排索引

当前数据是「发行方 → 在哪些场所卖」，读者想要的是反过来。

```ts
export type ExchangeView = {
  venue: string;
  kind: VenueKind;
  issuers: { slug: string; issuanceModel: IssuanceModel; onchainValueUsd?: number }[];
  totalOnchainValueUsd: number;
};

export function buildExchangeIndex(issuers: readonly Issuer[]): ExchangeView[];
```

纯函数，从 `ISSUERS` 推导，**不新增需要人工维护的数据**（这是上一轮 `postCount` / `projectCount` 硬编码失效的教训：凡是能推导的就不要手写）。

---

## 四、页面方案（不增加长度）

### 4.1 把现有静态「发行方」表格换成可筛选表格

照搬仓库里已有的范式：`/research` 的 `page.tsx` + `research-client.tsx`。
新增 `src/app/(legacy)/stocks/stocks-client.tsx`（`'use client'`），服务端把数据传进去。

表格上方一行筛选 chip，**替换而不是追加**现有的发行方小节：

```
视角：  [按发行方]  [按交易所]
筛选：  全部 | 交易所自营 | 独立发行方 | 券商自营
```

- **按发行方**（默认）＝ 现有表格，加一列「发行模型」
- **按交易所** ＝ 倒排视图：一行一个场所，展开看该所卖哪些发行方的代币、合计链上规模、各自评级

两个视角共用一块屏幕区域，切换而非堆叠 —— **页面行数不增加，信息密度翻倍**。

### 4.2 「仅作抵押品」要显式标出

`kind: 'lending'` 的场所在「按交易所」视图里单独分组，标题直接写明不是购买渠道。这是现在这版会误导读者的地方。

### 4.3 三语

新增文案全部走 `L10n` 三元组 + `pick()`，和该文件既有约定一致。**这是硬性要求**（见 memory 的 trilingual 规则）：新字段必须同时给出 en/zh/ja，不能只做中文。

---

## 五、分阶段实施

| 阶段 | 内容 | 产出 | 可独立合并 |
|---|---|---|---|
| **P1** | 数据模型：`IssuanceModel`、`Venue`、链名归一化、10 家发行方数据回填 | `tokenized-equities.ts` + 测试 | ✅ |
| **P2** | `buildExchangeIndex()` + 单测（含「发行方合计 = 场所合计」校验） | 纯函数 | ✅ |
| **P3** | `stocks-client.tsx` 双视角 + 筛选，替换现有发行方小节 | 页面 | ✅ |
| **P4** | `lending` 分组与说明文案、三语补齐 | 文案 | ✅ |

P1 和 P2 没有 UI 风险，可以先合。P3 是唯一会改变页面观感的一步。

---

## 六、验收标准

线上可验收（你的流程是线上验收）：

1. `/zh-CN/stocks`、`/en/stocks`、`/ja/stocks` 三语都能切换视角，无英文漏网
2. 「按交易所」视图下，Bybit 能列出 xStocks，且标明是**独立发行方**而非 Bybit 自营
3. Binance 条目标明**交易所自营发行**
4. Aave / Morpho 不出现在购买渠道分组里
5. BNB Chain 只出现一次，不与 BSC 并列
6. 页面总高度不超过改动前（用构建产物的 HTML 字节数对比，不靠肉眼）
7. `pnpm typecheck` + 现有测试全绿

---

## 七、风险与取舍

**数据准确性是最大风险，不是工程。** `issuanceModel` 和 `operatedByIssuer` 需要逐家核实法律发行主体与渠道归属。10 家里有 4 家（remora / backpack / prestocks / dinari 部分字段）当前是 `unknown` —— **这些必须保持 `unknown`，不能为了让表格好看而猜**。站上那篇长尾研究已经确立了这个原则：信息不足导出的结论和负面结论应当导向同一个行动。

**双视角会增加客户端 JS。** `/stocks` 目前是纯服务端静态页，加 `'use client'` 组件会引入一份 hydration 成本。数据量很小（10 家发行方），影响可忽略，但这是从「零 JS」到「有 JS」的性质变化，值得知情。

**替换而非追加需要你拍板。** §4.1 的方案是把现有发行方表格**换掉**。如果你希望保留原表格、另加一个交易所视图，页面会变长 —— 这和你上一轮砍内容的意图冲突，所以我默认选了替换。
