export type CryptoCard = {
  name: string;
  description: string;
  rewards: string;
  annualFee: string;
  link: string;
  pros: string[];
  cons: string[];
};

export type Book = {
  title: string;
  author: string;
  category:
    | 'intro'
    | 'thinking'
    | 'economics'
    | 'cognitive'
    | 'strategy'
    | 'innovation'
    | 'growth'
    | 'expression'
    | 'gamification';
  year: number;
  description: string;
  tags: string[];
  doubanLink?: string;
  amazonLink?: string;
};

export type DataSource = {
  name: string;
  description: string;
  category: 'market' | 'onchain' | 'defi' | 'news' | 'research' | 'language' | 'visa';
  link: string;
  isPaid: boolean;
  tags: string[];
};

export type AITool = {
  name: string;
  description: string;
  category: 'coding' | 'content' | 'research' | 'productivity' | 'design';
  link: string;
  pricing: 'free' | 'freemium' | 'paid';
  features: string[];
};

// Mock data for Crypto Cards
export const cryptoCards: CryptoCard[] = [
  {
    name: 'Bybit Card',
    description: 'Crypto card with rewards and trading benefits',
    rewards: 'Up to 5% cashback',
    annualFee: '$0',
    link: 'https://partner.bybit.com/b/140259',
    pros: ['No annual fee', 'High cashback rate', 'Integrated with Bybit exchange'],
    cons: ['Requires Bybit account', 'Availability by region']
  },
  {
    name: 'Coinbase Card',
    description: 'Visa debit card that earns crypto rewards on every purchase',
    rewards: 'Up to 4% back in crypto',
    annualFee: '$0',
    link: 'https://www.coinbase.com/card',
    pros: ['No annual fee', 'High rewards rate', 'Multiple crypto options'],
    cons: ['Requires Coinbase account', 'Limited availability']
  },
  {
    name: 'Crypto.com Visa Card',
    description: 'Metal card with crypto cashback and premium benefits',
    rewards: 'Up to 5% cashback',
    annualFee: 'Varies by tier',
    link: 'https://crypto.com/cards',
    pros: ['Netflix/Spotify rebates', 'Airport lounge access', 'High cashback'],
    cons: ['CRO staking required', 'Withdrawal limits']
  },
  {
    name: 'Binance Card',
    description: 'Virtual or physical card linked to Binance account',
    rewards: 'Up to 8% cashback',
    annualFee: '$0',
    link: 'https://www.binance.com/card',
    pros: ['Highest cashback potential', 'No fees', 'Global acceptance'],
    cons: ['BNB holding required for max rewards', 'Regional restrictions']
  }
];

