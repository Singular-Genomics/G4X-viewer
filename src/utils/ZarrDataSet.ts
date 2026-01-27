import { open, FetchStore, get } from 'zarrita';

/**
 * ZarrDataSet - manages Zarr structure URL formatting
 *
 * Structure: /{cells,images,transcripts,misc}
 * - images/multiplex: /images/multiplex/{level}
 * - images/h_and_e: /images/h_and_e/{level}
 * - cells: /cells/{area,cell_id,cluster_id,polygon_offsets,polygon_vertices_xy,protein_values,total_counts,total_genes}
 * - transcripts: /transcripts/tiles/p{z}/y{yy}/x{xx}/{cell_id,gene_name,position}
 * - run_metadata: stored in .zattrs at root level
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

  public getImagesPath(): string {
    return `${this.zarrURL}/images`;
  }

  public getMultiplexPath(): string {
    return `${this.zarrURL}/images/multiplex`;
  }

  public getMultiplexPyramidLevel(level: number): string {
    return `${this.getMultiplexPath()}/${level}`;
  }

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

  public getHAndEPath(): string {
    return `${this.zarrURL}/images/h_and_e`;
  }

  public getHAndEPyramidLevel(level: number): string {
    return `${this.getHAndEPath()}/${level}`;
  }

  public getRunMetadataPath(): string {
    return `${this.zarrURL}/.zattrs`;
  }

  public async fetchRunMetadata(): Promise<Record<string, any> | null> {
    try {
      const response = await fetch(this.getRunMetadataPath());
      if (!response.ok) {
        return null;
      }
      const zattrs = await response.json();
      // Extract run_metadata from .zattrs
      return zattrs.run_metadata || null;
    } catch (error) {
      console.error('Failed to fetch run metadata from .zattrs:', error);
      return null;
    }
  }

  public async detectLayerConfig(): Promise<{
    layer_width: number;
    layer_height: number;
    layers: number;
    tile_size: number;
  } | null> {
    try {
      const response = await fetch(`${this.zarrURL}/images/0/.zarray`);
      if (!response.ok) return null;

      const metadata = await response.json();
      const shape = metadata.shape;
      const chunks = metadata.chunks;

      const pyramidLevels = await this.detectPyramidLevels();

      return {
        layer_width: shape[shape.length - 1],
        layer_height: shape[shape.length - 2],
        layers: pyramidLevels.length > 0 ? pyramidLevels.length - 1 : 4,
        tile_size: chunks[chunks.length - 1]
      };
    } catch (error) {
      console.error('Failed to auto-detect layer config:', error);
      return null;
    }
  }

  private async detectPyramidLevels(): Promise<number[]> {
    const levels: number[] = [];
    for (let level = 0; level <= 10; level++) {
      const response = await fetch(`${this.zarrURL}/images/${level}/.zarray`, { method: 'HEAD' });
      if (response.ok) {
        levels.push(level);
      } else {
        break;
      }
    }
    return levels.length > 0 ? levels : [0, 1, 2, 3, 4];
  }

  public async getTranscriptTileData(z: number, y: number, x: number): Promise<any> {
    try {
      const zStr = `p${z}`;
      const yStr = `y${String(y).padStart(2, '0')}`;
      const xStr = `x${String(x).padStart(2, '0')}`;
      const basePath = `${this.zarrURL}/transcripts/tiles/${zStr}/${yStr}/${xStr}`;

      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        open(new FetchStore(`${basePath}/cell_id`), { kind: 'array' }).catch(() => null),
        open(new FetchStore(`${basePath}/gene_name`), { kind: 'array' }).catch(() => null),
        open(new FetchStore(`${basePath}/position`), { kind: 'array' }).catch(() => null)
      ]);

      if (!cellIdArray || !geneNameArray || !positionArray) {
        return { pointsData: [], numberOfPoints: 0 };
      }

      const [cellIdChunk, geneNameChunk, positionChunk] = await Promise.all([
        get(cellIdArray),
        get(geneNameArray),
        get(positionArray)
      ]);

      const cellIds = cellIdChunk.data as Int32Array;
      const geneNames = geneNameChunk.data as any;
      const positions = positionChunk.data as Int32Array;
      const numberOfPoints = cellIds.length;

      const pointsData = [];
      for (let i = 0; i < numberOfPoints; i++) {
        const geneName = geneNames.get ? geneNames.get(i) : String(geneNames[i]);
        pointsData.push({
          cellId: String(cellIds[i]),
          geneName: geneName,
          position: [positions[i * 2 + 1], positions[i * 2]]
        });
      }

      return {
        pointsData,
        numberOfPoints
      };
    } catch (error) {
      console.error(`Failed to fetch transcript tile data [z:${z}, y:${y}, x:${x}]:`, error);
      return null;
    }
  }

  public async fetchCellsData(): Promise<import('./ZarrCellsLoader').ZarrCellsData> {
    const { loadCellsFromZarr } = await import('./ZarrCellsLoader');
    return loadCellsFromZarr(this.zarrURL);
  }

  public async getCellsInRegion(_bounds: { minX: number; minY: number; maxX: number; maxY: number }): Promise<any> {
    throw new Error('Not implemented: getCellsInRegion');
  }
}
