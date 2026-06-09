import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useChannelsStore } from '../stores/ChannelsStore';
import { SettingDef, SettingType } from './urlSettings.types';

const SETTINGS_REGISTRY: SettingDef[] = [
  {
    key: 'ch',
    type: 'boolean',
    defaultValue: true,
    read: () => useChannelsStore.getState().isLayerVisible,
    write: (val) => useChannelsStore.setState({ isLayerVisible: val as boolean })
  },
  {
    key: 'he',
    type: 'boolean',
    defaultValue: true,
    read: () => useBrightfieldImagesStore.getState().isLayerVisible,
    write: (val) => useBrightfieldImagesStore.setState({ isLayerVisible: val as boolean })
  },
  {
    key: 'tr',
    type: 'boolean',
    defaultValue: true,
    read: () => useTranscriptLayerStore.getState().isTranscriptLayerOn,
    write: (val) => useTranscriptLayerStore.setState({ isTranscriptLayerOn: val as boolean })
  },
  {
    key: 'seg',
    type: 'boolean',
    defaultValue: true,
    read: () => useCellSegmentationLayerStore.getState().isCellLayerOn,
    write: (val) => useCellSegmentationLayerStore.setState({ isCellLayerOn: val as boolean })
  }
];

function serializeValue(val: boolean | number, type: SettingType): string {
  if (type === 'boolean') return val ? '1' : '0';
  return String(val);
}

function deserializeValue(raw: string, type: SettingType): boolean | number {
  if (type === 'boolean') return raw === '1';
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
