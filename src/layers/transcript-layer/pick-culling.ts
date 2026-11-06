import type { FilterContext, Viewport } from '@deck.gl/core';

/** [minX, minY, maxX, maxY] in world coordinates */
export type Bounds = [number, number, number, number];

const EMPTY_BOUNDS: Bounds = [Infinity, Infinity, -Infinity, -Infinity];

/** Extent of the first `length` points of an interleaved [x, y] array */
export function pointBounds(positions: Float32Array, length: number): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < length * 2; i += 2) {
    const x = positions[i];
    const y = positions[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

/**
 * Picking renders every pickable sublayer, so a pick over merged point buckets would draw every point and then wait
 * for the GPU in readPixels. Like deck's TileLayer does per tile, only buckets near the pick rectangle are drawn.
 */
export class PickCuller {
  private viewport: Viewport | null = null;
  private cullRect: FilterContext['cullRect'] = undefined;
  private padPixels = 0;
  private bounds: Bounds = EMPTY_BOUNDS;

  /** `padPixels`: how far (in screen pixels) a point drawn at a position can reach, e.g. its radius */
  shouldDraw({ isPicking, cullRect, viewport, layer }: FilterContext, padPixels: number): boolean {
    const target = (layer.props as { pickBounds?: Bounds }).pickBounds;
    if (!isPicking || !cullRect || !target) return true;
    if (viewport !== this.viewport || cullRect !== this.cullRect || padPixels !== this.padPixels) {
      this.viewport = viewport;
      this.cullRect = cullRect;
      this.padPixels = padPixels;
      this.bounds = screenRectBounds(viewport, cullRect, padPixels);
    }
    const [minX, minY, maxX, maxY] = this.bounds;
    return target[0] <= maxX && target[2] >= minX && target[1] <= maxY && target[3] >= minY;
  }
}

function screenRectBounds(viewport: Viewport, rect: NonNullable<FilterContext['cullRect']>, pad: number): Bounds {
  const x0 = rect.x - viewport.x - pad;
  const y0 = rect.y - viewport.y - pad;
  const x1 = x0 + rect.width + 2 * pad;
  const y1 = y0 + rect.height + 2 * pad;
  const corners = [
    viewport.unproject([x0, y0]),
    viewport.unproject([x1, y0]),
    viewport.unproject([x0, y1]),
    viewport.unproject([x1, y1])
  ];
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
