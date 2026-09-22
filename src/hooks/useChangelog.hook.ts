import { useCallback, useEffect, useState } from 'react';
import { getChangelogEntries } from '../config/changelog.helpers';

const LAST_SEEN_VERSION_KEY = 'lastSeenAppVersion';

export const useChangelog = () => {
  const appVersion = process.env.APP_VERSION;
  const lastSeenAppVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);

  useEffect(() => {
    if (!appVersion && !lastSeenAppVersion) {
      console.error('No source for changelog data could be found');
    }
    //eslint-disable-next-line
  }, []);

  const markdownParse = getChangelogEntries(lastSeenAppVersion ?? '');

  const [isOpen, setIsOpen] = useState(() => !!markdownParse?.entries.length && lastSeenAppVersion !== appVersion);

  const openChangelog = useCallback(() => setIsOpen(true), []);

  const closeChangelog = useCallback(() => {
    if (appVersion) {
      localStorage.setItem(LAST_SEEN_VERSION_KEY, appVersion);
    }
    setIsOpen(false);
  }, [appVersion]);

  return {
    isOpen,
    currentEntries: markdownParse?.entries,
    showMore: markdownParse?.wasLimited,
    openChangelog,
    closeChangelog
  };
};