// Mock data for Books
export const books: Book[] = [
  // 1. 入门书籍
  {
    title: '社会心理学（插图第七版）',
    author: 'Elliot Aronson 等',
    category: 'intro',
    year: 2010,
    description: '深入浅出地讲解社会心理学原理，适合产品经理和商业从业者理解用户行为',
    tags: ['社会心理学', '产品经理第一本书'],
    doubanLink: 'https://book.douban.com/subject/5952567/',
    amazonLink: 'https://www.amazon.com/Social-Psychology-7th-Elliot-Aronson/dp/0132382458'
  },
  {
    title: '第一本经济学',
    author: '蒂莫西·泰勒',
    category: 'intro',
    year: 2012,
    description: '通俗讲解经济学基础知识，帮助读者建立经济思维框架',
    tags: ['经济学入门'],
    doubanLink: 'https://book.douban.com/subject/20396031/',
    amazonLink: 'https://www.amazon.com/Economics-Principles-Context-Timothy-Taylor/dp/0618379533'
  },
  {
    title: '学会提问',
    author: 'Neil Browne, Stuart M. Keeley',
    category: 'intro',
    year: 2006,
    description: '教你如何分析信息的真伪，提高独立思考能力',
    tags: ['批判性思维', '信息辨别'],
    doubanLink: 'https://book.douban.com/subject/20428922/',
    amazonLink: 'https://www.amazon.com/Asking-Right-Questions-Critical-Thinking/dp/0321907957'
  },

  // 2. 思维与决策
  {
    title: '认知心理学及其启示（第8版）',
    author: 'John R. Anderson',
    category: 'thinking',
    year: 2014,
    description: '讲解人类如何处理信息、学习、记忆和做决策',
    tags: ['认知心理学', '思维机制'],
    doubanLink: 'https://book.douban.com/subject/26742422/',
    amazonLink: 'https://www.amazon.com/Cognitive-Psychology-Its-Implications-Anderson/dp/1464148597'
  },
  {
    title: '思考，快与慢',
    author: '丹尼尔·卡尼曼',
    category: 'thinking',
    year: 2011,
    description: '提出系统1（直觉）与系统2（理性）两种思维模式，解析人类决策的缺陷',
    tags: ['行为经济学', '认知偏差'],
    doubanLink: 'https://book.douban.com/subject/10785583/',
    amazonLink: 'https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555'
  },
  {
    title: '超越智商',
    author: '基思·斯坦诺维奇',
    category: 'thinking',
    year: 2009,
    description: '讨论为什么智商高并不等于决策能力强，如何克服认知缺陷',
    tags: ['理性决策', '认知误区'],
    doubanLink: 'https://book.douban.com/subject/26605978/',
    amazonLink: 'https://www.amazon.com/What-Intelligence-Tests-Miss-Psychology/dp/0300164629'
  },
  {
    title: '思维与决策（第四版）',
    author: 'Jonathan Baron',
    category: 'thinking',
    year: 2012,
    description: '全面介绍思维与决策领域的核心理论',
    tags: ['决策科学', '系统思考'],
    doubanLink: 'https://book.douban.com/subject/25800815/',
    amazonLink: 'https://www.amazon.com/Thinking-Deciding-Jonathan-Baron/dp/0521680433'
  },

  // 3. 经济学与商业模式
  {
    title: '经济学原理（微观分册）（第8版）',
    author: 'N. Gregory Mankiw',
    category: 'economics',
    year: 2018,
    description: '全球最广泛使用的经济学入门教材之一',
    tags: ['经济学基础', '经典教材'],
    doubanLink: 'https://book.douban.com/subject/26435630/',
    amazonLink: 'https://www.amazon.com/Principles-Microeconomics-N-Gregory-Mankiw/dp/1305971493'
  },
  {
    title: '错误的行为',
    author: 'Richard H. Thaler',
    category: 'economics',
    year: 2015,
    description: '行为经济学是产品经理最需要理解的经济学分支',
    tags: ['行为经济学', '认知偏差'],
    doubanLink: 'https://book.douban.com/subject/26857216/',
    amazonLink: 'https://www.amazon.com/Misbehaving-Behavioral-Economics-Richard-Thaler/dp/0393352803'
  },
  {
    title: '新制度经济学：一个交易费用分析范式',
    author: '张五常',
    category: 'economics',
    year: 2000,
    description: '从交易费用角度理解制度、市场和商业模式的运作',
    tags: ['交易费用理论', '商业模式'],
    doubanLink: 'https://book.douban.com/subject/1117608/',
    amazonLink: 'https://www.amazon.com/Economic-Explanation-Steven-N-Cheung/dp/9629960079'
  },

  // 4. 思维框架与认知升级
  {
    title: '乌合之众',
    author: '古斯塔夫·勒庞',
    category: 'cognitive',
    year: 1895,
    description: '研究群体如何影响个体行为和决策',
    tags: ['群体心理学'],
    doubanLink: 'https://book.douban.com/subject/1012611/',
    amazonLink: 'https://www.amazon.com/Crowd-Study-Popular-Mind/dp/1420931237'
  },
  {
    title: '影响力',
    author: '罗伯特·西奥迪尼',
    category: 'cognitive',
    year: 1984,
    description: '解析如何影响和改变他人的决策',
    tags: ['行为心理学', '说服力'],
    doubanLink: 'https://book.douban.com/subject/1786387/',
    amazonLink: 'https://www.amazon.com/Influence-Psychology-Persuasion-Robert-Cialdini/dp/006124189X'
  },
  {
    title: '主权个人',
    author: '詹姆斯·戴尔·戴维森 & 威廉·瑞斯-莫格',
    category: 'cognitive',
    year: 1997,
    description: '探讨信息时代对个人、国家和财富的影响',
    tags: ['未来趋势', '个人自由'],
    doubanLink: 'https://book.douban.com/subject/25984683/',
    amazonLink: 'https://www.amazon.com/Sovereign-Individual-Mastering-Transition-Information/dp/0684832720'
  },
  {
    title: '无限游戏',
    author: '西蒙·西内克',
    category: 'cognitive',
    year: 2019,
    description: '区分短期竞争与长期游戏，强调可持续发展',
    tags: ['战略思维', '长期主义'],
    doubanLink: 'https://book.douban.com/subject/34835992/',
    amazonLink: 'https://www.amazon.com/Infinite-Game-Simon-Sinek/dp/0735213500'
  },

  // 5. 战略与组织管理
  {
    title: '从优秀到卓越',
    author: '吉姆·柯林斯',
    category: 'strategy',
    year: 2001,
    description: '分析企业如何实现长期成功',
    tags: ['企业成长', '组织管理'],
    doubanLink: 'https://book.douban.com/subject/1128956/',
    amazonLink: 'https://www.amazon.com/Good-Great-Some-Companies-Others/dp/0066620996'
  },
  {
    title: '基业长青',
    author: '吉姆·柯林斯 & 杰里·波勒斯',
    category: 'strategy',
    year: 1994,
    description: '研究企业如何保持长期竞争力',
    tags: ['企业长青法则'],
    doubanLink: 'https://book.douban.com/subject/1102405/',
    amazonLink: 'https://www.amazon.com/Built-Last-Successful-Visionary-Essentials/dp/0060516402'
  },
  {
    title: '指数型组织',
    author: '萨利姆·伊斯梅尔 等',
    category: 'strategy',
    year: 2014,
    description: '讲解如何构建指数级增长的企业',
    tags: ['数字化增长', '组织创新'],
    doubanLink: 'https://book.douban.com/subject/26878299/',
    amazonLink: 'https://www.amazon.com/Exponential-Organizations-organizations-better-cheaper/dp/1626814236'
  },
  {
    title: '海星与蜘蛛',
    author: '奥里·布莱福曼 & 罗德·贝克斯特伦',
    category: 'strategy',
    year: 2006,
    description: '对比去中心化与传统组织模式的优劣势',
    tags: ['去中心化管理', '组织架构'],
    doubanLink: 'https://book.douban.com/subject/3204746/',
    amazonLink: 'https://www.amazon.com/Starfish-Spider-Unstoppable-Leaderless-Organizations/dp/1591841836'
  },

  // 6. 创新与产品
  {
    title: '精益创业',
    author: '埃里克·莱斯',
    category: 'innovation',
    year: 2011,
    description: '强调快速试错、数据驱动优化',
    tags: ['创业方法论', 'MVP'],
    doubanLink: 'https://book.douban.com/subject/10945606/',
    amazonLink: 'https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898'
  },
  {
    title: '俞军产品方法论',
    author: '俞军',
    category: 'innovation',
    year: 2021,
    description: '介绍产品经理的核心思维方式',
    tags: ['互联网产品思维', '用户增长'],
    doubanLink: 'https://book.douban.com/subject/34907971/',
    amazonLink: 'https://www.amazon.com/Product-Methodology-Jun-Yu/dp/7111665783'
  },
  {
    title: '炼金术',
    author: '罗里·萨瑟兰',
    category: 'innovation',
    year: 2019,
    description: '用非线性思维看待市场和消费者心理',
    tags: ['营销心理学', '行为经济学'],
    doubanLink: 'https://book.douban.com/subject/30384396/',
    amazonLink: 'https://www.amazon.com/Alchemy-Curious-Science-Creating-Business/dp/0062388436'
  },
  {
    title: '王慧文清华产品课（Allen修订版）',
    author: '王慧文',
    category: 'innovation',
    year: 2020,
    description: '清华大学产品课程精华，系统讲解产品思维',
    tags: ['产品思维', '互联网'],
    doubanLink: 'https://book.douban.com/subject/35594496/',
    amazonLink: 'https://www.amazon.com/dp/B08QVTXWXF'
  },

  // 7. 个人成长与思维方式
  {
    title: '启示录',
    author: '马蒂·卡根',
    category: 'growth',
    year: 2005,
    description: '硅谷产品团队的创新思维',
    tags: ['产品设计', '用户体验'],
    doubanLink: 'https://book.douban.com/subject/5914587/',
    amazonLink: 'https://www.amazon.com/Inspired-Create-Tech-Products-Customers/dp/1119387507'
  },
  {
    title: '史蒂夫·乔布斯传',
    author: '沃尔特·艾萨克森',
    category: 'growth',
    year: 2011,
    description: '讲解乔布斯的管理、设计和产品哲学',
    tags: ['企业家精神', '创新思维'],
    doubanLink: 'https://book.douban.com/subject/6798611/',
    amazonLink: 'https://www.amazon.com/Steve-Jobs-Walter-Isaacson/dp/1451648537'
  },
  {
    title: '简约至上',
    author: '贾尔斯·科尔本',
    category: 'growth',
    year: 2010,
    description: '探讨极简设计法则',
    tags: ['用户体验', '设计哲学'],
    doubanLink: 'https://book.douban.com/subject/5394309/',
    amazonLink: 'https://www.amazon.com/Simple-Usability-Interaction-Voices-Matter/dp/0321703545'
  },
  {
    title: '失控',
    author: '凯文·凯利',
    category: 'growth',
    year: 1994,
    description: '分析互联网、自组织系统等如何推动社会变革',
    tags: ['复杂系统', '科技发展'],
    doubanLink: 'https://book.douban.com/subject/5375620/',
    amazonLink: 'https://www.amazon.com/Out-Control-New-Biology-Machines/dp/0201483408'
  },

  // 8. 结构化思维与表达
  {
    title: '金字塔原理',
    author: '芭芭拉·明托',
    category: 'expression',
    year: 1978,
    description: '讲解如何清晰表达观点，提高沟通效率',
    tags: ['逻辑表达', '结构化思维'],
    doubanLink: 'https://book.douban.com/subject/1020644/',
    amazonLink: 'https://www.amazon.com/Pyramid-Principle-Logic-Writing-Thinking/dp/0273710516'
  },
  {
    title: '故事力',
    author: '安妮特·西蒙斯',
    category: 'expression',
    year: 2015,
    description: '如何通过讲故事提升沟通和说服力',
    tags: ['叙事能力', '影响力'],
    doubanLink: 'https://book.douban.com/subject/26664164/',
    amazonLink: 'https://www.amazon.com/Story-Factor-Influence-Inspire-Action/dp/073820815X'
  },

  // 9. 游戏化与激励机制
  {
    title: '游戏化实战',
    author: '凯文·韦巴赫 & 丹·亨特',
    category: 'gamification',
    year: 2014,
    description: '用游戏元素驱动用户行为',
    tags: ['游戏设计', '激励机制'],
    doubanLink: 'https://book.douban.com/subject/25809787/',
    amazonLink: 'https://www.amazon.com/Gamification-Design-Implementing-Mechanics-Mobile/dp/1449397670'
  },
  {
    title: '佛畏系统',
    author: '尼尔·埃亚尔',
    category: 'gamification',
    year: 2015,
    description: '讲解如何设计让用户上瘾的产品',
    tags: ['行为设计', '用户习惯'],
    doubanLink: 'https://book.douban.com/subject/27030507/',
    amazonLink: 'https://www.amazon.com/Hooked-How-Build-Habit-Forming-Products/dp/1591847788'
  }
];

