import { Icons } from '@/components/icons';
import {
  HomeIcon,
  LayersIcon,
  NotebookIcon,
  TrendingUpIcon
} from 'lucide-react';

export const DATA = {
  name: 'kkdemian',
  initials: 'KK',
  url: 'https://kkdemian.com',
  location: 'Web3',
  locationLink: '',
  description: 'Product Engineer｜Nomadism｜Bitcoin&ETH&CRCL HODL. | NS V2',
  summary:
    '6 years of Web3 product engineer, 4 years of Web3 startup experience, led the design and development of 10+ Web3 products (SOL, TON, ICP), obtained 10M level of financing, and led the team to obtain a cumulative total of $300,000. ICP, Tia, ADA, People, Degen Early Alpha.',
  avatarUrl: '/me.jpg',
  skills: [
    'React',
    'Notion',
    'Solana',
    'Typescript',
    'Solidity',
    'Go',
    'Supabase',
    'Cloudflare',
    'Figma',
    'SEO',
    'Rust',
    'AI Agent',
    'Motoko'
  ],
  navbar: [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/blog', icon: NotebookIcon, label: 'Blog' },
    { href: '/stack', icon: LayersIcon, label: 'Stack' },
    { href: '/fund', icon: TrendingUpIcon, label: 'Fund' }
  ],
  contact: {
    email: 'Y2h1aGVtaWFvQGdtYWlsLmNvbQ==',
    tel: 'KzE5MzY2NjY2MTM5',
    social: {
      GitHub: {
        name: 'GitHub',
        url: 'https://github.com/chuhemiao',
        icon: Icons.github,
        navbar: false
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
        navbar: false
      },
      Telegram: {
        name: 'Telegram',
        url: 'https://t.me/kkdemian_laobai',
        icon: Icons.telegram,
        navbar: false
      },
      Books: {
        name: 'Crypto Master',
        url: 'https://book.kkdemian.com/',
        icon: Icons.books,
        navbar: false
      },
      Youtube: {
        name: 'Youtube',
        url: 'https://www.youtube.com/@kkdemian',
        icon: Icons.youtube,
        navbar: false
      },
      email: {
        name: 'Send Email',
        url: '#',
        icon: Icons.email,
        navbar: false
      },
      binance: {
        name: 'Binance',
        url: 'https://accounts.binance.com/en/register?ref=MKOOSEO4',
        icon: Icons.binance,
        navbar: true
      },
      hyper: {
        name: 'HyperLiquid',
        url: 'https://app.hyperliquid.xyz/trade',
        icon: Icons.hyper,
        navbar: true
      }
    }
  },

  work: [
    {
      company: 'iBuidl',
      href: 'https://ibuidl.org',
      badges: [],
      location: 'Remote',
      title: 'Founder',
      logoUrl: '/ibuidl.jpg',
      start: 'May 2024',
      end: 'Now',
      description: '90 days to be a digital nomad, Web2 to Web3.'
    },
    {
      company: 'Yamaswap',
      href: 'https://www.yamaswap.com/',
      badges: [],
      location: 'Remote',
      title: 'TPM',
      logoUrl: '/yamalogo.png',
      start: 'Jun 2024',
      end: 'Now',
      description:
        'Build permissionless ETFs dApp built on top of the Intent Framework and the AI Agent, build with SOL and BASE.'
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
      title: 'Yamaswap',
      href: 'https://yamaswap.com',
      dates: 'Nov 2024 - Now',
      active: true,
      description:
        'Build permissionless ETFs dApp built on top of the Intent Framework and the AI Agent, build with SOL and BASE.',
      technologies: [
        'Next.js',
        'Typescript',
        'React',
        'Golang',
        'Python',
        'Vercel',
        'Shadcn UI',
        'Rust',
        'Solana',
        'Solidity',
        'Chatgpt&Weaviate',
        'Node'
      ],
      links: [
        {
          type: 'Website',
          href: 'https://yamaswap.com',
          icon: <Icons.globe className='size-3' />
        }
      ],
      image: '/yama.png',
      video: ''
    },

    {
      title: 'fCurrency',
      href: 'https://farcaster.xyz/miniapps/EGI5BYDYhzwk/fcurrency',
      dates: 'June 2025 - Now',
      active: true,
      description: 'Composable conversion engine for fiat and crypto assets.',
      technologies: [
        'Next.js',
        'Typescript',
        'React',
        'TailwindCSS',
        'Vercel',
        'Shadcn UI',
        'CMC / CG / Coinapi / FF API'
      ],
      links: [
        {
          type: 'Website',
          href: 'https://farcaster.xyz/miniapps/EGI5BYDYhzwk/fcurrency',
          icon: <Icons.globe className='size-3' />
        }
      ],
      image: '/fcurrency.png',
      video: ''
    },

    {
      title: '🦌 AnkiRin',
      href: 'https://rin.kkdemian.com/',
      dates: 'June 2025 - Now',
      active: true,
      description: 'Master Japanese Vocabulary with AI-Powered Flashcards.',
      technologies: [
        'Next.js',
        'Typescript',
        'React',
        'TailwindCSS',
        'Vercel',
        'Shadcn UI',
        'Firebase',
        'Gemini AI'
      ],
      links: [
        {
          type: 'Website',
          href: 'https://rin.kkdemian.com/',
          icon: <Icons.globe className='size-3' />
        }
      ],
      image: '/ankirin.png',
      video: ''
    },

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
      title: 'Web3 Crypto Tools',
      href: 'https://tool.ibuidl.org/',
      dates: 'Aug 10th 2024 - June 20th 2025',
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
      title: 'Colosseum  hackathons',
      dates: 'Apr 14 - May 16, 2025',
      location: 'Global',
      description: 'Product Engineer',
      image: '/solana.jpg',
      mlh: '',
      links: [
        {
          title: 'breakout',
          icon: <Icons.globe className='h-4 w-4' />,
          href: 'https://www.colosseum.org/breakout'
        }
      ]
    },
    {
      title: 'Solana Radar',
      dates: 'November 3rd - Oct 8th, 2024',
      location: 'UAE',
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
