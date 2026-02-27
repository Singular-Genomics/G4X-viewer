import { openGroup, openArray, ZarrArray } from 'zarr';
import { ZarrPixelSource } from '@vivjs/loaders';

import type { MultiscaleMetadata, OmeroMetadata } from './loadLocalOmeZarr.types';

/**
 * Round down to the previous power of 2.
 */
function prevPowerOf2(x: number): number {
  return 2 ** Math.floor(Math.log2(x));
}

/**
 * Guess tile size from chunk shape, matching Viv's internal logic.
 * Takes the y and x chunk dimensions and returns the previous power of 2
 * of the minimum.
 */
function guessTileSize(chunks: number[]): number {
  // chunks are in dimension order, y and x are the last two
  const yChunk = chunks[chunks.length - 2];
  const xChunk = chunks[chunks.length - 1];
  return prevPowerOf2(Math.min(yChunk, xChunk));
}

/**
 * Derive axis labels from OME-NGFF multiscales metadata.
 * Falls back to default labels based on array dimensionality.
 */
function getLabels(axes: MultiscaleMetadata['axes'], ndim: number): string[] {
  if (axes && axes.length > 0) {
    return axes.map((a) => a.name);
  }
  // Fallback: assume standard dimension order
  const defaults: Record<number, string[]> = {
    2: ['y', 'x'],
    3: ['c', 'y', 'x'],
    4: ['t', 'c', 'y', 'x'],
    5: ['t', 'c', 'z', 'y', 'x']
  };
  return defaults[ndim] ?? ['t', 'c', 'z', 'y', 'x'].slice(5 - ndim);
}

/**
 * Loads a local OME-NGFF (Zarr v2) directory from a zarr-compatible store.
 *
 * Replicates Viv's internal `loadMultiscales()` logic to produce the same
 * `{ data, metadata }` shape consumed by the rest of the app.
 */
export async function loadLocalOmeZarr(
  store: {
    getItem(key: string): Promise<ArrayBuffer>;
    containsItem(key: string): Promise<boolean>;
    setItem(key: string, value: ArrayBuffer): Promise<boolean>;
    deleteItem(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
  },
  path = '/'
) {
  // Open group at the given path and read attributes
  const grp = await openGroup(store as any, path, 'r');
  const rootAttrs = (await grp.attrs.asObject()) as {
    multiscales?: MultiscaleMetadata[];
    omero?: OmeroMetadata;
  };

  if (!rootAttrs.multiscales || rootAttrs.multiscales.length === 0) {
    throw new Error('No multiscales metadata found in .zattrs');
  }

  const multiscale = rootAttrs.multiscales[0];
  const { datasets, axes } = multiscale;

  // Normalize the base path (strip leading/trailing slashes)
  const basePath = path.replace(/^\/+|\/+$/g, '');

  // Open each pyramid level as a ZarrArray
  // Dataset paths are relative to the group, so we need to join with the base path
  const pyramidArrays = await Promise.all(
    datasets.map((ds) => {
      const fullPath = basePath ? `${basePath}/${ds.path}` : ds.path;
      return openArray({ store: store as any, path: fullPath, mode: 'r' });
    })
  );

  // Derive labels and tile size from the first (highest-res) level
  const firstArray = pyramidArrays[0];
  const labels = getLabels(axes, firstArray.shape.length);
  const tileSize = guessTileSize(firstArray.chunks as number[]);

  // Build ZarrPixelSource for each pyramid level
  const data = pyramidArrays.map((arr: ZarrArray) => new ZarrPixelSource(arr as any, labels as any, tileSize));

  // Normalize omero metadata to match the shape expected by the app
  // (same format as loadOmeZarr in src/legacy/utils.js:218-225)
  const omero = rootAttrs.omero;
  const channels = omero?.channels ?? [];

  const metadata = {
    Pixels: {
      Channels: channels.map((c) => ({
        Name: c.label,
        SamplesPerPixel: 1
      }))
    }
  };

  return { data, metadata };
}
