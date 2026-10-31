import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QUOTES_AS_OF, QUOTES_SOURCE, getInstrument, getQuote } from '@/data/instruments';
import { groupForTicker } from '@/data/instrument-groups';
import {
  DIVIDEND_LABEL,
  POR_LABEL,
  UNDERLYING_KIND_LABEL,
  VOTING_LABEL,
  WRAPPER_LABEL,
  pick,
} from '@/data/tokenized-equities';
import { DATA } from '@/data/resume';
import { articleHref, getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { localizedDynamicMetadata } from '@/lib/localized-metadata';
import {
  MISSING,
  TURNOVER_TONE_CLASS,
  changeToneClass,
  formatChange,
  formatPrice,
  formatSupply,
  formatTurnover,
  formatUsd,
  turnoverTone,
} from '@/lib/instrument-format';
import { findIssuer } from '@/components/stocks/issuer-view';

export function instrumentPageMetadata(issuerSlug: string, ticker: string, locale: Locale) {
  const instrument = getInstrument(issuerSlug, ticker);
  const issuer = findIssuer(issuerSlug);
  if (!instrument || !issuer) {
    return localizedDynamicMetadata('/stocks', locale, {
      title: ['Tokenized Equities', '链上美股', 'オンチェーン米国株'],
      description: ['', '', ''],
    });
  }

  const name = instrument.underlying.name;
  return localizedDynamicMetadata(`/stocks/${issuerSlug}/${ticker}`, locale, {
    title: [`${ticker} — ${name} on ${issuer.name}`, `${ticker}：${issuer.name} 的 ${name}`, `${ticker}：${issuer.name} の ${name}`],
    description: [
      `${ticker} tracks ${name} through ${issuer.name}. Price, market cap, 24h volume and turnover, plus the wrapper, voting, dividend and redemption terms that decide what the token is a claim on.`,
      `${ticker} 经由 ${issuer.name} 追踪 ${name}。价格、市值、24h 成交与换手，以及决定这个代币到底对应什么的法律包装、投票权、分红与赎回条款。`,
      `${ticker} は ${issuer.name} を通じて ${name} を追跡します。価格、時価総額、24h出来高、回転率に加え、トークンが何に対する請求権かを決める法的ラッパー、議決権、配当、償還条件。`,
    ],
  });
}

export function renderInstrumentPage(issuerSlug: string, ticker: string, locale: Locale) {
  const instrument = getInstrument(issuerSlug, ticker);
  const issuer = findIssuer(issuerSlug);
  if (!instrument || !issuer) notFound();

  const t = getTranslator(locale);
  const L = <T extends readonly [string, string, string]>(value: T) => pick(value, locale);
  const href = (url: string) => localizeHref(url, locale);

  const quote = getQuote(ticker);
  const group = groupForTicker(ticker);
  const siblings = group?.tickers.filter((other) => other !== ticker) ?? [];
  const article = group?.articleSlugs;
  const { symbol, name, kind, leverage } = instrument.underlying;
  const cmcUrl = instrument.cmcSlug ? `https://coinmarketcap.com/currencies/${instrument.cmcSlug}/` : undefined;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('Tokenized Equities', '链上美股', 'オンチェーン米国株'), item: `${DATA.url}${href('/stocks')}` },
        { '@type': 'ListItem', position: 2, name: issuer.name, item: `${DATA.url}${href(`/stocks/${issuerSlug}`)}` },
        { '@type': 'ListItem', position: 3, name: ticker, item: `${DATA.url}${href(`/stocks/${issuerSlug}/${ticker}`)}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: `${ticker} — ${name}`,
      category: L(UNDERLYING_KIND_LABEL[kind]),
      provider: { '@type': 'Organization', name: issuer.entity ?? issuer.name },
      url: `${DATA.url}${href(`/stocks/${issuerSlug}/${ticker}`)}`,
      // Deliberately no offers/price: this is a reference page, not a quote feed,
      // and the snapshot is hours old by the time anyone reads it.
      termsOfService: cmcUrl,
    },
  ];

  const basics: { label: string; value: React.ReactNode }[] = [
    { label: t('Token', '代币', 'トークン'), value: <span className='font-mono'>{ticker}</span> },
    {
      label: t('Underlying symbol', '正股代码', '原資産ティッカー'),
      value: symbol ? <span className='font-mono'>{symbol}</span> : <span className='font-mono text-subtle'>{MISSING}</span>,
    },
    {
      label: t('Type', '类型', '種類'),
      value: (
        <>
          {L(UNDERLYING_KIND_LABEL[kind])}
          {leverage !== undefined && <span className='ml-1.5 font-mono text-subtle'>{leverage}x</span>}
        </>
      ),
    },
    { label: t('Listed', '上线日', '上場日'), value: <span className='font-mono'>{instrument.listedAt}</span> },
    { label: t('Issuer', '发行方', '発行体'), value: <Link href={href(`/stocks/${issuerSlug}`)}>{issuer.name}</Link> },
    { label: t('Chain', '链', 'チェーン'), value: instrument.chains.join(' · ') },
    {
      label: t('Contract', '合约地址', 'コントラクト'),
      value: (
        <>
          <span className='font-mono text-subtle'>{MISSING}</span>
          {cmcUrl && (
            <a href={cmcUrl} rel='nofollow noopener' target='_blank' className='ml-2 text-[11px]'>
              CMC ↗
            </a>
          )}
        </>
      ),
    },
    { label: t('Wrapper', '法律包装', '法的ラッパー'), value: L(WRAPPER_LABEL[issuer.wrapper]) },
    { label: t('Voting', '投票权', '議決権'), value: L(VOTING_LABEL[issuer.voting]) },
    { label: t('Dividend', '分红', '配当'), value: L(DIVIDEND_LABEL[issuer.dividend]) },
    {
      label: t('Redemption', '赎回', '償還'),
      value:
        issuer.redemption.available === true
          ? [
              t('available', '可赎回', '可能'),
              issuer.redemption.kyc === true ? t('KYC', '需 KYC', 'KYC必須') : undefined,
              issuer.redemption.minimumUsd === undefined ? undefined : `≥$${issuer.redemption.minimumUsd}`,
            ]
              .filter(Boolean)
              .join(' · ')
          : issuer.redemption.available === false
            ? t('not available', '不可赎回', '不可')
            : t('unknown', '未知', '不明'),
    },
    { label: t('Proof of reserve', '储备证明', '準備金証明'), value: L(POR_LABEL[issuer.proofOfReserve.kind]) },
  ];

  const figures: { label: string; value: string; tone?: string }[] = [
    { label: t('Market cap', '市值', '時価総額'), value: formatUsd(quote?.marketCapUsd) },
    { label: t('24h volume', '24h 成交', '24h 出来高'), value: formatUsd(quote?.volume24hUsd) },
    {
      label: t('Turnover', '换手', '回転率'),
      value: formatTurnover(quote?.turnover),
      tone: TURNOVER_TONE_CLASS[turnoverTone(quote?.turnover)],
    },
    { label: t('Circulating', '流通量', '流通量'), value: formatSupply(quote?.circulatingSupply) },
    { label: t('7d', '7 天', '7日'), value: formatChange(quote?.change7d), tone: changeToneClass(quote?.change7d) },
    { label: t('30d', '30 天', '30日'), value: formatChange(quote?.change30d), tone: changeToneClass(quote?.change30d) },
    { label: t('High since listing', '上线以来最高', '上場来高値'), value: formatPrice(quote?.listedHigh) },
    { label: t('Low since listing', '上线以来最低', '上場来安値'), value: formatPrice(quote?.listedLow) },
  ];

  return (
    <div>
      {jsonLd.map((entry) => (
        <script
          key={entry['@type']}
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}

      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 pb-9 pt-8 sm:px-8'>
          <nav aria-label={t('Breadcrumb', '面包屑', 'パンくず')} className='mb-6 font-mono text-[11px] text-subtle'>
            <Link href={href('/stocks')}>{t('Tokenized Equities', '链上美股', 'オンチェーン米国株')}</Link>
            <span aria-hidden='true' className='px-2'>
              /
            </span>
            <Link href={href(`/stocks/${issuerSlug}`)}>{issuer.name}</Link>
            <span aria-hidden='true' className='px-2'>
              /
            </span>
            <span className='text-foreground'>{ticker}</span>
          </nav>

          <div className='mb-4 flex flex-wrap items-baseline gap-x-3.5 gap-y-2'>
            <h1 className='font-mono text-[28px] font-medium tracking-[-0.02em] sm:text-[34px]'>{ticker}</h1>
            <span className='text-[20px] text-muted-foreground'>{name}</span>
            <span className='inline-block rounded-sm border border-border-strong px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground'>
              {L(UNDERLYING_KIND_LABEL[kind])}
              {leverage !== undefined && <span className='ml-1'>{leverage}x</span>}
            </span>
          </div>

          <p className='max-w-[740px] text-[13.5px] leading-[1.75] text-muted-foreground'>
            {kind === 'pre-ipo'
              ? t(
                  `${name} has no public listing, so this token has no market quote to track — it follows the issuer's own valuation. Holding it is not holding shares in ${name}.`,
                  `${name} 没有公开上市，所以这个代币没有可对照的市场报价 —— 它追踪的是发行方自己的估值口径。持有它不等于持有 ${name} 的股份。`,
                  `${name} は公開上場しておらず、このトークンに対応する市場価格は存在しません。追跡しているのは発行体自身の評価額であり、保有は ${name} の株式保有ではありません。`
                )
              : t(
                  `This token is a claim on ${issuer.entity ?? issuer.name}, not a share of ${name}. The wrapper, voting and redemption terms below are what you actually hold.`,
                  `这个代币是对 ${issuer.entity ?? issuer.name} 的一张凭证，不是 ${name} 的股票。下面的法律包装、投票权与赎回条款才是你实际持有的东西。`,
                  `このトークンは ${name} の株式ではなく、${issuer.entity ?? issuer.name} に対する請求権です。実際に保有しているのは下記の法的ラッパー、議決権、償還条件です。`
                )}
          </p>
        </div>
      </section>

      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 py-8 sm:px-8'>
          <h2 className='mono-label mb-4'>{t('One · Basics', '一 · 基础信息', '一 · 基本情報')}</h2>
          <dl className='grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4'>
            {basics.map((item) => (
              <div key={item.label} className='bg-surface px-4 py-3'>
                <dt className='font-mono text-[10px] uppercase tracking-[0.08em] text-subtle'>{item.label}</dt>
                <dd className='mt-1 text-[12.5px]'>{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className='mt-3 max-w-[820px] text-[11.5px] leading-[1.7] text-subtle'>
            {t(
              'The contract address is not in the upstream payload, so it shows a dash and links out rather than being guessed.',
              '合约地址不在上游数据里，所以显示破折号并外链，而不是编一个。',
              'コントラクトアドレスは上流データに含まれないため、推測せずダッシュ表示と外部リンクにしています。'
            )}
            {instrument.nameSource === 'derived' &&
              t(
                ` The underlying name is not published upstream either; it was read off the token's own name.`,
                ' 标的名上游也没有提供，是从代币名本身反推的。',
                ' 原資産名も上流では未提供で、トークン名から読み取ったものです。'
              )}
          </p>
        </div>
      </section>

      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 py-8 sm:px-8'>
          <div className='mb-5 flex flex-wrap items-baseline justify-between gap-3'>
            <h2 className='mono-label'>{t('Two · Market', '二 · 行情', '二 · 市況')}</h2>
            <span className='font-mono text-[10.5px] text-subtle'>
              {QUOTES_AS_OF} · {QUOTES_SOURCE}
            </span>
          </div>

          <div className='mb-6 flex flex-wrap items-end gap-5'>
            <div className='tnum font-mono text-[40px] leading-none tracking-[-0.02em] sm:text-[46px]'>
              {formatPrice(quote?.priceUsd)}
            </div>
            <div className={`tnum pb-1 font-mono text-[15px] ${changeToneClass(quote?.change24h)}`}>
              {formatChange(quote?.change24h)}
              <span className='ml-1.5 text-[11px] text-subtle'>24h</span>
            </div>
          </div>

          <dl className='grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4'>
            {figures.map((figure) => (
              <div key={figure.label} className='bg-surface px-4 py-3.5'>
                <dt className='font-mono text-[10px] uppercase tracking-[0.08em] text-subtle'>{figure.label}</dt>
                <dd className={`tnum mt-1.5 font-mono text-[16px] ${figure.tone ?? ''}`}>{figure.value}</dd>
              </div>
            ))}
          </dl>

          <p className='mt-4 max-w-[820px] text-[11.5px] leading-[1.75] text-subtle'>
            {t(
              `"Since listing" rather than "all-time": this token began on ${instrument.listedAt}, so its extremes say nothing about ${name}'s own history. No premium or discount is shown — a token is not one share, and the multiple is not constant even within one issuer.`,
              `写「上线以来」而不是「历史」：这个代币 ${instrument.listedAt} 才存在，它的高低点与 ${name} 本身的价格历史无关。本页不给溢价/折价 —— 一个代币不等于一股，倍数在同一家发行方内部都不一致。`,
              `「上場来」であり「過去最高」ではありません。このトークンは ${instrument.listedAt} に始まったもので、その高低は ${name} 自身の値動きの歴史とは無関係です。プレミアム/ディスカウントは表示しません。1トークンは1株ではなく、倍率は同一発行体の中でも一定ではないからです。`
            )}
          </p>
        </div>
      </section>

      {group && (
        <section className='border-b border-border'>
          <div className='mx-auto max-w-[1240px] px-4 py-8 sm:px-8'>
            <h2 className='mono-label mb-4'>{t('Three · Research', '三 · 研报', '三 · リサーチ')}</h2>

            <div className='border border-border-strong bg-surface-2 px-5 py-5'>
              <div className='font-mono text-[10px] uppercase tracking-[0.08em] text-brand'>
                {t('Group', '第', 'グループ')} {String(group.index).padStart(2, '0')} · {L(group.title)}
              </div>
              {article ? (
                <h3 className='mt-2.5 text-[19px] font-medium'>
                  <Link href={articleHref(article[locale], locale)}>{L(group.title)}</Link>
                </h3>
              ) : (
                <div className='mt-2.5 font-mono text-[11.5px] text-subtle'>
                  {t('Article not published yet', '研报尚未发布', 'レポートは未公開')}
                </div>
              )}
              <p className='mt-2.5 max-w-[800px] text-[13px] leading-[1.75] text-muted-foreground'>{L(group.thesis)}</p>
            </div>

            {siblings.length > 0 && (
              <div className='mt-7'>
                <h3 className='mono-label mb-3.5'>{t('Others in this group', '同组其他标的', '同グループの他銘柄')}</h3>
                <ul className='grid gap-px border border-border bg-border sm:grid-cols-4'>
                  {siblings.map((other) => {
                    const sibling = getInstrument(issuerSlug, other);
                    return (
                      <li key={other} className='bg-surface'>
                        <Link href={href(`/stocks/${issuerSlug}/${other}`)} className='block px-4 py-3.5'>
                          <div className='font-mono text-[13px] font-medium text-brand'>{other}</div>
                          <div className='mt-1 text-[12px] text-muted-foreground'>
                            {sibling?.underlying.name ?? MISSING}
                          </div>
                          <div className='mt-2 font-mono text-[10.5px] text-subtle'>
                            {sibling ? pick(UNDERLYING_KIND_LABEL[sibling.underlying.kind], locale) : MISSING} ·{' '}
                            {sibling?.listedAt ?? MISSING}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
