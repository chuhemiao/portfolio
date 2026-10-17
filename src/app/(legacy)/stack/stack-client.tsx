'use client';

import { useDashboardI18n } from '../fear/use-dashboard-i18n';

import BlurFade from '@/components/magicui/blur-fade';
import {
  aiTools,
  books,
  cryptoCards,
  dataSources,
  type AITool,
  type Book,
  type CryptoCard,
  type DataSource
} from '@/data/stack';
import { useState } from 'react';

const BLUR_FADE_DELAY = 0.04;

type TabKey = 'cards' | 'books' | 'data' | 'ai';

type TabInfo = {
  key: TabKey;
  label: string;
};

const tabs: TabInfo[] = [
  { key: 'cards', label: 'Crypto Cards' },
  { key: 'books', label: 'Books' },
  { key: 'data', label: 'Data Sources' },
  { key: 'ai', label: 'AI Tools' }
];

export default function StackClient() {
  const { d } = useDashboardI18n();
  const [selectedTab, setSelectedTab] = useState<TabKey>('cards');

  return (
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className='font-medium text-2xl mb-8 tracking-tighter'>{d("stack")}</h1>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
        <div className='flex flex-wrap gap-2 mb-8'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
              {d(tab.label)}
            </button>
          ))}
        </div>
      </BlurFade>

      {selectedTab === 'cards' && <CryptoCardsSection />}
      {selectedTab === 'books' && <BooksSection />}
      {selectedTab === 'data' && <DataSourcesSection />}
      {selectedTab === 'ai' && <AIToolsSection />}
    </section>
  );
}

