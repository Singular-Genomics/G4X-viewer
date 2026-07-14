import { ChangelogEntry } from './changelog.types';

export const changelog: ChangelogEntry[] = [
  {
    version: '4.0.0-beta',
    date: '2026-07-14',
    sections: [
      {
        title: 'New Features',
        items: ['Feature 1', 'Feature 2', 'Feature 3']
      },
      {
        title: 'Improvements & Fixes',
        items: ['Improvement 1', 'Improvement 2', 'Fix 1', 'Fix 2']
      }
    ]
  }
];

export const getChangelogEntry = (version?: string): ChangelogEntry | undefined =>
  changelog.find((entry) => entry.version === version);
