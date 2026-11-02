import { getPostMeta } from '@/data/blog';
import { getTopicBySlug, localizedTopic } from '@/data/topics';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { getLibrarySnapshot } from '@/lib/library/catalog';
import { libraryArticleLinks } from '@/lib/library/relations';
import { libraryLanguageLabel } from '@/lib/library/presentation';
import { LibraryBrowser } from './library-browser';
import { LibraryLocalProvider } from './local-state-provider';

export async function LibraryPage({ locale }: { locale: Locale }) {
  const snapshot = await getLibrarySnapshot();
  const t = getTranslator(locale);
  const topics = Object.entries(snapshot.facets.topics).flatMap(([slug, count]) => {
    const source = getTopicBySlug(slug);
    return source ? [{ slug, name: localizedTopic(source, locale).name, count }] : [];
  });
  const articles = libraryArticleLinks(snapshot.relations, locale, getPostMeta).slice(0, 3);
  return <main className="mx-auto w-full max-w-[1248px] px-4 pb-12 pt-7 sm:px-8 sm:pt-10">
    <div className="mb-5 font-mono text-[11px] tracking-[0.17em] text-brand">{t('LIBRARY / READING TRAILS', 'LIBRARY / 阅读线索', 'LIBRARY / 読書の手がかり')}</div>
    <h1 className="max-w-3xl text-[29px] font-semibold leading-[1.5] tracking-[-0.04em] sm:text-[38px]">{t('Keep worthwhile reading ', '把值得读的，', '読む価値のある資料を、')}<span className="text-brand max-sm:block">{t('within reach.', '留在手边。', '手元に。')}</span></h1>
    <p className="mb-7 mt-3 max-w-3xl text-sm leading-8 text-muted-foreground">{t('Specifications, papers, books, articles, and videos. Follow the sources, understand why each is here, and build your own reading path.', '从规范、论文到书籍、文章与视频。保留原始来源，说明为什么读，串起自己的研究路径。', '仕様、論文、書籍、記事、動画。原典と読む理由を確かめ、自分の調査につながる資料を探せます。')}</p>
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_286px]">
      <section aria-label={t('Find reading resources', '查找阅读资源', '読む資料を探す')} className="min-w-0">
        <LibraryLocalProvider ids={snapshot.items.map(item => item.id)} aliases={snapshot.aliases} locale={locale}>
          <LibraryBrowser items={snapshot.items} rankings={snapshot.rankings} manifest={snapshot.manifest} topics={topics} locale={locale} />
        </LibraryLocalProvider>
      </section>
      <aside className="min-w-0 border-t border-border pt-6 lg:border-0 lg:pt-0">
        <h2 className="mono-label mb-4">{t('BROWSE TOPICS', '按主题探索', 'トピックから探す')}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">{topics.map(topic => <a key={topic.slug} href={`${localizeHref('/library', locale)}?topic=${encodeURIComponent(topic.slug)}`} className="flex min-w-0 items-center justify-between gap-2 rounded-sm border border-border bg-surface px-3 py-3 text-xs text-muted-foreground hover:border-border-strong hover:text-brand"><span>{topic.name}</span><span className="font-mono text-[10px] text-subtle">{topic.count}</span></a>)}</div>
        <a href={localizeHref('/topics', locale)} className="my-4 inline-block py-2 text-xs text-brand">{t('All research topics', '全部研究主题', 'すべてのリサーチトピック')} →</a>
        {articles.length > 0 && <section className="mt-3 rounded border border-border bg-surface p-4"><h2 className="text-sm font-medium">{t('From reading to research', '从阅读到原创研究', '読書からリサーチへ')}</h2><p className="my-3 text-xs leading-6 text-subtle">{t('Existing research with related reading. These links do not mean the sources endorse the articles.', '关联已有文章，继续核对问题与假设；不代表资料作者为文章结论背书。', '関連資料のある既存記事から、問いや仮説をたどれます。資料の著者による記事の支持を意味しません。')}</p>{articles.map((article, index) => <a key={article.translationKey} href={article.href} className="flex gap-3 border-t border-border py-3 text-xs leading-6 hover:text-brand"><span aria-hidden="true" className="font-mono text-[10px] text-brand">0{index + 1}</span><span className="min-w-0"><span lang={article.language}>{article.title}</span>{article.language !== locale && <span className="mt-1 block text-[10px] text-subtle">{t('Available in', '现有语言', '利用可能な言語')}: {libraryLanguageLabel(article.language, locale)}</span>}</span><span aria-hidden="true">↗</span></a>)}</section>}
        <section className="mt-6 border-t border-border pt-5"><h2 className="mb-3 text-xs font-medium">{t('How to read this Library', '如何使用资料库', 'このライブラリの読み方')}</h2><ul className="flex flex-col gap-3 text-xs leading-6 text-muted-foreground"><li>✓ {t('Check original sources and versions.', '核对原始来源与版本。', '原典とバージョンを確認する。')}</li><li>✓ {t('Distinguish editorial picks from outside recommendations.', '区分编辑精选与外部推荐。', '編集セレクトと外部の推薦を区別する。')}</li><li>✓ {t('Keep reading scope and limitations in view.', '保留核读范围与资料局限。', '確認した範囲と限界を確かめる。')}</li></ul><p className="mt-4 text-[11px] leading-6 text-subtle">{t('A reading lead does not establish a conclusion or provide investment advice.', '阅读线索不证明结论，也不构成投资建议。', '読むための手がかりであり、結論の証明や投資助言ではありません。')}</p></section>
      </aside>
    </div>
  </main>;
}
