import { alpha, Theme } from '@mui/material';

export type ReferenceSize = 'small' | 'medium' | 'large';
export type ReferenceSurface = 'filled' | 'outlined' | 'tonal' | 'text';
export type ReferenceBehavior = 'action' | 'toggle';
export type ReferenceIcon = 'none' | 'leading' | 'trailing' | 'only';
export type ReferenceState = 'rest' | 'hover' | 'focus' | 'disabled';
export type ButtonSpec = {
  size: ReferenceSize;
  surface: ReferenceSurface;
  behavior: ReferenceBehavior;
  icon: ReferenceIcon;
};

export const BUTTON_METRICS = {
  small: { height: 28, padding: 10, font: 12, icon: 16 },
  medium: { height: 36, padding: 14, font: 13, icon: 18 },
  large: { height: 44, padding: 18, font: 14, icon: 20 }
};

export const DEFAULT_BUTTON_SPEC: ButtonSpec = {
  size: 'medium',
  surface: 'outlined',
  behavior: 'toggle',
  icon: 'leading'
};

export const BUTTON_REFERENCES: { id: string; spec: ButtonSpec }[] = (['action', 'toggle'] as const).flatMap(
  (behavior, behaviorIndex) =>
    (['filled', 'outlined', 'tonal', 'text'] as const).map((surface, surfaceIndex) => ({
      id: `B${String(behaviorIndex * 4 + surfaceIndex + 1).padStart(2, '0')}`,
      spec: { size: 'medium', surface, behavior, icon: 'leading' }
    }))
);

export function getReferenceButtonStyles(theme: Theme, spec: ButtonSpec, selected: boolean, state: ReferenceState) {
  const metrics = BUTTON_METRICS[spec.size];
  const blue = theme.palette.primary.main;
  const isOff = spec.behavior === 'toggle' && !selected;
  const ink = isOff ? theme.palette.text.secondary : blue;
  const paper = theme.palette.background.paper;
  const background =
    spec.surface === 'filled'
      ? isOff
        ? theme.palette.action.disabledBackground
        : blue
      : spec.surface === 'tonal'
        ? isOff
          ? paper
          : alpha(blue, 0.16)
        : 'transparent';
  const foreground = spec.surface === 'filled' && !isOff ? theme.palette.primary.contrastText : ink;
  const hoverBackground =
    spec.surface === 'outlined' || spec.surface === 'text'
      ? alpha(blue, 0.1)
      : spec.surface === 'filled' && !isOff
        ? theme.palette.primary.dark
        : alpha(blue, 0.24);
  const base = {
    height: metrics.height,
    minWidth: spec.icon === 'only' ? metrics.height : 0,
    width: spec.icon === 'only' ? metrics.height : 'auto',
    padding: spec.icon === 'only' ? 0 : `0 ${metrics.padding}px`,
    gap: '8px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: spec.surface === 'outlined' ? ink : 'transparent',
    fontSize: metrics.font,
    lineHeight: 1,
    fontWeight: 600,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    color: foreground,
    backgroundColor: state === 'hover' ? hoverBackground : background,
    outline: state === 'focus' ? `2px solid ${blue}` : 'none',
    outlineOffset: '3px',
    transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
    '& .MuiSvgIcon-root': { fontSize: metrics.icon, flexShrink: 0 },
    '&:hover': { backgroundColor: hoverBackground, boxShadow: 'none' },
    '&.Mui-focusVisible': { outline: `2px solid ${blue}`, outlineOffset: '3px' },
    '&.Mui-disabled': {
      color: theme.palette.action.disabled,
      backgroundColor:
        spec.surface === 'filled' || spec.surface === 'tonal' ? theme.palette.action.disabledBackground : 'transparent',
      borderColor: spec.surface === 'outlined' ? theme.palette.divider : 'transparent'
    }
  };
  return {
    ...base,
    '&.Mui-selected': {
      color: foreground,
      backgroundColor: base.backgroundColor,
      borderColor: base.borderColor,
      '&:hover': base['&:hover'],
      '&.Mui-disabled': base['&.Mui-disabled']
    }
  };
}
