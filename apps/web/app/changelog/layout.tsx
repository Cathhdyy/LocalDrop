import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — LocalDrop',
  description: 'New updates, improvements, protocol upgrades, and fixes to LocalDrop.',
  openGraph: {
    title: 'LocalDrop Changelog — What’s New',
    description: 'New updates, improvements, protocol upgrades, and fixes to LocalDrop.',
    images: [{ url: '/logo.png' }],
  },
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
