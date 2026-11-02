import { LibraryPage } from '@/components/library/library-page';
import { libraryIndexMetadata } from '@/lib/library/metadata';

export const metadata = libraryIndexMetadata('en');
export default function Page() { return <LibraryPage locale="en" />; }
