import changelogMarkdown from '../../CHANGELOG.md?raw';
import { ChangelogEntry, ChangelogSection } from './changelog.types';

const VERSION_HEADING_REGEX = /^## \[(.+?)\] - (.+)$/;
const SECTION_HEADING_REGEX = /^### (.+)$/;
const LIST_ITEM_REGEX = /^-\s+(.+)$/;
const MAX_LISTED_VERSIONS = 10;

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

type ParsedVersion = [major: number, minor: number, patch: number];

const parseVersion = (version: string): ParsedVersion | undefined => {
  const parts = version.trim().split('.');
  if (parts.length !== 3) return undefined;

  const [major, minor, patch] = parts.map((part) => Number.parseInt(part, 10));
  if ([major, minor, patch].some(Number.isNaN)) return undefined;

  return [major, minor, patch];
};

const compareVersions = (a: ParsedVersion, b: ParsedVersion): number => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

export const getChangelogEntries = (
  versionSince?: string
): { entries: ChangelogEntry[]; wasLimited: boolean } | undefined => {
  try {
    const changelog: ChangelogEntry[] = parseChangelog(changelogMarkdown);

    if (changelog.length === 0) return undefined;

    const since = versionSince ? parseVersion(versionSince) : undefined;

    if (!since) {
      return {
        entries: changelog.splice(0, MAX_LISTED_VERSIONS),
        wasLimited: true
      };
    }

    const lastSeenIndex = changelog.findIndex((entry) => {
      const parsedVersion = parseVersion(entry.version);
      return !parsedVersion || compareVersions(parsedVersion, since) <= 0;
    });

    if (lastSeenIndex < 0) {
      return {
        entries: changelog.splice(0, MAX_LISTED_VERSIONS),
        wasLimited: true
      };
    }

    const unseen = changelog.slice(0, lastSeenIndex);

    const wasLimited = unseen.length > MAX_LISTED_VERSIONS;

    return {
      entries: wasLimited ? unseen.slice(0, MAX_LISTED_VERSIONS) : unseen,
      wasLimited
    };
  } catch (e) {
    throw new Error(`Failed to parse the changelog markdown data: ${e}`);
  }
};