function CryptoCardsSection() {
  const { href: localizedHref, d } = useDashboardI18n();
  return (
    <div className='space-y-6'>
      {cryptoCards.map((card, id) => (
        <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={card.name}>
          <div className='border rounded-lg p-6 space-y-4 transition-shadow'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='font-semibold text-lg'>{d(card.name)}</h3>
                <p className='text-sm text-muted-foreground mt-1'>
                  {d(card.description)}
                </p>
              </div>
              <a
                href={localizedHref(card.link)}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity'> {d("Apply")} </a>
            </div>
            <div className='flex gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>{d("Rewards:")} </span>
                <span className='font-medium'>{d(card.rewards)}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>{d("Annual Fee:")} </span>
                <span className='font-medium'>{d(card.annualFee)}</span>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='font-medium text-green-600 dark:text-green-400 mb-2'> {d("Pros:")} </p>
                <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                  {card.pros.map((pro) => (
                    <li key={pro}>{d(pro)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className='font-medium text-red-600 dark:text-red-400 mb-2'> {d("Cons:")} </p>
                <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                  {card.cons.map((con) => (
                    <li key={con}>{d(con)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}

function BooksSection() {
  const { href: localizedHref, d } = useDashboardI18n();
  const [selectedCategory, setSelectedCategory] = useState<
    Book['category'] | 'all'
  >('all');

  const categories: Array<{ key: Book['category'] | 'all'; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'intro', label: '入门' },
    { key: 'thinking', label: '思维与决策' },
    { key: 'economics', label: '经济学' },
    { key: 'cognitive', label: '认知升级' },
    { key: 'strategy', label: '战略管理' },
    { key: 'innovation', label: '创新产品' },
    { key: 'growth', label: '个人成长' },
    { key: 'expression', label: '结构化思维' },
    { key: 'gamification', label: '游戏化' }
  ];

  const filteredBooks = books.filter((book) =>
    selectedCategory === 'all' ? true : book.category === selectedCategory
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2 mb-6'>
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
            {d(category.label)}
          </button>
        ))}
      </div>

      {filteredBooks.map((book, id) => (
        <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={book.title}>
          <div className='border rounded-lg p-5 transition-shadow'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1 flex-wrap'>
                  <h3 className='font-semibold'>{d(book.title)}</h3>
                  <span className='text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground'>
                    {book.year}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground mb-2'>
                  {book.author}
                </p>
                <p className='text-sm mb-3'>{d(book.description)}</p>
                <div className='flex flex-wrap gap-1 mb-3'>
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className='text-xs px-2 py-0.5 rounded bg-primary/10 text-primary'>
                      {d(tag)}
                    </span>
                  ))}
                </div>
                <div className='flex gap-2'>
                  {book.doubanLink && (
                    <a
                      href={localizedHref(book.doubanLink)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs px-3 py-1 rounded border border-primary/20 text-primary hover:bg-primary/10 transition-colors'> {d("豆瓣")} </a>
                  )}
                  {book.amazonLink && (
                    <a
                      href={localizedHref(book.amazonLink)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs px-3 py-1 rounded border border-primary/20 text-primary hover:bg-primary/10 transition-colors'> {d("Amazon")} </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}

function DataSourcesSection() {
  const { href: localizedHref, d } = useDashboardI18n();
  const [selectedCategory, setSelectedCategory] = useState<
    DataSource['category'] | 'all'
  >('all');

  const categories: Array<{
    key: DataSource['category'] | 'all';
    label: string;
  }> = [
    { key: 'all', label: 'All' },
    { key: 'market', label: 'Market' },
    { key: 'onchain', label: 'On-chain' },
    { key: 'defi', label: 'DeFi' },
    { key: 'news', label: 'News' },
    { key: 'research', label: 'Research' },
    { key: 'language', label: 'Language' },
    { key: 'visa', label: 'Visa' }
  ];

  const filteredData = dataSources.filter((source) =>
    selectedCategory === 'all' ? true : source.category === selectedCategory
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2 mb-6'>
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
            {d(category.label)}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {filteredData.map((source, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={source.name}>
            <a
              href={localizedHref(source.link)}
              target='_blank'
              rel='noopener noreferrer'
              className='border rounded-lg p-4 transition-shadow block'>
              <div className='flex items-start justify-between mb-2'>
                <h3 className='font-semibold'>{d(source.name)}</h3>
                {source.isPaid && (
                  <span className='text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'> {d("Paid")} </span>
                )}
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                {d(source.description)}
              </p>
              <div className='flex flex-wrap gap-1'>
                {source.tags.map((tag) => (
                  <span
                    key={tag}
                    className='text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground'>
                    {d(tag)}
                  </span>
                ))}
              </div>
            </a>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}

function AIToolsSection() {
  const { href: localizedHref, d } = useDashboardI18n();
  const [selectedCategory, setSelectedCategory] = useState<
    AITool['category'] | 'all'
  >('all');

  const categories: Array<{
    key: AITool['category'] | 'all';
    label: string;
  }> = [
    { key: 'all', label: 'All' },
    { key: 'coding', label: 'Coding' },
    { key: 'content', label: 'Content' },
    { key: 'research', label: 'Research' },
    { key: 'productivity', label: 'Productivity' },
    { key: 'design', label: 'Design' }
  ];

  const filteredTools = aiTools.filter((tool) =>
    selectedCategory === 'all' ? true : tool.category === selectedCategory
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2 mb-6'>
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
            {d(category.label)}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {filteredTools.map((tool, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={tool.name}>
            <a
              href={localizedHref(tool.link)}
              target='_blank'
              rel='noopener noreferrer'
              className='border rounded-lg p-4 transition-shadow block'>
              <div className='flex items-start justify-between mb-2'>
                <h3 className='font-semibold'>{d(tool.name)}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded capitalize ${
                    tool.pricing === 'free'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : tool.pricing === 'freemium'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                  {d(tool.pricing)}
                </span>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                {d(tool.description)}
              </p>
              <ul className='text-xs space-y-1 text-muted-foreground'>
                {tool.features.map((feature) => (
                  <li key={feature} className='flex items-center gap-1'>
                    <span className='text-primary'>•</span>
                    {d(feature)}
                  </li>
                ))}
              </ul>
            </a>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
