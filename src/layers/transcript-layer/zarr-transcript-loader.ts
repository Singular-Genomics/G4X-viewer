import { ZarrDataSet } from '../../utils/ZarrDataSet';

/**
 * Loads transcript tile data from Zarr dataset
 * Compatible with deck.gl TileLayer getTileData interface
 */
export class ZarrTranscriptLoader {
  private zarrDataSet: ZarrDataSet;

  constructor(zarrUrl: string) {
    this.zarrDataSet = new ZarrDataSet(zarrUrl);
  }

  /**
   * Load transcript tile data for a specific tile coordinate
   * @param z - Pyramid level (zoom level)
   * @param x - Tile X coordinate
   * @param y - Tile Y coordinate
   * @returns Promise resolving to tile data with pointsData and numberOfPoints
   */
  async loadTileData(z: number, x: number, y: number): Promise<any> {
    // deck.gl provides (z, x, y) but Zarr structure is p{z}/y{y}/x{x}
    // so we pass (z, y, x) to match the Zarr path structure
    return await this.zarrDataSet.getTranscriptTileData(z, y, x);
  }

  /**
   * Check if this loader is valid and can load data
   */
  isValid(): boolean {
    return this.zarrDataSet.isValid();
  }

  /**
   * Get the base URL of the Zarr dataset
   */
  getBaseUrl(): string {
    return this.zarrDataSet.getBaseURL();
  }
}
