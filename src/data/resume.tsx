import { Icons } from '@/components/icons';
import { HomeIcon, NotebookIcon } from 'lucide-react';

export const DATA = {
  name: 'KK Demian',
  initials: 'KK',
  url: 'https://kkdemian.com',
  location: 'Japan, 東京都',
  locationLink: 'https://maps.app.goo.gl/MaUmZnDK5beuQNdn8',
  description:
    'Product Engineer｜Digital Nomad｜DAOs Enthusiasts｜Buidl｜Bitcoin HODL.',
  summary:
    '6 years of Web3 product engineer, 3 years of Web3 startup experience, led the design and development of 10+ Web3 products (SOL, TON, ICP), obtained 10 million level of financing, and led the team to obtain a cumulative total of 300,000 U.S. dollars. ADA, People, Degen Early Alpha.',
  avatarUrl: '/me.jpg',
  skills: [
    'React',
    'React Native',
    'Next.js',
    'Typescript',
    'Solidity',
    'Go',
    'Supabase',
    'Cloudflare',
    'PHP',
    'SEO',
    'Rust',
    'Motoko'
  ],
  navbar: [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/blog', icon: NotebookIcon, label: 'Blog' }
  ],
  contact: {
    email: 'Y2h1aGVtaWFvQGdtYWlsLmNvbQ==',
    tel: 'KzE5MzY2NjY2MTM5',
    social: {
      GitHub: {
        name: 'GitHub',
        url: 'https://github.com/chuhemiao',
        icon: Icons.github,
        navbar: true
      },
      LinkedIn: {
        name: 'LinkedIn',
        url: '',
        icon: Icons.linkedin,
        navbar: false
      },
      X: {
        name: 'X',
        url: 'https://x.com/0xkkdemian',
        icon: Icons.x,
        navbar: true
      },
      Youtube: {
        name: 'Youtube',
        url: 'https://www.youtube.com/@kkdemian',
        icon: Icons.youtube,
        navbar: true
      },
      email: {
        name: 'Send Email',
        url: '#',
        icon: Icons.email,

        navbar: false
      }
    }
  },

  work: [
    {
      company: 'IBuidl',
      href: 'https://ibuidl.org',
      badges: [],
      location: 'Remote',
      title: 'Founder',
      logoUrl: '/me.jpg',
      start: 'Jun 2024',
      end: 'Now',
      description: '90 days to be a digital nomad, Web2 to Web3.'
    }
  ],
  education: [
    {
      school: 'CUP',
      href: '#',
      degree: 'Associate degree',
      logoUrl: '/cup.png',
      start: '2019',
      end: '2021'
    }
  ],
  projects: [
    {
      title: 'IBuidl',
      href: 'https://ibuidl.org/',
      dates: 'June 3rd 2024 - Now',
      active: true,
      description:
        'IBuidl is a digital nomad community as well as a convenient and efficient Web3 transformation platform that helps students gain access to cutting-edge industry resources and technical support.',
      technologies: [
        'Next.js',
        'Typescript',
        'React',
        'TailwindCSS',
        'Vercel',
        'Shadcn UI'
      ],
      links: [
        {
          type: 'Website',
          href: 'https://blog.ibuidl.org/',
          icon: <Icons.globe className='size-3' />
        }
      ],
      image: '/blog_ibuidl.png',
      video: ''
    },
    {
      title: 'Crypto Weekly',
      href: 'https://weekly.kkdemian.com/',
      dates: 'May 9th 2024 - Now',
      active: true,
      description:
        'Literacy in cryptocurrencies and macroeconomics with weekly reports on finding alpha.',
      technologies: [
        'Next.js',
        'Typescript',
        'React',
        'TailwindCSS',
        'Vercel',
        'Shadcn UI'
      ],
      links: [
        {
          type: 'Website',
          href: 'https://weekly.kkdemian.com/',
          icon: <Icons.globe className='size-3' />
        }
      ],
      image: '/weekly.png',
      video: ''
    },
    {
      title: 'Web3 Crypto Tools',
      href: 'https://tool.ibuidl.org/',
      dates: 'Aug 10th 2024 - Now',
      active: true,
      description: 'Cryptocurrency Gadgets, Mainstream Web3 Tools.',
      technologies: [
        'Next.js',
        'Typescript',
        'React',
        'TailwindCSS',
        'Vercel',
        'Shadcn UI'
      ],
      links: [
        {
          type: 'Website',
          href: 'https://tool.ibuidl.org/',
          icon: <Icons.globe className='size-3' />
        }
      ],
      image: '/tools.png',
      video: ''
    }
  ],
  hackathons: [
    {
      title: 'Solana Radar',
      dates: 'November 3rd - Oct 8th, 2024',
      location: 'China',
      description: 'Product Engineer',
      image: '/solana.jpg',
      mlh: '',
      links: [
        {
          title: 'Radar',
          icon: <Icons.globe className='h-4 w-4' />,
          href: 'https://www.colosseum.org/radar'
        }
      ]
    }
  ]
} as const;
