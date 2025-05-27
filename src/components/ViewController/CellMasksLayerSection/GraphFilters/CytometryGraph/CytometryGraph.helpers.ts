export function mapValuesToColors(values: number[], colorscale: [number, string][], reverse?: boolean) {
  let scale = colorscale;

  if (reverse) {
    scale = scale.map(([threshold, color]) => [1 - threshold, color]);
    scale = scale.reverse();
  }

  return values.map((value) => {
    if (value <= scale[0][0]) {
      return scale[0][1];
    }
    if (value >= scale[scale.length - 1][0]) {
      return scale[scale.length - 1][1];
    }

    let lowerIndex = 0;
    for (let i = 0; i < scale.length - 1; i++) {
      if (value >= scale[i][0] && value <= scale[i + 1][0]) {
        lowerIndex = i;
        break;
      }
    }

    const lowerThreshold = scale[lowerIndex][0];
    const upperThreshold = scale[lowerIndex + 1][0];
    const lowerColor = scale[lowerIndex][1];
    const upperColor = scale[lowerIndex + 1][1];

    if (value === lowerThreshold) {
      return lowerColor;
    }
    if (value === upperThreshold) {
      return upperColor;
    }

    // Interpolate between the two colors
    const ratio = (value - lowerThreshold) / (upperThreshold - lowerThreshold);
    return interpolateColor(lowerColor, upperColor, ratio);
  });
}

function interpolateColor(color1: string, color2: string, ratio: number) {
  const hex2rgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const rgb2hex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const [r1, g1, b1] = hex2rgb(color1);
  const [r2, g2, b2] = hex2rgb(color2);

  const r = r1 + (r2 - r1) * ratio;
  const g = g1 + (g2 - g1) * ratio;
  const b = b1 + (b2 - b1) * ratio;

  return rgb2hex(r, g, b);
}
