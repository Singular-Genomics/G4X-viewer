import { useCallback, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { SettingsHelpContext } from './SettingsHelpContext';
import type { ActiveHelp, HelpEntry } from './SettingsHelpContext';

const STORAGE_KEY = 'g4x-settings-info-view-visible';

export const SettingsHelpProvider = ({ children }: PropsWithChildren) => {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [help, setHelp] = useState<ActiveHelp | null>(null);
  const registry = useRef(new Map<string, HelpEntry>());
  const activeId = useRef<string | null>(null);

  const register = useCallback((id: string, entry: HelpEntry) => {
    registry.current.set(id, entry);
    if (activeId.current === id) setHelp({ id, ...entry });
  }, []);
  const unregister = useCallback((id: string) => {
    registry.current.delete(id);
    if (activeId.current === id) {
      activeId.current = null;
      setHelp(null);
    }
  }, []);
  const showForTarget = useCallback(
    (target: EventTarget | null) => {
      const id =
        visible && target instanceof Element
          ? (target.closest<HTMLElement>('[data-settings-help]')?.dataset.settingsHelp ?? null)
          : null;
      const entry = id ? registry.current.get(id) : undefined;
      const nextId = entry ? id : null;
      if (activeId.current === nextId) return;
      activeId.current = nextId;
      setHelp(entry && id ? { id, ...entry } : null);
    },
    [visible]
  );
  const toggleVisible = useCallback(() => {
    setVisible((current) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!current));
      } catch {
        /* Session-only preference. */
      }
      return !current;
    });
    activeId.current = null;
    setHelp(null);
  }, []);
  const value = useMemo(
    () => ({ visible, help, toggleVisible, register, unregister, showForTarget }),
    [visible, help, toggleVisible, register, unregister, showForTarget]
  );

  return <SettingsHelpContext.Provider value={value}>{children}</SettingsHelpContext.Provider>;
};
