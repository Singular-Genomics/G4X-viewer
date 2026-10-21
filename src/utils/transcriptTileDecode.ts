import type { GeneRegistry } from './GeneRegistry';
import type { ZarrTranscriptTileData } from './ZarrDataSet.types';

/**
 * Pure decoders: raw zarr chunk data -> columnar tile (absolute Float32 positions, uint16 gene index, int32 cell id).
 *
 * Positions are stored absolute (tile origin already added). Float32 is exact for integers < 2^24 (16.7M px) and
 * layer coordinates are far below that; it is also what deck.gl uploads to the GPU anyway.
 */

export const emptyTile = (): ZarrTranscriptTileData => ({
  length: 0,
  positions: new Float32Array(0),
  geneIndex: new Uint16Array(0),
  cellId: new Int32Array(0)
});

// 4.0 data backwards compatible
/** zarrita's UnicodeStringArray (`<U{chars}`): a view over a UCS-4 buffer, `chars` code points per element. */
type UnicodeStringArrayLike = { buffer: ArrayBufferLike; byteOffset: number; length: number; chars: number };

// 4.0 data backwards compatible
export function decodeLegacyTile(
  position: Int32Array,
  geneName: UnicodeStringArrayLike,
  cellId: Int32Array,
  registry: GeneRegistry
): ZarrTranscriptTileData {
  const length = cellId.length;
  const positions = new Float32Array(length * 2);
  for (let i = 0; i < length * 2; i++) positions[i] = position[i];
  // Read the raw UCS-4 buffer directly instead of materialising a JS string per point via .get(i)
  const codes = new Int32Array(geneName.buffer, geneName.byteOffset, geneName.length * geneName.chars);
  const geneIndex = registry.mapCodes(codes, geneName.chars, length);
  return { length, positions, geneIndex, cellId };
}

export function decodeSplitTile(
  position: Uint16Array,
  geneIndex: Uint16Array,
  cellId: Int32Array,
  origin: { x: number; y: number }
): ZarrTranscriptTileData {
  const length = cellId.length;
  const positions = new Float32Array(length * 2);
  for (let i = 0; i < length; i++) {
    positions[2 * i] = position[2 * i] + origin.x;
    positions[2 * i + 1] = position[2 * i + 1] + origin.y;
  }
  return {
    length,
    positions,
    geneIndex,
    cellId
  };
}
