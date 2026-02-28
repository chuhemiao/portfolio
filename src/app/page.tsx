import { HackathonCard } from '@/components/hackathon-card';
import BlurFade from '@/components/magicui/blur-fade';
import BlurFadeText from '@/components/magicui/blur-fade-text';
import { ProjectCard } from '@/components/project-card';
import { ResumeCard } from '@/components/resume-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DATA } from '@/data/resume';
import Link from 'next/link';
import type { Metadata } from 'next';
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
      'AI Agent',
    ],
    sameAs: [
      DATA.contact.social.GitHub.url,
      DATA.contact.social.X.url,
      DATA.contact.social.Youtube.url,
      DATA.contact.social.Telegram.url,
      DATA.contact.social.Books.url,
    ],
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
      'query-input': 'required name=search_term_string',
    },
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
      jobTitle: 'Web3 Product Engineer',
    },
  };

  return (
    <main className='flex flex-col min-h-[100dvh] space-y-10'>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
      <section id='hero'>
        <div className='mx-auto w-full max-w-2xl space-y-8'>
          <div className='gap-2 flex justify-between'>
            <div className='flex-col flex flex-1 space-y-1.5'>
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(' ')[0]} 👋`}
              />
              <BlurFadeText
                className='max-w-[600px] md:text-xl'
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
              <BlurFade delay={BLUR_FADE_DELAY}>
                <h6>それが欲しいから、それを追い求めるんだ。</h6>
              </BlurFade>
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className='size-28 border'>
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>
      <section id='about'>
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className='text-xl font-bold'>About</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className='prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert'>
            <Markdown>{DATA.summary}</Markdown>
          </div>
        </BlurFade>
      </section>
      <section id='social'>
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <h2 className='text-xl font-bold'>Social</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 6}>
          <div className='flex flex-wrap gap-4 mt-4'>
            {Object.entries(DATA.contact.social)
              .filter(
                ([_, social]) =>
                  social.name === 'GitHub' ||
                  social.name === 'X' ||
                  social.name === 'Crypto Master' ||
                  social.name === 'Youtube' ||
                  social.name === 'Telegram'
              )
              .map(([key, social], id) => (
                <Link
                  key={key}
                  href={social.url}
                  target='_blank'
                  className='flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors'>
                  {social.icon && <social.icon className='size-5' />}
                  <span className='text-sm font-medium'>{social.name}</span>
                </Link>
              ))}
          </div>
        </BlurFade>
      </section>
      <section id='work'>
        <div className='flex min-h-0 flex-col gap-y-3'>
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className='text-xl font-bold'>Work Experience</h2>
          </BlurFade>
          {DATA.work.map((work, id) => (
            <BlurFade
              key={work.company}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}>
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
      </section>
      <section id='education'>
        <div className='flex min-h-0 flex-col gap-y-3'>
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className='text-xl font-bold'>Education</h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
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
      </section>
      <section id='skills'>
        <div className='flex min-h-0 flex-col gap-y-3'>
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <h2 className='text-xl font-bold'>Skills</h2>
          </BlurFade>
          <div className='flex flex-wrap gap-1'>
            {DATA.skills.map((skill, id) => (
              <BlurFade key={skill} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
                <Badge key={skill}>{skill}</Badge>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id='projects'>
        <div className='space-y-12 w-full py-12'>
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <div className='space-y-2'>
                <div className='inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm'>
                  My Projects
                </div>
                <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>
                  Check out my latest work
                </h2>
                <p className='text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  I&apos;ve worked on a variety of crypto projects, from simple
                  websites to complex dApp.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto'>
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 14 + id * 0.05}>
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
        </div>
      </section>
      <section id='hackathons'>
        <div className='space-y-12 w-full py-12'>
          <BlurFade delay={BLUR_FADE_DELAY * 15}>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <div className='space-y-2'>
                <div className='inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm'>
                  Hackathons
                </div>

                <p className='text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  Buidl For Mass Crypto dApp. Recent years, I attended{' '}
                  {DATA.hackathons.length}+ hackathons.
                </p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <ul className='mb-4 ml-4 divide-y divide-dashed border-l'>
              {DATA.hackathons.map((project, id) => (
                <BlurFade
                  key={project.title + project.dates}
                  delay={BLUR_FADE_DELAY * 17 + id * 0.05}>
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
          </BlurFade>
        </div>
      </section>
      <section id='contact'>
        <div className='grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12'>
          <BlurFade delay={BLUR_FADE_DELAY * 18}>
            <div className='space-y-3'>
              <div className='inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm'>
                Contact
              </div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>
                Get in Touch
              </h2>
              <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                Want to chat? Feel free to reach out through any of my social
                channels above, and I&apos;ll respond whenever I can.
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
