export function makeBoundingBox(viewState: any) {
  const { target, zoom, width, height } = viewState;
  const scale = Math.pow(2, zoom);
  const worldWidth = width / scale;
  const worldHeight = height / scale;
  const halfWidth = worldWidth / 2;
  const halfHeight = worldHeight / 2;

  const left = target[0] - halfWidth;
  const top = target[1] - halfHeight;
  const right = target[0] + halfWidth;
  const bottom = target[1] + halfHeight;

  return [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom]
  ];
}

export function range(length: number): number[] {
  return [...Array(length).keys()];
}
