import { CellSegmentationColormapEntry } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';

export function encodeRanges(indices: number[]): string {
  if (indices.length === 0) return '';
  const sorted = [...indices].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(',');
}

export function decodeRanges(encoded: string): number[] {
  if (!encoded) return [];
  const indices: number[] = [];
  for (const part of encoded.split(',')) {
    const dashIdx = part.indexOf('-');
    if (dashIdx === -1) {
      const n = parseInt(part, 10);
      if (!isNaN(n)) indices.push(n);
    } else {
      const s = parseInt(part.slice(0, dashIdx), 10);
      const e = parseInt(part.slice(dashIdx + 1), 10);
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        for (let i = s; i <= e; i++) indices.push(i);
      }
    }
  }
  return indices;
}

export function encodeFilterIndices(filters: string[], clusterIdOrder: string[]): string {
  const indices = filters.map((id) => clusterIdOrder.indexOf(id)).filter((i) => i !== -1);
  return encodeRanges(indices);
}

export function decodeFilterIndices(encoded: string, clusterIdOrder: string[]): string[] {
  return decodeRanges(encoded)
    .filter((i) => i >= 0 && i < clusterIdOrder.length)
    .map((i) => clusterIdOrder[i]);
}

export function encodeChangedColors(
  config: CellSegmentationColormapEntry[],
  defaults: Record<string, [number, number, number]>,
  clusterIdOrder: string[]
): string {
  const parts: string[] = [];
  for (const entry of config) {
    const def = defaults[entry.clusterId];
    if (!def) continue;
    const [r, g, b] = entry.color;
    if (def[0] === r && def[1] === g && def[2] === b) continue;
    const idx = clusterIdOrder.indexOf(entry.clusterId);
    if (idx === -1) continue;
    const hex = [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
    parts.push(`${idx}:${hex}`);
  }
  return parts.join(';');
}

export function decodeChangedColors(
  encoded: string,
  config: CellSegmentationColormapEntry[],
  clusterIdOrder: string[]
): CellSegmentationColormapEntry[] {
  if (!encoded) return config;
  const overrides = new Map<string, number[]>();
  for (const part of encoded.split(';')) {
    const colon = part.indexOf(':');
    if (colon === -1) continue;
    const idx = parseInt(part.slice(0, colon), 10);
    const hex = part.slice(colon + 1);
    if (isNaN(idx) || hex.length !== 6) continue;
    const clusterId = clusterIdOrder[idx];
    if (!clusterId) continue;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    overrides.set(clusterId, [r, g, b]);
  }
  if (overrides.size === 0) return config;
  return config.map((entry) => {
    const override = overrides.get(entry.clusterId);
    return override ? { ...entry, color: override } : entry;
  });
}
