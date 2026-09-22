import { DEFAULT_CHANNEL_COLOR, DEFAULT_CHANNEL_CONTRAST } from '../stores/ChannelsStore/ChannelsStore';

export function encodeVisible(arr: boolean[]): string {
  return arr.map((v) => (v ? '1' : '0')).join(',');
}

export function decodeVisible(raw: string): boolean[] {
  return raw.split(',').map((v) => v === '1');
}

export function encodeColors(arr: [number, number, number][]): string {
  return arr.map((c) => c.join(',')).join('_');
}

export function decodeColors(raw: string): [number, number, number][] {
  return raw.split('_').map((chunk) => {
    const [r, g, b] = chunk.split(',').map(Number);
    return [r, g, b];
  });
}

export function encodeContrastLimits(arr: [number, number][]): string {
  return arr.map((c) => c.join(',')).join('_');
}

export function decodeContrastLimits(raw: string): [number, number][] {
  return raw.split('_').map((chunk) => {
    const [min, max] = chunk.split(',').map(Number);
    return [min, max];
  });
}

export function encodeSelectionIndices(arr: number[]): string {
  return arr.join('_');
}

export function decodeSelectionIndices(raw: string): number[] {
  return raw.split('_').map(Number);
}

export function isDefaultVisible(arr: boolean[]): boolean {
  return arr.every((v) => v === true);
}

export function isDefaultColors(arr: [number, number, number][]): boolean {
  return arr.every(
    (c) => c[0] === DEFAULT_CHANNEL_COLOR[0] && c[1] === DEFAULT_CHANNEL_COLOR[1] && c[2] === DEFAULT_CHANNEL_COLOR[2]
  );
}

export function isDefaultContrastLimits(arr: [number, number][]): boolean {
  return arr.every((c) => c[0] === DEFAULT_CHANNEL_CONTRAST[0] && c[1] === DEFAULT_CHANNEL_CONTRAST[1]);
}

export function isDefaultSelectionIndices(arr: number[]): boolean {
  return arr.every((v, i) => v === i);
}
