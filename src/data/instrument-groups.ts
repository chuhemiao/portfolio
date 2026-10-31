import type { InstrumentGroup } from './tokenized-equities';

/**
 * Five instruments per group, grouped by argument rather than by market cap.
 * One research article covers one group, published in order. Every figure in a
 * thesis is from the CMC snapshot in ./instruments/quotes.json — when the
 * snapshot moves, these read as of that date, so an article quoting one dates
 * itself explicitly.
 *
 * Group 21 is missing: CMC reports 105 instruments and the payload on hand has
 * 100. It gets written once the last five arrive.
 */
export const INSTRUMENT_GROUPS: InstrumentGroup[] = [
  {
    slug: 'flagship-pricing-anchors',
    index: 1,
    issuerSlug: 'bstocks',
    tickers: ['SPCXB', 'CRCLB', 'GOOGLB', 'MSTRB', 'QQQB'],
    title: ['Five flagships, five pricing anchors', '旗舰与五种定价锚', '旗艦5銘柄、5つの価格アンカー'],
    thesis: [
      'The five largest are 47.4% of all bStocks value and no two are priced the same way: SPCXB tracks a private valuation with no public quote, CRCLB a recently listed stock, GOOGLB a mega-cap, MSTRB a bitcoin treasury, QQQB an index fund. Ranked by how loose the anchor is, the range traded since listing opens up from 1.158x to 2.168x.',
      '最大的 5 个占全盘 47.4%，却是 5 种完全不同的定价依据：SPCXB 追未上市公司的内部估值、CRCLB 追新股、GOOGLB 追蓝筹、MSTRB 追持币实体、QQQB 追指数。按锚的松紧排序，上市以来的区间宽度从 1.158× 展开到 2.168×。',
      '上位5銘柄で全体の47.4%を占めるが、価格の根拠は5通りすべて異なる。SPCXBは未公開企業の評価、CRCLBは新規上場株、GOOGLBは大型株、MSTRBはビットコイン保有法人、QQQBは指数。アンカーの緩さで並べると、上場以来のレンジ幅は1.158倍から2.168倍へ開く。',
    ],
    articleSlugs: {
      'zh-CN': 'bstocks-flagship-pricing-anchors',
      en: 'bstocks-flagship-pricing-anchors-en',
      ja: 'bstocks-flagship-pricing-anchors-ja',
    },
  },
  {
    slug: 'single-stock-2x-etfs',
    index: 2,
    issuerSlug: 'bstocks',
    tickers: ['MUUB', 'SNXXB', 'INTWB', 'MVLLB', 'SKUUB'],
    title: ['The denominator trap', '分母陷阱', '分母の罠'],
    thesis: [
      'Turnover of 0.58x, 4.17x, 38.46x, 2.60x and 0.96x — and INTWB, the highest on the book, still did less volume than its own spot token INTCB ($55.54M against $67.90M). All five 2x tokens trade below their spot counterparts; they hold 11.3% of those tokens market cap and do 44.6% of their volume. The turnover is the denominator, not the trading.',
      '换手 0.58× / 4.17× / 38.46× / 2.60× / 0.96×，而全盘第一的 INTWB 成交额仍低于自己的现货版 INTCB（$5,554 万 对 $6,790 万）。5 个 2x 的成交额全部低于各自的现货版本；它们只占现货 5 个市值的 11.3%，却做了成交额的 44.6%。高换手来自分母，不是来自成交。',
      '回転率は0.58倍・4.17倍・38.46倍・2.60倍・0.96倍。全体首位の INTWB でさえ出来高は自らの現物版 INTCB を下回る（5,554万ドル 対 6,790万ドル）。5つの2倍トークンはすべて現物版より出来高が小さく、現物5銘柄の時価総額の11.3%しか持たないのに出来高では44.6%を占める。高い回転率は分母が作ったもので、取引量ではない。',
    ],
    articleSlugs: {
      'zh-CN': 'bstocks-single-stock-2x-etfs',
      en: 'bstocks-single-stock-2x-etfs-en',
      ja: 'bstocks-single-stock-2x-etfs-ja',
    },
  },
  {
    slug: 'memory-supercycle',
    index: 3,
    issuerSlug: 'bstocks',
    tickers: ['SNDKB', 'MUB', 'SKHYB', 'DRAMB', 'WDCB'],
    title: ['The heaviest bet on the book', '内存超级周期', '最も厚く賭けられた一角'],
    thesis: [
      'SNDKB holds a $77.0M market cap against $97.8M of daily volume — 1.27x turnover — while DRAMB, an ETF over the same theme, turns over 0.19x. The single name is roughly seven times more liquid than the basket.',
      'SNDKB 市值 7,698 万、日成交 9,780 万，换手 1.27×；同一主题的 ETF（DRAMB）只有 0.19×。单票的流动性大约是篮子的 7 倍。',
      'SNDKBは時価総額7,698万ドルに対し日次出来高9,780万ドル、回転率1.27倍。同じテーマのETFであるDRAMBは0.19倍にとどまり、個別銘柄の流動性はバスケットの約7倍。',
    ],
  },
  {
    slug: 'semiconductor-design-and-fabs',
    index: 4,
    issuerSlug: 'bstocks',
    tickers: ['NVDAB', 'AVGOB', 'AMDB', 'TSMB', 'ARMB'],
    title: ['Attention inside one sector', '半导体设计与制造', 'セクター内の関心の偏り'],
    thesis: [
      'Same sector, very different engagement: NVDAB turns over 0.89x, ARMB 0.77x, TSMB 0.32x. Two of the five are ADRs, which changes what the token is a claim on.',
      '同一赛道内的注意力分布：NVDAB 换手 0.89×、ARMB 0.77×、TSMB 0.32×。五个里有两个的标的是 ADR，这改变了代币到底对应什么。',
      '同じセクターでも関心は大きく異なる。NVDAB 0.89倍、ARMB 0.77倍、TSMB 0.32倍。5銘柄のうち2つは原資産がADRで、トークンが何に対する請求権なのかが変わる。',
    ],
  },
  {
    slug: 'directional-3x-and-volatility',
    index: 5,
    issuerSlug: 'bstocks',
    tickers: ['SOXLB', 'SOXSB', 'TQQQB', 'SQQQB', 'UVXYB'],
    title: ['Both sides of the same bet', '方向性 3X 与波动率', '同じ賭けの両側'],
    thesis: [
      'Bull and bear 3X of the same index, listed together. Over 30 days SOXLB fell 51.9% while SOXSB rose 70.8%. These are directional instruments with a decay cost, not holdings.',
      '同一指数的多空 3X 同时上架。30 日内 SOXLB −51.9%，SOXSB +70.8%。这是带损耗的方向性工具，不是可以持有的标的。',
      '同一指数の強気3Xと弱気3Xが同時に上場。30日間でSOXLBは51.9%下落、SOXSBは70.8%上昇した。保有するための銘柄ではなく、減価を伴う方向性の道具である。',
    ],
  },
  {
    slug: 'crypto-treasury-equities',
    index: 6,
    issuerSlug: 'bstocks',
    tickers: ['BNCB', 'BMNRB', 'FWDIB', 'CYPHB', 'USDEB'],
    title: ['An exchange tokenizing coin-holding companies', '加密财库股', '通貨保有企業をトークン化する取引所'],
    thesis: [
      'An exchange issuing tokens over companies whose main asset is crypto — including a BNB treasury company, BNCB, which listed on 2026-09-14 and is already the tenth largest instrument here. The conflict of interest needs stating outright.',
      '交易所自营发行「持币公司」的股票代币，其中 BNCB 是 BNB 财库公司，2026-09-14 上线即已是这里的第 10 大标的。利益冲突必须写明。',
      '主要資産が暗号資産である企業のトークンを、取引所自身が発行している。うちBNCBはBNBトレジャリー企業で、2026-09-14の上場で既に第10位の規模。利益相反は明記が必要。',
    ],
  },
  {
    slug: 'mag7-cold-half',
    index: 7,
    issuerSlug: 'bstocks',
    tickers: ['AAPLB', 'MSFTB', 'AMZNB', 'METAB', 'TSLAB'],
    title: ['The crypto channel does not want Apple', 'Mag7 的冷门一半', '暗号資産チャネルはAppleを求めていない'],
    thesis: [
      "TSLAB's $23.68M market cap is 12.7% larger than AAPLB ($5.45M), MSFTB ($4.37M), AMZNB ($3.73M) and METAB ($7.46M) combined. Preference in this channel does not resemble the public market's.",
      'TSLAB 市值 2,368 万，比 AAPLB（545 万）+ MSFTB（437 万）+ AMZNB（373 万）+ METAB（746 万）加起来还多 12.7%。这个渠道的偏好和公开市场完全不同。',
      'TSLABの時価総額2,368万ドルは、AAPLB（545万）、MSFTB（437万）、AMZNB（373万）、METAB（746万）の合計を12.7%上回る。このチャネルの選好は公開市場とまったく違う。',
    ],
  },
  {
    slug: 'asia-exposure',
    index: 8,
    issuerSlug: 'bstocks',
    tickers: ['EWYB', 'KORUB', 'KSTRB', 'BABAB', 'PDDB'],
    title: ['Korea, bet on four times over', '亚洲敞口', '4回重ねて賭けられた韓国'],
    thesis: [
      'The Korea trade appears four times across the book: SKHYB on the single name, SKUUB at 2x, KORUB at 3X and EWYB on the broad index. KORUB is down 49.7% over 30 days.',
      '韩国这条线在全盘被重复下注四次：SKHYB 现货、SKUUB 2x、KORUB 3X、EWYB 宽基。KORUB 30 日 −49.7%。',
      '韓国への賭けは4重になっている。個別のSKHYB、2倍のSKUUB、3XのKORUB、そして広範指数のEWYB。KORUBは30日で49.7%下落。',
    ],
  },
  {
    slug: 'optics-and-interconnect',
    index: 9,
    issuerSlug: 'bstocks',
    tickers: ['AAOIB', 'LITEB', 'COHRB', 'CRDOB', 'MRVLB'],
    title: ['The second layer of AI capex', '光模块与互联', 'AI設備投資の二次受益'],
    thesis: [
      'Optics and interconnect sit one step downstream of the accelerator buildout. Engagement splits sharply: AAOIB turns over 0.59x and CRDOB 2.92x, while COHRB sits at 0.14x.',
      '光模块与互联是算力建设的第二层受益者。注意力分化明显：AAOIB 换手 0.59×、CRDOB 2.92×，而 COHRB 只有 0.14×。',
      '光モジュールと相互接続は、アクセラレータ投資の一段下流にある。関心の差は大きく、AAOIBは0.59倍、CRDOBは2.92倍、一方COHRBは0.14倍。',
    ],
  },
  {
    slug: 'neoclouds-and-datacenters',
    index: 10,
    issuerSlug: 'bstocks',
    tickers: ['CRWVB', 'NBISB', 'CBRSB', 'IRENB', 'SMCIB'],
    title: ['When the data is wrong about the data', '新算力与数据中心', 'データ自体が間違っているとき'],
    thesis: [
      "NBISB's market cap is $12.8M, but the payload reports its fully diluted value as 0 because total supply is 0 — read the wrong field and the instrument vanishes. A group about compute capacity, and about trusting the figures.",
      'NBISB 市值 1,282 万，但这份数据里它的 FDV 是 0，因为 totalSupply 为 0 —— 取错字段这个标的就消失了。这一组既讲算力，也讲数字本身能不能信。',
      'NBISBの時価総額は1,282万ドルだが、総供給量が0のためFDVは0と報告される。誤ったフィールドを読めば銘柄そのものが消える。計算能力の話と、数字を信じられるかの話。',
    ],
  },
  {
    slug: 'ai-physical-bottleneck',
    index: 11,
    issuerSlug: 'bstocks',
    tickers: ['GEVB', 'VSTB', 'FLNCB', 'BEB', 'USARB'],
    title: ['Power and materials get no attention here', 'AI 的物理瓶颈', '電力と素材には関心が向かない'],
    thesis: [
      'The physical constraints on AI — generation, storage, rare earths. VSTB turns over 0.21x, sixth lowest of all 100 instruments, with GEVB just above it at 0.31x. This channel is not buying infrastructure.',
      'AI 的物理约束：发电、储能、稀土。VSTB 换手 0.21×，是 100 个标的里第六低，GEVB 0.31× 紧挨其上。这个渠道对基础设施股没兴趣。',
      'AIの物理的制約、すなわち発電・蓄電・レアアース。VSTBの回転率は0.21倍で100銘柄中6番目に低く、GEVBは0.31倍でそのすぐ上。このチャネルはインフラ株を買っていない。',
    ],
  },
  {
    slug: 'no-public-anchor',
    index: 12,
    issuerSlug: 'bstocks',
    tickers: ['QNTB', 'AGPUB', 'SHAZB', 'BOTB', 'SECZB'],
    title: ['A tokenized stock with nothing to track', '没有公开锚的标的', '追う対象のないトークン化株式'],
    thesis: [
      'None of these five has an established public listing to price against, and for SECZB and BOTB CMC carries no underlying name at all — the name had to be read off the token itself. If there is no anchor, what is the price?',
      '这五个都没有可对照的公开上市标的，其中 SECZB 和 BOTB 在 CMC 上连标的名都没有，只能从代币名反推。没有锚，价格是什么？',
      'この5銘柄にはいずれも価格を照合できる公開上場がなく、SECZBとBOTBについてはCMCに原資産名すら存在せず、トークン名から読み取るしかなかった。アンカーがないなら、価格とは何なのか。',
    ],
  },
  {
    slug: 'retail-narrative-stocks',
    index: 13,
    issuerSlug: 'bstocks',
    tickers: ['GMEB', 'AMCB', 'DJTB', 'HIMSB', 'GPROB'],
    title: ['Narrative stocks, after the narrative', '散户叙事股', '物語が終わったあとの物語株'],
    thesis: [
      'The names that trade on story rather than earnings. DJTB is down 38.1% over 30 days and 51.5% over 90; GMEB turns over 0.16x, near the bottom of the book.',
      '靠故事而非业绩交易的那批。DJTB 30 日 −38.1%、90 日 −51.5%；GMEB 换手 0.16×，接近全盘末段。',
      '業績ではなく物語で動く銘柄群。DJTBは30日で38.1%、90日で51.5%下落。GMEBの回転率は0.16倍で全体の下位に近い。',
    ],
  },
  {
    slug: 'legacy-tech-in-transition',
    index: 14,
    issuerSlug: 'bstocks',
    tickers: ['INTCB', 'IBMB', 'NOKB', 'BBB', 'QCOMB'],
    title: ['The most traded name in the top ten', '老牌科技的转型', '上位10銘柄で最も回転する銘柄'],
    thesis: [
      'INTCB turns over 1.75x — the highest among the ten largest instruments, ahead of SNDKB at 1.27x — while down 8.1% in a day and 47.6% over 30 days. Turnover here is exit, not interest.',
      'INTCB 换手 1.75×，是前 10 大市值里最高的（第二是 SNDKB 1.27×），同时 24h −8.1%、30 日 −47.6%。这里的高换手是离场，不是关注。',
      'INTCBの回転率は1.75倍で、上位10銘柄中最高（2位はSNDKBの1.27倍）。同時に24時間で8.1%、30日で47.6%下落している。ここでの高回転は関心ではなく退出である。',
    ],
  },
  {
    slug: 'broad-market-and-equipment',
    index: 15,
    issuerSlug: 'bstocks',
    tickers: ['SPYB', 'SMHB', 'ASMLB', 'AMATB', 'TMFB'],
    title: ['The quietest group on the book', '宽基与设备', '最も静かな一群'],
    thesis: [
      'Turnover runs from 0.13x (AMATB) to 1.09x (ASMLB), the lowest median of any group. Broad-market funds and equipment makers are held here, not traded.',
      '换手从 0.13×（AMATB）到 1.09×（ASMLB），中位数是所有组里最低的。宽基和设备股在这里是被持有，不是被交易。',
      '回転率は0.13倍（AMATB）から1.09倍（ASMLB）で、中位値は全グループ中最低。広範指数と装置メーカーは、ここでは取引されず保有されている。',
    ],
  },
  {
    slug: 'software-and-saas',
    index: 16,
    issuerSlug: 'bstocks',
    tickers: ['ORCLB', 'CRMB', 'ADBEB', 'PLTRB', 'CRWDB'],
    title: ['Enterprise software does not travel', '软件与 SaaS', 'エンタープライズソフトは越境しない'],
    thesis: [
      'CRMB does $91.8K of volume in a day against a $502K market cap. Enterprise software, the largest category in the public market, is close to the smallest here.',
      'CRMB 一天成交 9.18 万美元，市值 50.2 万。企业软件在公开市场是最大的板块，在这里接近最小。',
      'CRMBの日次出来高は9.18万ドル、時価総額は50.2万ドル。公開市場で最大のカテゴリーであるエンタープライズソフトが、ここではほぼ最小である。',
    ],
  },
  {
    slug: 'financials-and-payments',
    index: 17,
    issuerSlug: 'bstocks',
    tickers: ['JPMB', 'GSB', 'PYPLB', 'HOODB', 'COINB'],
    title: ['An exchange listing its own competitors', '金融与支付', '取引所が競合を上場させる'],
    thesis: [
      'COINB and HOODB are tokens over the two venues this issuer competes with, and they are the two largest in the group — COINB at $18.2M against JPMB at $500K. The bank stocks are an afterthought.',
      'COINB 与 HOODB 的标的是这家发行方的竞争对手，而它们是本组最大的两个 —— COINB 1,817 万，而 JPMB 只有 50.0 万。银行股在这里是陪衬。',
      'COINBとHOODBの原資産は、この発行体の競合2社である。そしてこの2つがグループ最大で、COINBは1,817万ドル、JPMBは50.0万ドル。銀行株はついでに置かれている。',
    ],
  },
  {
    slug: 'storage-hardware-and-systems',
    index: 18,
    issuerSlug: 'bstocks',
    tickers: ['STXB', 'DELLB', 'PENGB', 'ALABB', 'GLWB'],
    title: ['One name an order of magnitude apart', '存储硬件与整机', '桁がひとつ違う1銘柄'],
    thesis: [
      'ALABB turns over 5.11x while the rest of the group sits between 1.21x and 2.71x. A $674K instrument doing $3.44M a day is a different thing from its neighbours.',
      'ALABB 换手 5.11×，同组其余在 1.21×–2.71× 之间。一个市值 67.4 万的标的一天成交 344 万，和邻居不是一类东西。',
      'ALABBの回転率は5.11倍で、同グループの他は1.21〜2.71倍。時価総額67.4万ドルで日次344万ドルを取引する銘柄は、隣の銘柄とは別物である。',
    ],
  },
  {
    slug: 'space-and-materials',
    index: 19,
    issuerSlug: 'bstocks',
    tickers: ['RKLBB', 'ASTSB', 'AXTIB', 'APPB', 'RDDTB'],
    title: ['Small caps, borrowed liquidity', '太空与材料', '小型株と借り物の流動性'],
    thesis: [
      'RKLBB is the largest here at $9.15M and turns over 0.40x; RDDTB is the smallest at $0.46M and turns over 3.70x. The order in between is not clean — AXTIB at $3.01M runs 1.58x while the smaller ASTSB runs 0.97x — so size alone does not explain it.',
      'RKLBB 本组最大，市值 915 万、换手 0.40×；RDDTB 最小，46 万、换手 3.70×。但中间并不单调 —— AXTIB 市值 301 万却是 1.58×，比它小的 ASTSB 只有 0.97× —— 所以单靠规模解释不了。',
      'ここで最大のRKLBBは915万ドルで0.40倍、最小のRDDTBは46万ドルで3.70倍。ただし間は単調でなく、AXTIBは301万ドルで1.58倍、より小さいASTSBは0.97倍にとどまる。規模だけでは説明できない。',
    ],
  },
  {
    slug: 'pharma-and-consumer',
    index: 20,
    issuerSlug: 'bstocks',
    tickers: ['LLYB', 'MRNAB', 'NFLXB', 'WENB', 'BRKBB'],
    title: ['Why is a pharma stock second-most traded?', '医药与消费', 'なぜ製薬株が回転率2位なのか'],
    thesis: [
      'MRNAB turns over 10.31x, second only to INTWB on the entire book, on a $2.30M market cap and up 9.96% over 7 days. BRKBB, in the same group, turns over 0.22x. The reason for the gap is unexplained.',
      'MRNAB 换手 10.31×，是全盘第二高（仅次于 INTWB），市值 230 万、7 日 +9.96%。同组的 BRKBB 换手 0.22×。这个落差的原因还没查清。',
      'MRNABの回転率は10.31倍で、全体ではINTWBに次ぐ2位。時価総額230万ドル、7日で9.96%上昇している。同グループのBRKBBは0.22倍。この差の理由は未解明。',
    ],
  },
];

export const groupForTicker = (ticker: string) =>
  INSTRUMENT_GROUPS.find((group) => group.tickers.includes(ticker));
