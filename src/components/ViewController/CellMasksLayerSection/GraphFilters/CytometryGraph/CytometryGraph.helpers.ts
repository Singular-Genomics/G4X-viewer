export function mapValuesToColors(values: number[], colorscale: [number, string][], reverse?: boolean) {
  let scale = colorscale;

  if (reverse) {
    scale = scale.map(([threshold, color]) => [1 - threshold, color]);
    scale = scale.reverse();
  }

  return values.map((value) => {
    if (value <= colorscale[0][0]) {
      return colorscale[0][1];
    }
    if (value >= colorscale[colorscale.length - 1][0]) {
      return colorscale[colorscale.length - 1][1];
    }

    // Find the two threshold points that bracket our value
    let lowerIndex = 0;
    for (let i = 0; i < colorscale.length - 1; i++) {
      if (value >= colorscale[i][0] && value <= colorscale[i + 1][0]) {
        lowerIndex = i;
        break;
      }
    }

    const lowerThreshold = colorscale[lowerIndex][0];
    const upperThreshold = colorscale[lowerIndex + 1][0];
    const lowerColor = colorscale[lowerIndex][1];
    const upperColor = colorscale[lowerIndex + 1][1];

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
