import { createTheme, decomposeColor } from '@mui/material';
import { darkPalette, lightPalette, colors } from '../../themes/palette';

export const COLOR_TOKENS = [
  'background.topBar',
  'background.settingsPanel',
  'background.viewport',
  'background.paper',
  'background.default',
  'text.primary',
  'text.secondary',
  'divider',
  'sectionDivider',
  'primary.main',
  'primary.dark',
  'primary.contrastText',
  'gx.darkGrey.500'
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];
export const COLOR_ELEMENTS = [
  'topBar',
  'sectionHeader',
  'settingsPanel',
  'viewport',
  'controlSurface',
  'valueField',
  'statusBubble',
  'primaryText',
  'secondaryText',
  'border',
  'accent',
  'accentText',
  'separator'
] as const;
export type ColorElement = (typeof COLOR_ELEMENTS)[number];
export type PaletteMode = 'light' | 'dark';
export type ColorDraft = {
  colors: Record<ColorToken, string>;
  assignments: Record<ColorElement, ColorToken>;
};
export type ColorDrafts = Record<PaletteMode, ColorDraft>;
export const COLOR_DRAFT_STORAGE_KEY = 'g4x-color-reference-v1';

export function toHexColor(value: string): string {
  if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(value)) return value.toUpperCase();
  const parsed = decomposeColor(value);
  if (parsed.type !== 'rgb' && parsed.type !== 'rgba') throw new Error('Unsupported color');
  const rgb = parsed.values
    .slice(0, 3)
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('');
  const opacity = parsed.values[3];
  return `#${rgb}${
    opacity === undefined || opacity === 1
      ? ''
      : Math.round(opacity * 255)
          .toString(16)
          .padStart(2, '0')
  }`.toUpperCase();
}

const defaultAssignments: ColorDraft['assignments'] = {
  topBar: 'background.topBar',
  sectionHeader: 'background.paper',
  settingsPanel: 'background.settingsPanel',
  viewport: 'background.viewport',
  controlSurface: 'background.paper',
  valueField: 'gx.darkGrey.500',
  statusBubble: 'background.settingsPanel',
  primaryText: 'text.primary',
  secondaryText: 'text.secondary',
  border: 'divider',
  accent: 'primary.main',
  accentText: 'primary.contrastText',
  separator: 'sectionDivider'
};

export function createDefaultColorDraft(mode: PaletteMode): ColorDraft {
  const palette = createTheme({ palette: mode === 'dark' ? darkPalette : lightPalette }).palette;
  const values: Record<ColorToken, string> = {
    'background.topBar': palette.background.topBar,
    'background.settingsPanel': palette.background.settingsPanel,
    'background.viewport': palette.background.viewport,
    'background.paper': palette.background.paper,
    'background.default': palette.background.default,
    'text.primary': palette.text.primary,
    'text.secondary': palette.text.secondary,
    divider: palette.divider,
    sectionDivider: palette.sectionDivider,
    'primary.main': palette.primary.main,
    'primary.dark': palette.primary.dark,
    'primary.contrastText': palette.primary.contrastText,
    'gx.darkGrey.500': palette.gx.darkGrey[500]
  };
  return {
    colors: Object.fromEntries(COLOR_TOKENS.map((token) => [token, toHexColor(values[token])])) as ColorDraft['colors'],
    assignments: { ...defaultAssignments }
  };
}

export function createDefaultColorDrafts(): ColorDrafts {
  return { light: createDefaultColorDraft('light'), dark: createDefaultColorDraft('dark') };
}

export function parseColorDrafts(input: unknown): ColorDrafts {
  if (!input || typeof input !== 'object') throw new Error('Invalid configuration');
  const config = input as { version?: unknown; palettes?: unknown };
  if (config.version !== 1 || !config.palettes || typeof config.palettes !== 'object')
    throw new Error('Invalid configuration');
  const palettes = config.palettes as Record<string, unknown>;
  const result = createDefaultColorDrafts();
  for (const mode of ['light', 'dark'] as const) {
    const draft = palettes[mode] as ColorDraft | undefined;
    if (!draft?.colors || !draft.assignments) throw new Error('Missing palette');
    for (const token of COLOR_TOKENS) {
      const value = draft.colors[token];
      if (typeof value !== 'string' || !/^#[\da-f]{6}([\da-f]{2})?$/i.test(value)) throw new Error('Invalid color');
      result[mode].colors[token] = value.toUpperCase();
    }
    for (const element of COLOR_ELEMENTS) {
      if (!COLOR_TOKENS.includes(draft.assignments[element])) throw new Error('Invalid assignment');
      result[mode].assignments[element] = draft.assignments[element];
    }
  }
  return result;
}

export function serializeColorDrafts(palettes: ColorDrafts): string {
  return JSON.stringify({ version: 1, palettes }, null, 2);
}

export function resolveElementColor(draft: ColorDraft, element: ColorElement): string {
  return draft.colors[draft.assignments[element]];
}

export const REFERENCE_SWATCHES = [
  ...Object.values(colors.darkGrey),
  ...Object.values(colors.mediumGrey),
  ...Object.values(colors.lightGrey),
  colors.blue.main,
  colors.accent.purple,
  colors.accent.magenta,
  colors.accent.greenBlue,
  colors.accent.orange,
  colors.accent.yellow,
  colors.accent.red,
  colors.green.main
].filter((value, index, all) => all.indexOf(value) === index);
