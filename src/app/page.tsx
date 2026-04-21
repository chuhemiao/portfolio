import { HackathonCard } from '@/components/hackathon-card';
import BlurFade from '@/components/magicui/blur-fade';
import { ProjectCard } from '@/components/project-card';
import { ResumeCard } from '@/components/resume-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DATA } from '@/data/resume';
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  LayersIcon,
  MapPinIcon,
  MessageSquareIcon,
  SearchIcon,
  TrendingUpIcon
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Markdown from 'react-markdown';

const BLUR_FADE_DELAY = 0.04;

export const metadata: Metadata = {
  title: 'Home',
  description: DATA.description,
  alternates: {
    canonical: DATA.url
  },
  openGraph: {
    title: `${DATA.name} | Web3 Product Engineer`,
    description: DATA.description,
    url: DATA.url,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} profile and portfolio`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DATA.name} | Web3 Product Engineer`,
    description: DATA.description,
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og`]
  }
};

export default function Page() {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: DATA.name,
    url: DATA.url,
    image: `${DATA.url}${DATA.avatarUrl}`,
    description: DATA.description,
    jobTitle: 'Web3 Product Engineer',
    knowsAbout: [
      'Web3',
      'Blockchain',
      'DeFi',
      'Solana',
      'TON',
      'ICP',
      'Smart Contracts',
      'Cryptocurrency',
      'Product Engineering',
      'Digital Nomad',
      'Crypto Investment',
      'ETF',
      'AI Agent'
    ],
    sameAs: [
      DATA.contact.social.GitHub.url,
      DATA.contact.social.X.url,
      DATA.contact.social.Youtube.url,
      DATA.contact.social.Telegram.url,
      DATA.contact.social.Books.url
    ]
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DATA.name,
    url: DATA.url,
    description: DATA.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DATA.url}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const profilePageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: DATA.url,
    name: `${DATA.name} - Web3 Product Engineer`,
    description: DATA.description,
    mainEntity: {
      '@type': 'Person',
      name: DATA.name,
      identifier: DATA.name,
      description: DATA.summary,
      jobTitle: 'Web3 Product Engineer'
    }
  };

  const heroStats = [
    { value: '6', label: 'years in Web3' },
    { value: '10+', label: 'products led' },
    { value: '$300k', label: 'hackathon total' },
    { value: '10M', label: 'financing scale' }
  ];

  const quickLinks = [
    {
      label: 'Research',
      href: '/research',
      icon: SearchIcon,
      description: 'Deep-dive theses and market maps'
    },
    {
      label: 'Thoughts',
      href: '/thoughts',
      icon: MessageSquareIcon,
      description: 'Short-form notes and recurring observations'
    },
    {
      label: 'Fund',
      href: '/fund',
      icon: TrendingUpIcon,
      description: 'Allocation, conviction, and sector view'
    }
  ];

  const publishLinks = [
    DATA.contact.social.TelegramChannel,
    DATA.contact.social.Books,
    DATA.contact.social.Youtube
  ];

  const socialLinks = [
    DATA.contact.social.GitHub,
    DATA.contact.social.X,
    DATA.contact.social.Telegram,
    DATA.contact.social.Youtube
  ];

  const toolLinks = [
    {
      label: 'Stack',
      href: '/stack',
      icon: LayersIcon,
      description: 'My workflow, books, data sources, and AI stack',
      external: false
    },
    {
      label: 'Fear',
      href: 'https://watch.kkdemian.com/',
      icon: ActivityIcon,
      description: 'Market regime dashboard for crypto risk and timing',
      external: true
    },
    {
      label: 'Watch',
      href: 'https://usdc.kkdemian.com/',
      icon: TrendingUpIcon,
      description: 'Stablecoin flow and supply dashboard',
      external: true
    }
  ];

  const focusLinks = [
    {
      title: 'Research archive',
      href: '/research',
      text: 'Long-form theses on exchanges, DeFi, infra, AI, and market structure.'
    },
    {
      title: 'Capital map',
      href: '/fund',
      text: 'A live view of the assets, sectors, and platforms I keep tracking.'
    },
    {
      title: 'Thought stream',
      href: '/thoughts',
      text: 'Shorter notes, fragments, and recurring market observations.'
    }
  ];

  const philosophyBlocks = [
    {
      title: 'Three answers to why we live',
      body: [
        '1. Something to depend on',
        '2. Something to look forward to',
        '3. A tomorrow'
      ]
    },
    {
      title: 'Keep searching',
      body: [
        'Find what you love and keep looking if you have not found it yet.',
        'Do not settle just because the work is already acceptable.'
      ]
    },
    {
      title: 'Correct repetition',
      body: [
        'Choose the right direction and let time work as leverage.',
        'Find your advantage and keep stacking on the effect.'
      ]
    }
  ];

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_10%_14%,rgba(14,165,233,0.18),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.14),transparent_22%),radial-gradient(circle_at_48%_18%,rgba(59,130,246,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_48%_18%,rgba(29,78,216,0.18),transparent_28%)]' />
      <main className='relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-6 sm:gap-8 sm:px-6 sm:pb-32 sm:pt-10 lg:px-8'>
        <script
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(profilePageJsonLd)
          }}
        />

        <section
          id='hero'
          className='grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_21rem]'>
          <BlurFade delay={BLUR_FADE_DELAY}>
            <div className='relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/78 p-6 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.45)] backdrop-blur-md sm:p-8 lg:p-10'>
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_26%)]' />
              <div className='relative space-y-8'>
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground shadow-sm backdrop-blur'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  Founder, researcher, and product operator
                </div>

                <div className='space-y-4'>
                  <p className='text-sm font-medium tracking-[0.02em] text-muted-foreground'>
                    {DATA.name} · {DATA.location}
                  </p>
                  <h1 className='max-w-4xl text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-[2.75rem] sm:leading-tight lg:text-[3.25rem] lg:leading-[1.08]'>
                    I build Web3 products, publish research, and ship the tools
                    I use myself.
                  </h1>
                  <p className='max-w-2xl text-[15px] leading-8 text-muted-foreground sm:text-[17px]'>
                    {DATA.description} I work across product, research, and
                    execution, with a bias toward live systems that help me
                    think better and move faster.
                  </p>
                </div>

                <div className='grid gap-3 sm:grid-cols-3'>
                  {quickLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className='group rounded-[1.35rem] border border-border/60 bg-background/78 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_24px_44px_-30px_rgba(15,23,42,0.65)]'>
                      <div className='flex items-center justify-between'>
                        <item.icon className='size-4 text-foreground' />
                        <ArrowRightIcon className='size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5' />
                      </div>
                      <div className='mt-4 space-y-1'>
                        <div className='text-sm font-semibold text-foreground'>
                          {item.label}
                        </div>
                        <p className='text-sm leading-6 text-muted-foreground'>
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                  {heroStats.map((item) => (
                    <div
                      key={item.label}
                      className='rounded-[1.25rem] border border-border/60 bg-background/72 px-4 py-3'>
                      <div className='text-2xl font-semibold tracking-[-0.05em] text-foreground'>
                        {item.value}
                      </div>
                      <div className='mt-1 text-xs tracking-[0.08em] text-muted-foreground'>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex flex-wrap gap-2'>
                  {DATA.skills.slice(0, 10).map((skill) => (
                    <span
                      key={skill}
                      className='rounded-full border border-border/60 bg-background/72 px-3 py-1 text-xs font-medium text-muted-foreground'>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <div className='rounded-[1.75rem] border border-border/60 bg-background/78 p-5 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='flex items-start gap-4'>
                  <div className='rounded-[1.5rem] bg-white/95 p-1 ring-1 ring-black/5 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.4)]'>
                    <Avatar className='size-20 rounded-[1.25rem] bg-background sm:size-24'>
                      <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                      <AvatarFallback>{DATA.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className='min-w-0 space-y-2'>
                    <h2 className='text-xl font-semibold tracking-[-0.04em] text-foreground'>
                      {DATA.name}
                    </h2>
                    <p className='text-sm leading-6 text-muted-foreground'>
                      Web3 product engineer with a research habit and an
                      operator bias.
                    </p>
                    <div className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground'>
                      <MapPinIcon className='size-3.5' />
                      {DATA.location}
                    </div>
                  </div>
                </div>

                <div className='mt-5 space-y-3'>
                  <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                    Current roles
                  </div>
                  {DATA.work.map((item) => (
                    <div
                      key={item.company}
                      className='rounded-[1.15rem] border border-border/60 bg-background/75 px-4 py-3'>
                      <div className='text-sm font-semibold text-foreground'>
                        {item.company}
                      </div>
                      <div className='mt-1 text-sm text-muted-foreground'>
                        {item.title}
                      </div>
                    </div>
                  ))}
                </div>

                <p className='mt-5 text-sm italic leading-6 text-muted-foreground'>
                  それが欲しいから、それを追い求めるんだ。
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <div className='rounded-[1.75rem] border border-border/60 bg-background/78 p-5 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                  Explore
                </div>
                <div className='mt-3 space-y-3'>
                  {focusLinks.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className='group block rounded-[1.2rem] border border-border/60 bg-background/75 px-4 py-4 transition-all duration-300 hover:border-foreground/15 hover:bg-background/90'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-sm font-semibold text-foreground'>
                          {item.title}
                        </div>
                        <ArrowUpRightIcon className='size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                      </div>
                      <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                        {item.text}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section
          id='about'
          className='grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]'>
          <BlurFade delay={BLUR_FADE_DELAY * 4} className='h-full'>
            <div className='h-full rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                <span className='h-1.5 w-1.5 rounded-full bg-sky-500' />
                About
              </div>
              <div className='mt-5 space-y-4'>
                <h2 className='max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-[2.4rem] sm:leading-tight'>
                  Operator mindset, research habit, and product taste in one
                  workflow.
                </h2>
                <div className='prose max-w-none text-pretty font-sans text-[15px] leading-8 text-muted-foreground dark:prose-invert [&_p]:m-0'>
                  <Markdown>{DATA.summary}</Markdown>
                </div>
              </div>
            </div>
          </BlurFade>

          <div className='grid gap-4'>
            <BlurFade delay={BLUR_FADE_DELAY * 5}>
              <div className='rounded-[1.55rem] border border-border/60 bg-background/76 p-5 shadow-[0_20px_46px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <h3 className='text-base font-semibold tracking-[-0.03em] text-foreground'>
                  Thoughts and research
                </h3>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  Long-form reports, short notes, and public research artifacts.
                </p>
                <div className='mt-4 flex flex-wrap gap-2'>
                  {publishLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.url}
                      target='_blank'
                      className='inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/15 hover:bg-background'>
                      <item.icon className='size-4' />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={BLUR_FADE_DELAY * 6}>
              <div className='rounded-[1.55rem] border border-border/60 bg-background/76 p-5 shadow-[0_20px_46px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <h3 className='text-base font-semibold tracking-[-0.03em] text-foreground'>
                  Tools I actually use
                </h3>
                <div className='mt-4 grid gap-3'>
                  {toolLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      className='group flex items-start justify-between gap-4 rounded-[1.2rem] border border-border/60 bg-background/80 px-4 py-4 transition-all duration-300 hover:border-foreground/15 hover:bg-background/95'>
                      <div className='flex gap-3'>
                        <div className='mt-0.5 rounded-xl border border-border/60 bg-background/90 p-2'>
                          <item.icon className='size-4 text-foreground' />
                        </div>
                        <div>
                          <div className='text-sm font-semibold text-foreground'>
                            {item.label}
                          </div>
                          <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRightIcon className='mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                    </Link>
                  ))}
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={BLUR_FADE_DELAY * 7}>
              <div className='rounded-[1.55rem] border border-border/60 bg-background/76 p-5 shadow-[0_20px_46px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <h3 className='text-base font-semibold tracking-[-0.03em] text-foreground'>
                  Social and contact
                </h3>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  The fastest way to find me is still through public channels.
                </p>
                <div className='mt-4 flex flex-wrap gap-2'>
                  {socialLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.url}
                      target='_blank'
                      className='inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/15 hover:bg-background'>
                      <item.icon className='size-4' />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section
          id='work'
          className='grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]'>
          <BlurFade delay={BLUR_FADE_DELAY * 8} className='h-full'>
            <div className='h-full rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                <BriefcaseIcon className='size-4' />
                Work experience
              </div>
              <div className='mt-4 space-y-2'>
                <h2 className='text-3xl font-semibold tracking-[-0.05em] text-foreground'>
                  Operating close to product, growth, and delivery.
                </h2>
                <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
                  Most of my work sits between founder mode, TPM mode, and
                  hands-on shipping. I prefer live systems over slides.
                </p>
              </div>
              <div className='mt-6 space-y-3'>
                {DATA.work.map((work, id) => (
                  <BlurFade
                    key={work.company}
                    delay={BLUR_FADE_DELAY * 9 + id * 0.05}>
                    <ResumeCard
                      key={work.company}
                      logoUrl={work.logoUrl}
                      altText={work.company}
                      title={work.company}
                      subtitle={work.title}
                      href={work.href}
                      badges={work.badges}
                      period={`${work.start} - ${work.end ?? 'Present'}`}
                      description={work.description}
                    />
                  </BlurFade>
                ))}
              </div>
            </div>
          </BlurFade>

          <div className='grid gap-5'>
            <BlurFade delay={BLUR_FADE_DELAY * 10}>
              <div className='rounded-[1.75rem] border border-border/60 bg-background/76 p-5 shadow-[0_20px_48px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                  <GraduationCapIcon className='size-4' />
                  Education
                </div>
                <div className='mt-4 space-y-3'>
                  {DATA.education.map((education, id) => (
                    <BlurFade
                      key={education.school}
                      delay={BLUR_FADE_DELAY * 10.5 + id * 0.05}>
                      <ResumeCard
                        key={education.school}
                        href={education.href}
                        logoUrl={education.logoUrl}
                        altText={education.school}
                        title={education.school}
                        subtitle={education.degree}
                        period={`${education.start} - ${education.end}`}
                      />
                    </BlurFade>
                  ))}
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={BLUR_FADE_DELAY * 11}>
              <div className='rounded-[1.75rem] border border-border/60 bg-background/76 p-5 shadow-[0_20px_48px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                  Philosophy
                </div>
                <div className='mt-4 grid gap-3'>
                  {philosophyBlocks.map((item) => (
                    <div
                      key={item.title}
                      className='rounded-[1.2rem] border border-border/60 bg-background/82 p-4'>
                      <h3 className='text-sm font-semibold text-foreground'>
                        {item.title}
                      </h3>
                      <ul className='mt-3 space-y-2 text-sm leading-6 text-muted-foreground'>
                        {item.body.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section id='projects' className='space-y-6'>
          <BlurFade delay={BLUR_FADE_DELAY * 12}>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
              <div className='space-y-3'>
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                  <span className='h-1.5 w-1.5 rounded-full bg-violet-500' />
                  Projects
                </div>
                <h2 className='max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-[2.5rem]'>
                  A portfolio of products, dashboards, and Web3 experiments.
                </h2>
                <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
                  Recent work spans stablecoin analytics, crypto market tools,
                  Farcaster mini apps, and consumer-facing Web3 products.
                </p>
              </div>
              <Link
                href='/research'
                className='inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground'>
                Explore research
                <ArrowRightIcon className='size-4' />
              </Link>
            </div>
          </BlurFade>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 13 + id * 0.05}>
                <ProjectCard
                  href={project.href}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          id='contact'
          className='grid items-start gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]'>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <div className='rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                Hackathons
              </div>
              <div className='mt-4 space-y-2'>
                <h2 className='text-3xl font-semibold tracking-[-0.05em] text-foreground'>
                  Shipping in public and building under constraints.
                </h2>
                <p className='max-w-2xl text-sm leading-7 text-muted-foreground'>
                  Hackathons are still one of the fastest ways I pressure-test
                  ideas, collaborate with new teams, and turn rough product
                  instincts into something real.
                </p>
              </div>
              <ul className='mt-6 grid gap-4 md:grid-cols-2'>
                {DATA.hackathons.map((project, id) => (
                  <BlurFade
                    key={project.title + project.dates}
                    delay={BLUR_FADE_DELAY * 15 + id * 0.05}>
                    <HackathonCard
                      title={project.title}
                      description={project.description}
                      location={project.location}
                      dates={project.dates}
                      image={project.image}
                      links={project.links}
                    />
                  </BlurFade>
                ))}
              </ul>
            </div>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className='rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                Contact
              </div>
              <div className='mt-4 space-y-3'>
                <h2 className='text-3xl font-semibold tracking-[-0.05em] text-foreground'>
                  Let&apos;s talk if the work is worth building.
                </h2>
                <p className='text-sm leading-7 text-muted-foreground'>
                  Best for product collaboration, crypto research, dashboard
                  tooling, and ideas that need both execution and market
                  context.
                </p>
              </div>

              <div className='mt-6 flex flex-wrap gap-3'>
                {socialLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.url}
                    target='_blank'
                    className='inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/88 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/15 hover:bg-background'>
                    <item.icon className='size-4' />
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className='mt-6 rounded-[1.35rem] border border-border/60 bg-background/84 p-4'>
                <div className='text-sm font-semibold text-foreground'>
                  Good entry points
                </div>
                <div className='mt-3 grid gap-3'>
                  {quickLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className='group flex items-center justify-between rounded-[1rem] border border-border/60 bg-background/82 px-4 py-3 transition-colors hover:border-foreground/15 hover:bg-background'>
                      <div className='flex items-center gap-3'>
                        <item.icon className='size-4 text-foreground' />
                        <span className='text-sm font-medium text-foreground'>
                          {item.label}
                        </span>
                      </div>
                      <ArrowRightIcon className='size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5' />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>
        </section>
      </main>
    </div>
  );
}
