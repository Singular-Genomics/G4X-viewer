import changelogMarkdown from '../../CHANGELOG.md?raw';
import { ChangelogEntry, ChangelogSection } from './changelog.types';

const VERSION_HEADING_REGEX = /^## \[(.+?)\] - (.+)$/;
const SECTION_HEADING_REGEX = /^### (.+)$/;
const LIST_ITEM_REGEX = /^-\s+(.+)$/;

const parseChangelog = (markdown: string): ChangelogEntry[] => {
  const entries: ChangelogEntry[] = [];
  let currentEntry: ChangelogEntry | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of markdown.split('\n')) {
    const versionMatch = line.match(VERSION_HEADING_REGEX);
    if (versionMatch) {
      currentEntry = { version: versionMatch[1], date: versionMatch[2], sections: [] };
      currentSection = null;
      entries.push(currentEntry);
      continue;
    }

    const sectionMatch = line.match(SECTION_HEADING_REGEX);
    if (sectionMatch && currentEntry) {
      currentSection = { title: sectionMatch[1], items: [] };
      currentEntry.sections.push(currentSection);
      continue;
    }

    const itemMatch = line.match(LIST_ITEM_REGEX);
    if (itemMatch && currentSection) {
      currentSection.items.push(itemMatch[1]);
    }
  }

  return entries;
};

export const changelog: ChangelogEntry[] = parseChangelog(changelogMarkdown);

export const getChangelogEntry = (version?: string): ChangelogEntry | undefined =>
  changelog.find((entry) => entry.version === version);
