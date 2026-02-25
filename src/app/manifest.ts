import { DATA } from '@/data/resume';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${DATA.name} Portfolio`,
    short_name: DATA.name,
    description: DATA.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f1a',
    theme_color: '#0b0f1a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      }
    ]
  };
}
