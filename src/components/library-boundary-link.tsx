'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { libraryDocumentNavigation } from '@/lib/library/navigation';

export default function LibraryBoundaryLink({ href, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const pathname = usePathname();
  return libraryDocumentNavigation(pathname, href)
    ? <a href={href} {...props} />
    : <Link href={href} {...props} />;
}
