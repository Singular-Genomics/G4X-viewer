import { useCallback, useEffect, useState } from 'react';
import { getChangelogEntry } from '../config/changelog';

const LAST_SEEN_VERSION_KEY = 'lastSeenAppVersion';

export const useChangelog = () => {
  const appVersion = process.env.APP_VERSION;
  const currentEntry = getChangelogEntry(appVersion);

  const [isOpen, setIsOpen] = useState(
    () => !!currentEntry && localStorage.getItem(LAST_SEEN_VERSION_KEY) !== appVersion
  );

  useEffect(() => {
    if (!currentEntry && appVersion && localStorage.getItem(LAST_SEEN_VERSION_KEY) !== appVersion) {
      localStorage.setItem(LAST_SEEN_VERSION_KEY, appVersion);
    }
  }, [currentEntry, appVersion]);

  const openChangelog = useCallback(() => setIsOpen(true), []);

  const closeChangelog = useCallback(() => {
    if (appVersion) {
      localStorage.setItem(LAST_SEEN_VERSION_KEY, appVersion);
    }
    setIsOpen(false);
  }, [appVersion]);

  return { isOpen, currentEntry, openChangelog, closeChangelog };
};
