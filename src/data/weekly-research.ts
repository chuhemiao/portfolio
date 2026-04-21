// Weekly Research data — edit this file to update reports.
// Add new entries at the TOP of the array (most recent first).

export interface WeeklyNewsItem {
  category: string;
  title: string;
  source: string;
  summary: string;
  action?: string;
}

export interface GeoItem {
  title: string;
  subtitle: string;
  content: string;
}

export interface WeeklyReport {
  id: string;
  dateRange: string;
  headline: string;
  generatedAt?: string;
  coreMacro?: string;
  coreCrypto?: string;
  coreActions?: string[];
  disclaimer?: string;
  usStocks?: string[];
  cryptoAssets?: string[];
  geopolitics?: GeoItem[];
  mustRead?: WeeklyNewsItem[];
}

export const WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: '2026-04-21',
    dateRange: 'Apr 21, 2026',
    headline: '美伊谈判边缘、Strategy 狂增 BTC、Anthropic×AWS 百亿算力锁定',
    generatedAt: '04/21',
    coreMacro:
      '恐惧与贪婪指数 55（中性）。美国 BTC 现货 ETF 昨日净流入 2.38 亿美元，ETH 现货 ETF 净流入 6780 万美元，机构资金持续回流。宏观面：白宫新闻秘书莱维特称美伊"正处于达成协议的边缘"，但伊朗外交部同日强烈谴责美军 19 日袭击伊朗货船，称之为"海盗行为"，警告将引发严重后果。分析人士认为，下一轮谈判焦点将集中在铀浓缩限制与霍尔木兹海峡控制权上。《CLARITY 法案》本周进入关键谈判期，银行团体正针对稳定币收益条款发起游说，白宫加密委员会执行主任 Patrick Witt 批评银行"进一步游说出于贪婪或无知"。特朗普超级 PAC 竞选资金达 5.5 亿美元，创中期选举历史新高，但民调显示 2024 年选民联盟正在瓦解。',
    coreCrypto:
      'Aave 发布 rsETH 事件更新，两种坏账处理场景：①损失全链社会化，Aave 坏账约 1.237 亿美元；②损失仅限 L2 rsETH，坏账约 2.301 亿美元（Aave DAO 金库储备约 1.81 亿美元）。Kelp DAO 正准备备忘录将 2.92 亿美元 rsETH 攻击归咎于 LayerZero 文档与默认配置。Strategy 上周以约 25.4 亿美元增持 34,164 枚 BTC，截至 4 月 19 日累计持有 815,061 枚 BTC，平均成本约 $75,527/枚，总成本约 615.6 亿美元。',
    coreActions: [
      'BTC 机构买盘强势（Strategy + ETF 双双流入），但 $80,000 仍是关键阻力，缩量企稳前暂缓追涨。',
      '规避 DeFi/跨链桥敞口：Aave 坏账事件尚未落定，Kelp/LayerZero 责任归属存争议，短期风险未出清。',
      '关注《CLARITY 法案》进展：若 4 月获委员会审议，稳定币赛道将获重大政策催化。',
      '美伊谈判窗口期：黄金和 BTC 对地缘事件最敏感，留意伊斯兰堡下一轮谈判信号。',
      'Anthropic×AWS 百亿算力锁定，AI 基础设施赛道长期利多，关注相关算力代币（TAO/RENDER）。',
    ],
    disclaimer: '以上内容仅供参考，不构成任何投资建议，投资有风险，决策需谨慎。',
    usStocks: [
      'Anthropic 与 Amazon 宣布扩展合作，未来十年向 AWS 投入超 1000 亿美元，锁定最多 5 吉瓦算力用于训练和运行 Claude，覆盖 Graviton、Trainium2-4 芯片；Amazon 再注资 50 亿美元，累计承诺最高 330 亿美元。',
      'Google DeepMind 已组建突击队主攻长周期编码任务，直接触发点是 Anthropic 近期发布的编码模型超越 Gemini；Claude Code 负责人 Boris Cherny 称公司几乎 100% 代码由 AI 写成，Google CFO 披露内部仅约 50%。',
      '华为在中国 AI 芯片市场与英伟达各占约 40%（Bernstein 估算），但今年英伟达可能降至个位数；本土 AI 芯片公司收入预计从 2023 年约 20 亿美元涨至 2028 年约 820 亿美元。',
      'GPT-5.4 速度与质量大幅提升，视觉理解与前端代码生成接近质变，延迟降低 40%；代号"Spud"的 GPT-5.5 或已完成预训练，预计 Q2 发布，窗口与 Anthropic Claude Mythos 重叠。',
    ],
    cryptoAssets: [
      'BTC：Strategy 上周增持 34,164 枚（约 $25.4B），累计持有 815,061 枚；美国 BTC ETF 昨日净流入 2.38 亿美元，机构买盘持续。',
      'ETH：美国 ETH 现货 ETF 昨日净流入 6780 万美元；但 Aave rsETH 坏账悬案（1.2-2.3 亿美元）对 ETH DeFi 生态信任构成压制，短期双向拉锯。',
      'AAVE：两种坏账场景均已超过 Aave DAO 金库储备（1.81 亿美元）下限，短期继续规避，等待官方最终披露。',
      'Stablecoins：《CLARITY 法案》谈判期，银行游说压力下稳定币收益条款面临修改，关注 USDC（CRCL）的政策走向。',
      'TAO/RENDER：Anthropic×AWS 百亿算力合约，AI 基础设施叙事长期利多，AI 代币板块获溢出资金关注。',
    ],
    geopolitics: [
      {
        title: '美伊谈判',
        subtitle: '白宫称"正处于达成协议的边缘"',
        content:
          '白宫新闻秘书莱维特接受采访时称，美国和伊朗正处于达成协议的边缘。但同一日，伊朗外交部强烈谴责美军 19 日在阿曼湾袭击伊朗货船，称之为"海盗行为和恐怖主义行径"，警告将引发严重后果。分析人士认为，下一轮谈判（预计在伊斯兰堡举行）的焦点将集中在限制铀浓缩活动以及如何处理对霍尔木兹海峡石油运输通道的控制上。',
      },
      {
        title: '霍尔木兹',
        subtitle: '为何伊朗更青睐稳定币做通行货币？',
        content:
          '霍尔木兹局势持续发酵，深度分析了伊朗为何倾向用稳定币（而非传统美元结算）作为海峡通行货币的逻辑——制裁规避、即时结算、无需中间行。这一需求侧逻辑正在强化"稳定币 = 地缘对冲工具"的叙事，对 USDT/USDC 的实际需求构成中期支撑。当前霍尔木兹风险仍处于"尾部风险"而非"基准情景"区间，建议持有黄金和 BTC 作为对冲工具，同时留意伊朗海军动态。',
      },
    ],
    mustRead: [
      {
        category: '加密',
        title: 'CRWV：借别人的钱，建自己的帝国',
        source: '微信公众号',
        summary: '深度解析 CoreWeave（CRWV）如何通过杠杆融资构建 AI 算力基础设施帝国，以及这一模式的可持续性与风险。',
        action: '理解 AI 算力资产的金融化逻辑，关注 CRWV 与相关算力代币的联动。',
      },
      {
        category: '宏观',
        title: '三十年暗号，AI 支付标准之战',
        source: 'Techflow',
        summary: '梳理 AI 时代支付标准的演变，从 SWIFT 到稳定币再到链上支付，分析各方势力的博弈格局。',
        action: '关注稳定币支付赛道的政策落地节奏，重点跟踪《CLARITY 法案》进展。',
      },
      {
        category: '地缘',
        title: '为何伊朗更青睐稳定币做霍尔木兹海峡通行货币',
        source: 'Techflow',
        summary: '深度分析伊朗在地缘博弈中选择稳定币而非传统美元结算的战略逻辑与实际操作路径。',
        action: '稳定币需求侧重要边际，利好 USDT/USDC 的实际使用场景。',
      },
      {
        category: '加密',
        title: '加密 VC 将死？市场淘汰周期已经开启',
        source: 'BlockBeats',
        summary: '分析加密风投市场的结构性变化：头部效应加剧、早期项目估值虚高、退出通道收窄，市场淘汰加速。',
        action: '二级市场投资者需警惕高估值早期项目的解锁抛压，关注有真实收入的协议。',
      },
      {
        category: '科技',
        title: 'AI Native 的组织架构：Block CEO 的实践',
        source: 'BlockBeats',
        summary: 'Block CEO Jack Dorsey 分享基于 AI 重构组织的实验：四层架构（能力层/世界模型/智能层/界面），人聚焦 AI 无法替代的 20%——深度判断、审美品味与道德抉择。',
        action: '理解 AI Native 组织范式，为 iBuidl/Yamaswap 的 AI 化运营提供参考框架。',
      },
      {
        category: '加密',
        title: 'Circle CEO 演讲及圆桌对话全文纪要 (2026.4.13)',
        source: 'X (@lufeieth)',
        summary: 'Circle CEO Jeremy Allaire 阐述稳定币监管框架、USDC 全球扩张战略，以及 AI 与稳定币结合的未来图景。',
        action: '《CLARITY 法案》谈判背景下，Circle 的政策游说方向是判断 USDC/CRCL 走势的重要参考。',
      },
      {
        category: '成长',
        title: '不再触发 Claude 使用限制的 10 个有效习惯',
        source: '微信公众号',
        summary: '大幅降低 Token 消耗的实操技巧：精简 prompt、善用缓存、减少无效对话轮次等。',
        action: '直接优化 Claude Code 日常使用成本，提升 AI 辅助开发效率。',
      },
      {
        category: '成长',
        title: '经常喊累，真不是懒！是大脑被这 3 件事耗空了',
        source: '微信公众号',
        summary: '不规律的多任务处理、频繁刷短视频都会伤害前额叶，导致注意力下降、大脑疲惫。提升前额叶的训练方式：专注地做一件任务、固定 80% 的生活习惯。',
        action: '提升认知效率的底层方法，适用于高强度研究工作周。',
      },
    ],
  },
];
