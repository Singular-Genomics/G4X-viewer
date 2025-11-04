export function thresholdColorMap(
  colorscale: [number, string][],
  upperLimit: number = 1,
  lowerLimit: number = 0
): [number, string][] {
  const newColorscale: [number, string][] = colorscale.map((entry) => [
    +(lowerLimit + entry[0] * (upperLimit - lowerLimit)).toPrecision(4),
    entry[1]
  ]);

  if (lowerLimit > 0) {
    newColorscale.unshift([0, colorscale[0][1]]);
  }

  if (upperLimit < 1) {
    newColorscale.push([1, colorscale[colorscale.length - 1][1]]);
  }

  return newColorscale;
}
