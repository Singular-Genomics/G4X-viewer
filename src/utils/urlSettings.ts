import { SettingType } from './urlSettings.types';
import { SETTINGS_REGISTRY } from './urlSettingsRegistry';

function serializeValue(val: boolean | number | string, type: SettingType): string {
  if (type === 'boolean') return val ? '1' : '0';
  if (type === 'string') return val as string;
  return String(val);
}

function deserializeValue(raw: string, type: SettingType): boolean | number | string {
  if (type === 'boolean') return raw === '1';
  if (type === 'string') return raw;
  return parseFloat(raw);
}

export function serializeSettings(): URLSearchParams {
  const params = new URLSearchParams();
  for (const setting of SETTINGS_REGISTRY) {
    const current = setting.read();
    if (current !== setting.defaultValue) {
      params.set(setting.key, serializeValue(current, setting.type));
    }
  }
  return params;
}

export function applyUrlSettings(params: URLSearchParams): void {
  for (const setting of SETTINGS_REGISTRY) {
    const raw = params.get(setting.key);
    if (raw !== null) {
      setting.write(deserializeValue(raw, setting.type));
    }
  }
}
