import { ColorMapEntry } from '../stores/ZarrDataStore/ZarrDataStore.types';
import { encodeRanges, decodeRanges } from './urlSettings.cellFilterHelpers';

export function encodeTranscriptFilterIndices(filters: string[], colorMapConfig: ColorMapEntry[]): string {
  const indices = filters.map((name) => colorMapConfig.findIndex((e) => e.gene_name === name)).filter((i) => i !== -1);
  return encodeRanges(indices);
}

export function decodeTranscriptFilterIndices(encoded: string, colorMapConfig: ColorMapEntry[]): string[] {
  return decodeRanges(encoded)
    .filter((i) => i >= 0 && i < colorMapConfig.length)
    .map((i) => colorMapConfig[i].gene_name);
}

export function encodeTranscriptChangedColors(current: ColorMapEntry[], defaults: ColorMapEntry[]): string {
  const parts: string[] = [];
  for (let i = 0; i < current.length; i++) {
    const cur = current[i];
    const def = defaults.find((d) => d.gene_name === cur.gene_name);
    if (!def) continue;
    const [r, g, b] = cur.color;
    const [dr, dg, db] = def.color;
    if (r === dr && g === dg && b === db) continue;
    const hex = [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
    parts.push(`${i}:${hex}`);
  }
  return parts.join(';');
}

export function decodeTranscriptChangedColors(encoded: string, current: ColorMapEntry[]): ColorMapEntry[] {
  if (!encoded) return current;
  const overrides = new Map<number, number[]>();
  for (const part of encoded.split(';')) {
    const colon = part.indexOf(':');
    if (colon === -1) continue;
    const idx = parseInt(part.slice(0, colon), 10);
    const hex = part.slice(colon + 1);
    if (isNaN(idx) || hex.length !== 6) continue;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    overrides.set(idx, [r, g, b]);
  }
  if (overrides.size === 0) return current;
  return current.map((entry, i) => {
    const override = overrides.get(i);
    return override ? { ...entry, color: override } : entry;
  });
}
