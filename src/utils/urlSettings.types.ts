export type SettingType = 'boolean' | 'number' | 'string';

export type SettingDef = {
  key: string;
  type: SettingType;
  defaultValue: boolean | number | string;
  read: () => boolean | number | string;
  write: (val: boolean | number | string) => void;
};