// Mock data for Data Sources
export const dataSources: DataSource[] = [
  {
    name: 'growthepie',
    description: 'Ethereum ecosystem metrics and L2 analytics dashboard',
    category: 'onchain',
    link: 'https://www.growthepie.com/ethereum-ecosystem/metrics',
    isPaid: false,
    tags: ['ethereum', 'L2', 'metrics', 'ecosystem']
  },
  {
    name: 'CryptoSlate',
    description: 'Market data and economic indicators for crypto',
    category: 'market',
    link: 'https://cryptoslate.com/data/',
    isPaid: false,
    tags: ['market data', 'indicators', 'price', 'volume']
  },
  {
    name: 'BGeometrics',
    description: 'Advanced crypto charts and market analysis tools',
    category: 'market',
    link: 'https://charts.bgeometrics.com/',
    isPaid: false,
    tags: ['charts', 'analysis', 'technical', 'trading']
  },
  {
    name: 'Dune Analytics - Uniswap',
    description: 'Uniswap volume analytics by chain, version, and fee tier',
    category: 'defi',
    link: 'https://dune.com/uniswaplabs/yearly-uniswap-volume-cuts',
    isPaid: false,
    tags: ['uniswap', 'DEX', 'volume', 'analytics']
  },
  {
    name: 'Hyperbot',
    description: 'Automated trading and analytics platform',
    category: 'defi',
    link: 'https://hyperbot.network/',
    isPaid: false,
    tags: ['trading', 'automation', 'analytics', 'bot']
  },
  {
    name: 'Stacy in Dataland',
    description: 'Crypto data analysis and insights newsletter',
    category: 'research',
    link: 'https://stacymuur.substack.com/',
    isPaid: false,
    tags: ['newsletter', 'analysis', 'research', 'insights']
  },
  {
    name: 'Crypto Treasury Tracker',
    description: 'Track corporate and institutional crypto treasury holdings',
    category: 'market',
    link: 'https://crypto-treasury-tracker.streamlit.app/',
    isPaid: false,
    tags: ['treasury', 'institutional', 'holdings', 'corporate']
  },
  {
    name: 'BitcoinTreasuries.NET',
    description: 'Top companies holding Bitcoin in their treasury',
    category: 'market',
    link: 'https://bitcointreasuries.net/',
    isPaid: false,
    tags: ['bitcoin', 'treasury', 'companies', 'holdings']
  },
  {
    name: 'Strategic ETH Reserve',
    description: 'Ethereum strategic reserve tracking and analytics',
    category: 'onchain',
    link: 'https://www.strategicethreserve.xyz/',
    isPaid: false,
    tags: ['ethereum', 'reserve', 'tracking', 'SER']
  },
  {
    name: 'OAK Research',
    description: '加密货币数据、分析和研究平台',
    category: 'research',
    link: 'https://oakresearch.io/en/home',
    isPaid: false,
    tags: ['research', 'data', 'analysis', 'chinese']
  },
  {
    name: 'The DeFi Report',
    description: 'DeFi protocols analysis and market reports',
    category: 'defi',
    link: 'https://thedefireport.io/',
    isPaid: false,
    tags: ['DeFi', 'reports', 'protocols', 'analysis']
  },
  {
    name: 'Bankless',
    description: 'Leading crypto media and education platform for the bankless revolution',
    category: 'news',
    link: 'https://www.bankless.com/refer/kkdemian',
    isPaid: false,
    tags: ['news', 'education', 'podcast', 'newsletter']
  },
  {
    name: 'Artemis Analytics',
    description: 'Comprehensive cross-chain analytics platform for tracking protocol metrics and market data',
    category: 'onchain',
    link: 'https://app.artemisanalytics.com/home',
    isPaid: false,
    tags: ['cross-chain', 'analytics', 'metrics', 'protocols']
  },
  {
    name: 'Dune Analytics - Perp DEX',
    description: 'Perpetual DEX trading volume analytics across Hyperliquid, Lighter, Aster and other major platforms',
    category: 'defi',
    link: 'https://dune.com/uwusanauwu/perps',
    isPaid: false,
    tags: ['perp', 'DEX', 'volume', 'derivatives', 'dune']
  },
  {
    name: 'Nansen',
    description: 'On-chain analytics platform with smart money tracking and wallet insights',
    category: 'onchain',
    link: 'https://app.nansen.ai/',
    isPaid: true,
    tags: ['on-chain', 'analytics', 'smart-money', 'wallet-tracking']
  },
  {
    name: 'Token Terminal',
    description: 'Crypto protocol financial metrics and revenue analytics dashboard',
    category: 'research',
    link: 'https://tokenterminal.com/explorer/projects',
    isPaid: false,
    tags: ['metrics', 'revenue', 'fundamentals', 'protocols']
  },
  {
    name: 'Blockworks Treasury Analytics',
    description: 'Track companies and institutions holding crypto in their treasuries',
    category: 'market',
    link: 'https://blockworks.com/analytics/treasury-companies',
    isPaid: false,
    tags: ['treasury', 'institutional', 'companies', 'holdings']
  },
  {
    name: 'USDC Range',
    description: 'Monitor CCTP USDC cross-chain transfers and flow analytics across different blockchains',
    category: 'onchain',
    link: 'https://usdc.range.org/',
    isPaid: false,
    tags: ['USDC', 'CCTP', 'cross-chain', 'stablecoin', 'transfers']
  },
  {
    name: 'Farside Investors',
    description: 'Daily Bitcoin, Ethereum, and SOL ETF fund flow tracking and analytics',
    category: 'market',
    link: 'https://farside.co.uk/btc/',
    isPaid: false,
    tags: ['ETF', 'fund-flow', 'bitcoin', 'ethereum', 'SOL', 'institutional']
  },
  {
    name: 'Hyperliquid Analytics',
    description: 'Hyperliquid protocol metrics tracking including staking, buybacks, auctions, and burns',
    category: 'defi',
    link: 'https://data.asxn.xyz/dashboard/hl-buybacks',
    isPaid: false,
    tags: ['hyperliquid', 'buybacks', 'staking', 'auctions', 'burns', 'protocol']
  },
  {
    name: 'Hypurrscan',
    description: 'Hyperliquid ecosystem dashboard tracking HLP staking yields, trading fees, auction fees, and TSWAP auctions',
    category: 'defi',
    link: 'https://hypurrscan.io/dashboard',
    isPaid: false,
    tags: ['hyperliquid', 'HLP', 'staking', 'yields', 'fees', 'TSWAP', 'auctions']
  },
  {
    name: 'Chainspect',
    description: 'Crypto developer activity ranking and analytics tracking project development metrics',
    category: 'research',
    link: 'https://chainspect.app/dashboard/developer-activity',
    isPaid: false,
    tags: ['developer', 'activity', 'github', 'metrics', 'ranking']
  },
  {
    name: 'Robinhood Stock Tokens Analytics',
    description: 'On-chain analytics for Robinhood stock tokens tracking volume and activity',
    category: 'onchain',
    link: 'https://dune.com/entropy_advisors/robinhood-stock-tokens',
    isPaid: false,
    tags: ['robinhood', 'stocks', 'tokenized-assets', 'dune', 'RWA']
  },
  {
    name: 'Stablewatch',
    description: 'Comprehensive stablecoin ecosystem analytics tracking issuance, yields, RWA returns, and market dynamics',
    category: 'defi',
    link: 'https://www.stablewatch.io/analytics',
    isPaid: false,
    tags: ['stablecoin', 'yields', 'RWA', 'issuance', 'analytics']
  },
  {
    name: 'Prediction Index',
    description: 'Comprehensive map of prediction markets tracking platforms and trading activity',
    category: 'market',
    link: 'https://predictionindex.xyz/',
    isPaid: false,
    tags: ['prediction-markets', 'betting', 'polymarket', 'analytics', 'map']
  },
  {
    name: 'Japanese Grammar Guide',
    description: 'Comprehensive Japanese grammar reference and learning resource',
    category: 'language',
    link: 'https://res.wokanxing.info/jpgramma/index.html',
    isPaid: false,
    tags: ['japanese', 'grammar', 'learning', 'reference']
  },
  {
    name: 'Learn Japanese Guide',
    description: 'Complete guide for learning Japanese language from basics to advanced',
    category: 'language',
    link: 'https://learnjapanese.moe/guide/',
    isPaid: false,
    tags: ['japanese', 'learning', 'guide', 'tutorial']
  },
  {
    name: 'Kotobank',
    description: 'Comprehensive Japanese native dictionary with extensive definitions and examples',
    category: 'language',
    link: 'https://kotobank.jp/',
    isPaid: false,
    tags: ['japanese', 'dictionary', 'native', 'reference', 'definitions']
  },
  {
    name: 'Dan Romero Crypto Reading',
    description: 'Curated crypto reading list and resources by Dan Romero',
    category: 'news',
    link: 'https://danromero.org/crypto-reading/',
    isPaid: false,
    tags: ['reading', 'resources', 'curated', 'education']
  },
  {
    name: 'a16z Crypto',
    description: 'Andreessen Horowitz crypto research, insights, and industry analysis',
    category: 'news',
    link: 'https://a16zcrypto.com/',
    isPaid: false,
    tags: ['a16z', 'research', 'VC', 'insights', 'analysis']
  },
  {
    name: 'Obviously',
    description: 'Crypto newsletter and analysis covering market trends and insights',
    category: 'news',
    link: 'https://obviously.substack.com/',
    isPaid: false,
    tags: ['newsletter', 'analysis', 'trends', 'substack']
  },
  {
    name: 'Japan Immigration Guide',
    description: 'Comprehensive guide for relocating and immigrating to Japan',
    category: 'visa',
    link: 'https://paragraph.com/@guoyu/QEW9hZWgfe38qPVKtvhI',
    isPaid: false,
    tags: ['japan', 'immigration', 'visa', 'relocation', 'guide']
  },
  {
    name: 'Web3 AI Digital Nomad Community',
    description: 'Community for Web3 and AI-focused digital nomads',
    category: 'visa',
    link: 'https://ns.com/chuhemiao/apply',
    isPaid: false,
    tags: ['digital-nomad', 'web3', 'AI', 'community', 'network']
  },
  {
    name: 'Nomads.com',
    description: 'World\'s largest digital nomad community and resource hub',
    category: 'visa',
    link: 'https://nomads.com/',
    isPaid: false,
    tags: ['digital-nomad', 'community', 'resources', 'travel', 'remote-work']
  },
  {
    name: 'Praxis Nation',
    description: 'Niche digital nomad platform for building new societies and communities',
    category: 'visa',
    link: 'https://www.praxisnation.com/',
    isPaid: false,
    tags: ['digital-nomad', 'community', 'network-state', 'startup-cities']
  },
  {
    name: 'Palladium Magazine',
    description: 'Magazine covering governance, technology, and society for digital nomads',
    category: 'visa',
    link: 'https://www.palladiummag.com/',
    isPaid: false,
    tags: ['magazine', 'governance', 'technology', 'society', 'reading']
  },
  {
    name: 'Mindtrip',
    description: 'AI-powered travel planning agent for creating personalized trip itineraries',
    category: 'visa',
    link: 'https://mindtrip.ai/home',
    isPaid: false,
    tags: ['travel', 'AI', 'planning', 'itinerary', 'agent']
  }
];

