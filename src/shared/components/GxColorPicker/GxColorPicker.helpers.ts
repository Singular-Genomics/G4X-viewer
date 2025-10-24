import type { ColorHex, ColorHsv, ColorRgb } from './GxColorPicker.types';

export function HexToRgb(colorHex: ColorHex): ColorRgb {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : {
        r: 0,
        g: 0,
        b: 0
      };
}

export function RgbToHex(colorRgb: ColorRgb): ColorHex {
  return '#' + ((1 << 24) | (colorRgb.r << 16) | (colorRgb.g << 8) | colorRgb.b).toString(16).slice(1);
}

export function RgbToHsv(colorRgb: ColorRgb): ColorHsv {
  const normR = colorRgb.r / 255;
  const normG = colorRgb.g / 255;
  const normB = colorRgb.b / 255;

  const maxC = Math.max(normR, normG, normB);
  const minC = Math.min(normR, normG, normB);
  const delta = maxC - minC;

  let hue =
    (function () {
      if (delta === 0) {
        return 0;
      }

      switch (maxC) {
        case normR:
          return ((normG - normB) / delta) % 6;
        case normG:
          return (normB - normR) / delta + 2;
        default:
          return (normR - normG) / delta + 4;
      }
    })() * 60;

  hue = hue < 0 ? hue + 360 : hue;
  const saturation = maxC === 0 ? 0 : delta / maxC;
  const value = maxC;

  return {
    h: hue,
    s: saturation,
    v: value
  };
}

export function HsvToRgb(colorHsv: ColorHsv): ColorRgb {
  const { h, s, v } = colorHsv;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r, g, b;
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

export function HexToHsv(colorHex: ColorHex): ColorHsv {
  const colorRgb = HexToRgb(colorHex);
  return RgbToHsv(colorRgb);
}

export function HsvToHex(colorHsv: ColorHsv): ColorHex {
  const colorRgb = HsvToRgb(colorHsv);
  return RgbToHex(colorRgb);
}

export function HsvToString(colorHsv: ColorHsv): string {
  return `hsv(${colorHsv.h},${colorHsv.s},${colorHsv.v})`;
}

export function StringToHsv(colorHsvString: string): ColorHsv {
  const hsvRegex = /hsv\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\)/;
  const match = colorHsvString.match(hsvRegex);
  if (!match) {
    return { h: 1, s: 1, v: 1 };
  }

  const [, hue, saturation, value] = match.map(Number);
  return {
    h: hue,
    s: saturation,
    v: value
  };
}

export function CalculatePaletteColor(hue: number, pageX: number, pageY: number, palleteBBox: DOMRect): ColorHsv {
  const { left, top, width, height } = palleteBBox;

  const x = Math.max(0, Math.min(width, pageX - (left + scrollX)));
  const y = Math.max(0, Math.min(height, pageY - (top + scrollY)));

  const saturation = x / width;
  const value = 1 - y / height;

  return {
    h: hue,
    s: saturation,
    v: value
  };
}

export function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return 'touches' in event;
}

export function getParentWindow(node?: HTMLDivElement | null): Window {
  return (node && node.ownerDocument.defaultView) || self;
}
