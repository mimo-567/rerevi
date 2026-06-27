// Top-bar navigation, per requirements.md §7a.
export type NavItem = {
  label: string;
  href: string;
  comingSoon?: boolean;
  external?: boolean;
};

export const GITHUB_URL = 'https://github.com/zafirshirazi/rerevi';

export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Topic Summaries', href: '/topic-summaries', comingSoon: true },
  { label: 'Generators & Mark Schemes', href: '/generator' },
  { label: 'Question Lookup', href: '/question-lookup' },
  { label: 'How to Revise', href: '/how-to-revise' },
  { label: 'GitHub', href: GITHUB_URL, external: true },
  { label: 'MEGA RE DATABASE', href: '/mega-database', comingSoon: true },
];