// Mock data for AI Tools
export const aiTools: AITool[] = [
  {
    name: 'Claude',
    description: 'Advanced AI assistant by Anthropic for coding and analysis',
    category: 'coding',
    link: 'https://claude.ai',
    pricing: 'freemium',
    features: ['Code generation', 'Code review', 'Long context', 'Analysis']
  },
  {
    name: 'Bolt.new',
    description: 'AI-powered full-stack web development in the browser',
    category: 'coding',
    link: 'https://bolt.new/',
    pricing: 'freemium',
    features: ['Full-stack development', 'Instant deployment', 'AI coding', 'Browser IDE']
  },
  {
    name: 'v0',
    description: 'AI-powered UI generator by Vercel',
    category: 'design',
    link: 'https://v0.dev',
    pricing: 'freemium',
    features: ['Component generation', 'React/Next.js', 'Tailwind CSS']
  },
  {
    name: 'Gemini',
    description: 'Google\'s multimodal AI assistant for research and productivity',
    category: 'productivity',
    link: 'https://gemini.google.com',
    pricing: 'freemium',
    features: ['Multimodal AI', 'Code generation', 'Real-time info', 'Integration']
  },
  {
    name: 'AskSurf',
    description: 'AI-powered crypto research and analysis assistant',
    category: 'research',
    link: 'https://asksurf.ai/?r=XBYRVTXVQB8L',
    pricing: 'freemium',
    features: ['Crypto research', 'Market analysis', 'On-chain data', 'Insights']
  },
  {
    name: 'Notion AI',
    description: 'AI writing assistant integrated in Notion',
    category: 'content',
    link: 'https://www.notion.so/product/ai',
    pricing: 'paid',
    features: ['Writing assistance', 'Summarization', 'Translation']
  },
  {
    name: 'YouMind',
    description: 'AI-powered writing and thinking tool for content creation',
    category: 'content',
    link: 'https://youmind.com/invite/1P8VWA',
    pricing: 'freemium',
    features: ['Writing assistance', 'Brainstorming', 'Content generation', 'Mindmapping']
  },
  {
    name: 'ChatGPT',
    description: 'Versatile AI assistant by OpenAI',
    category: 'productivity',
    link: 'https://chat.openai.com',
    pricing: 'freemium',
    features: ['Conversation', 'Code generation', 'Analysis', 'Plugins']
  }
];
