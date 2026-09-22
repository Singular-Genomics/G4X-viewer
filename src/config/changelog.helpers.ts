import changelogMarkdown from '../../CHANGELOG.md?raw';
import { ChangelogEntry, ChangelogSection } from './changelog.types';

const VERSION_HEADING_REGEX = /^## \[(.+?)\] - (.+)$/;
const SECTION_HEADING_REGEX = /^### (.+)$/;
const LIST_ITEM_REGEX = /^-\s+(.+)$/;
const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const MAX_LISTED_VERSIONS = 5;

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

type ParsedVersion = [major: number, minor: number, patch: number, preRelease?: string];

const parseVersion = (version: string): ParsedVersion | undefined => {
  const match = version.trim().match(VERSION_REGEX);
  if (!match) return undefined;

  const [, major, minor, patch, preRelease] = match;
  return [Number(major), Number(minor), Number(patch), preRelease];
};

// A bare release outranks any pre-release of the same version (4.0.0-beta < 4.0.0).
const comparePreRelease = (a?: string, b?: string): number => {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a.localeCompare(b, undefined, { numeric: true });
};

const compareVersions = (a: ParsedVersion, b: ParsedVersion): number =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || comparePreRelease(a[3], b[3]);

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
