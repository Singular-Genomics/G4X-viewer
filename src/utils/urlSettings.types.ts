export type SettingType = 'boolean' | 'number';

export type SettingDef = {
  key: string;
  type: SettingType;
  defaultValue: boolean | number;
  read: () => boolean | number;
  write: (val: boolean | number) => void;
};
