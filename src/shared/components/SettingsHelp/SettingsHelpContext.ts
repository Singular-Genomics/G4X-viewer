import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type HelpEntry = { title?: ReactNode; content: ReactNode };
export type ActiveHelp = HelpEntry & { id: string };
type SettingsHelpContextValue = {
  visible: boolean;
  help: ActiveHelp | null;
  toggleVisible: () => void;
  register: (id: string, entry: HelpEntry) => void;
  unregister: (id: string) => void;
  showForTarget: (target: EventTarget | null) => void;
};
export const SettingsHelpContext = createContext<SettingsHelpContextValue | null>(null);

export const useSettingsHelp = () => useContext(SettingsHelpContext);
