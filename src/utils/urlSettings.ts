import { SettingType } from './urlSettings.types';
import { SETTINGS_REGISTRY } from './urlSettingsRegistry';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../stores/CytometryGraphStore/CytometryGraphStore';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { decodeFilterIndices, decodeChangedColors } from './urlSettings.cellFilterHelpers';
import { decodeTranscriptFilterIndices, decodeTranscriptChangedColors } from './urlSettings.transcriptHelpers';

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

export function applyTranscriptFilterUrlSettings(params: URLSearchParams): void {
  const { colorMapConfig } = useZarrDataStore.getState();
  if (!colorMapConfig.length) return;

  const rawFi = params.get('tr_fi');
  if (rawFi) {
    const filters = decodeTranscriptFilterIndices(rawFi, colorMapConfig);
    if (filters.length) useTranscriptLayerStore.setState({ geneNameFilters: filters });
  }

  const rawFc = params.get('tr_fc');
  if (rawFc) {
    const updated = decodeTranscriptChangedColors(rawFc, colorMapConfig);
    useZarrDataStore.setState({ colorMapConfig: updated });
  }
}

export function applyCellFilterUrlSettings(params: URLSearchParams): void {
  const { availableClusterLabels } = useCellSegmentationLayerStore.getState();
  if (!availableClusterLabels.length) return;

  let label = availableClusterLabels[0];
  const rawCk = params.get('seg_ck');
  if (rawCk) {
    const found = availableClusterLabels.find((l) => l.key === rawCk);
    if (found) {
      label = found;
      useCellSegmentationLayerStore.setState({ selectedClusterLabelKey: rawCk });
    }
  }

  const rawFi = params.get('seg_fi');
  if (rawFi) {
    const filters = decodeFilterIndices(rawFi, label.clusterIdOrder);
    if (filters.length) useCellSegmentationLayerStore.setState({ cellNameFilters: filters });
  }

  const rawFc = params.get('seg_fc');
  if (rawFc) {
    const { cellColormapConfig } = useCellSegmentationLayerStore.getState();
    if (cellColormapConfig.length) {
      const updated = decodeChangedColors(rawFc, cellColormapConfig, label.clusterIdOrder);
      useCellSegmentationLayerStore.setState({ cellColormapConfig: updated });
    }
  }
}

export function applyCytometryFilterUrlSettings(params: URLSearchParams): void {
  const { segmentationMetadata } = useCellSegmentationLayerStore.getState();
  const proteinCount = segmentationMetadata?.proteinNames?.length ?? 0;
  if (!proteinCount) return;

  // Axes index into proteinValues - validate against loaded protein count to avoid out-of-range filtering
  let validIndices = false;
  const rawXy = params.get('cyto_xy');
  if (rawXy) {
    const [x, y] = rawXy.split(',').map(Number);
    if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < proteinCount && y < proteinCount) {
      useCytometryGraphStore.setState({ proteinIndices: { xAxisIndex: x, yAxisIndex: y } });
      validIndices = true;
    }
  }

  const rawR = params.get('cyto_r');
  if (rawR && validIndices) {
    const parts = rawR.split(',').map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      const [xStart, xEnd, yStart, yEnd] = parts;
      if (xStart < xEnd && yEnd < yStart) {
        useCytometryGraphStore.setState({ ranges: { xStart, xEnd, yStart, yEnd } });
      }
    }
  }
}
