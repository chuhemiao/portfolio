import { DATA } from '@/data/resume';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Philosophy',
  description: '人活着是为了什么：依赖、期待、明天，以及持续寻找热爱与正确重复。',
  alternates: {
    canonical: `${DATA.url}/philosophy`
  },
  openGraph: {
    title: `Philosophy | ${DATA.name}`,
    description: '人活着是为了什么：依赖、期待、明天，以及持续寻找热爱与正确重复。',
    url: `${DATA.url}/philosophy`,
    siteName: DATA.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Philosophy')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} philosophy page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Philosophy | ${DATA.name}`,
    description: '人活着是为了什么：依赖、期待、明天，以及持续寻找热爱与正确重复。',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Philosophy')}`]
  }
};

export default function PhilosophyPage() {
  return (
    <section className='space-y-8 pb-8'>
      <header className='space-y-3'>
        <h1 className='font-medium text-2xl tracking-tighter'>philosophy</h1>
        <p className='text-sm text-muted-foreground'>人活着是为了什么</p>
      </header>

      <div className='rounded-xl border p-5 space-y-4'>
        <h2 className='text-lg font-semibold'>三个答案</h2>
        <ol className='space-y-2 text-sm leading-7 text-muted-foreground'>
          <li>1. 一个依赖</li>
          <li>2. 一个期待</li>
          <li>3. 一个明天</li>
        </ol>
      </div>

      <div className='rounded-xl border p-5 space-y-4'>
        <h2 className='text-lg font-semibold'>持续寻找</h2>
        <p className='text-sm leading-7 text-muted-foreground'>
          想过什么样的人生，想成为什么样的人，读什么样的书？
        </p>
        <p className='text-sm leading-7 text-muted-foreground'>
          史蒂夫·乔布斯在 2005 年斯坦福大学毕业典礼演讲中说得最好：
        </p>
        <blockquote className='border-l-2 pl-4 text-sm leading-7 text-muted-foreground space-y-3'>
          <p>
            你必须找到你所爱的。对于你的工作和你的爱人来说都是如此。你的工作将占据你生活的很大一部分，而真正满足的唯一方法就是做你认为伟大的工作。做好工作的唯一方法就是热爱你所做的事情。
          </p>
          <p>
            如果您还没有找到，请继续寻找。并且不要安定下来。就像所有与内心有关的事情一样，当你找到它时你就会知道。而且，就像任何伟大的关系一样，随着时间的推移，这种关系会变得越来越好。所以继续寻找。别安定下来。
          </p>
        </blockquote>
      </div>

      <div className='rounded-xl border p-5 space-y-4'>
        <h2 className='text-lg font-semibold'>什么是正确的重复？</h2>
        <ul className='space-y-2 text-sm leading-7 text-muted-foreground'>
          <li>第一：选对方向，用时间悄悄地做杠杆；</li>
          <li>第二：找到优势，用效果不断地做叠加。</li>
        </ul>
      </div>
    </section>
  );
}
