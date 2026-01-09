/**
 * ZarrDataSet - manages Zarr structure URL formatting
 *
 * Structure: /{cells,images,transcripts,h_and_e,run_metadata.json}
 * - images: /images/p{level}
 * - h_and_e: /h_and_e/p{level}
 * - cells: /cells/{area,cell_id,cluster_id,polygon_offsets,polygon_vertices_xy,protein_values,total_counts,total_genes}
 * - transcripts: /transcripts/tiles/p{z}/y{yy}/x{xx}/{cell_id,gene_name,position}
 * - run_metadata.json: /run_metadata.json
 */
export class ZarrDataSet {
  private zarrURL: string;

  constructor(zarrUrl: string) {
    this.zarrURL = zarrUrl.endsWith('/') ? zarrUrl.slice(0, -1) : zarrUrl;
  }

  public getBaseURL(): string {
    return this.zarrURL;
  }

  public isValid(): boolean {
    return this.zarrURL.includes('.zarr');
  }

  public getZarrDirectoryName(): string {
    const urlParts = this.zarrURL.split('/');
    const zarrDir = urlParts.find((part) => part.endsWith('.zarr'));
    return zarrDir || '';
  }

  // ==================== IMAGES ====================

  public getImagesPath(): string {
    return `${this.zarrURL}/images`;
  }

  public getImagePyramidLevel(level: number): string {
    return `${this.getImagesPath()}/p${level}`;
  }

  // ==================== CELLS ====================

  public getCellsPath(): string {
    return `${this.zarrURL}/cells`;
  }

  public getCellsAreaPath(): string {
    return `${this.getCellsPath()}/area`;
  }

  public getCellsIdPath(): string {
    return `${this.getCellsPath()}/cell_id`;
  }

  public getCellsClusterIdPath(): string {
    return `${this.getCellsPath()}/cluster_id`;
  }

  public getCellsPolygonOffsetsPath(): string {
    return `${this.getCellsPath()}/polygon_offsets`;
  }

  public getCellsPolygonVerticesPath(): string {
    return `${this.getCellsPath()}/polygon_vertices_xy`;
  }

  public getCellsProteinValuesPath(): string {
    return `${this.getCellsPath()}/protein_values`;
  }

  public getCellsTotalCountsPath(): string {
    return `${this.getCellsPath()}/total_counts`;
  }

  public getCellsTotalGenesPath(): string {
    return `${this.getCellsPath()}/total_genes`;
  }

  // ==================== TRANSCRIPTS ====================

  public getTranscriptsPath(): string {
    return `${this.zarrURL}/transcripts`;
  }

  public getTranscriptsTilesPath(): string {
    return `${this.getTranscriptsPath()}/tiles`;
  }

  public getTranscriptTile(z: number, y: number, x: number): string {
    const zStr = `p${z}`;
    const yStr = `y${String(y).padStart(2, '0')}`;
    const xStr = `x${String(x).padStart(2, '0')}`;
    return `${this.getTranscriptsTilesPath()}/${zStr}/${yStr}/${xStr}`;
  }

  public getTranscriptTileCellId(z: number, y: number, x: number): string {
    return `${this.getTranscriptTile(z, y, x)}/cell_id`;
  }

  public getTranscriptTileGeneName(z: number, y: number, x: number): string {
    return `${this.getTranscriptTile(z, y, x)}/gene_name`;
  }

  public getTranscriptTilePosition(z: number, y: number, x: number): string {
    return `${this.getTranscriptTile(z, y, x)}/position`;
  }

  // ==================== H&E (Hematoxylin and Eosin) ====================

  public getHAndEPath(): string {
    return `${this.zarrURL}/h_and_e`;
  }

  public getHAndEPyramidLevel(level: number): string {
    return `${this.getHAndEPath()}/p${level}`;
  }

  // ==================== METADATA ====================

  public getRunMetadataPath(): string {
    return `${this.zarrURL}/run_metadata.json`;
  }

  public async fetchRunMetadata(): Promise<Record<string, any> | null> {
    try {
      const response = await fetch(this.getRunMetadataPath());
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch run_metadata.json:', error);
      return null;
    }
  }

  // ==================== TODO: Future Implementation ====================

  // TODO: Determine available pyramid levels
  public async getAvailablePyramidLevels(): Promise<number[]> {
    throw new Error('Not implemented: getAvailablePyramidLevels');
  }

  // TODO: Get transcript tile bounds/extent for a pyramid level
  public async getTranscriptTileBounds(_z: number): Promise<{ maxX: number; maxY: number }> {
    throw new Error('Not implemented: getTranscriptTileBounds');
  }

  // TODO: Fetch actual Zarr array data with chunking and decompression
  public async fetchArrayData(_path: string): Promise<any> {
    throw new Error('Not implemented: fetchArrayData');
  }

  // TODO: Get cells data for a specific region/ROI
  public async getCellsInRegion(_bounds: { minX: number; minY: number; maxX: number; maxY: number }): Promise<any> {
    throw new Error('Not implemented: getCellsInRegion');
  }

  // TODO: Get transcript tile data (cell_id, gene_name, position)
  public async getTranscriptTileData(_z: number, _y: number, _x: number): Promise<any> {
    throw new Error('Not implemented: getTranscriptTileData');
  }
}
