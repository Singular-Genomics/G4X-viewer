import { Blosc } from 'numcodecs';

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

  // ==================== TODO: Future Implementation ====================

  // TODO: Fetch actual Zarr array data with chunking and decompression
  public async fetchArrayData(_path: string): Promise<any> {
    throw new Error('Not implemented: fetchArrayData');
  }

  // TODO: Get cells data for a specific region/ROI
  public async getCellsInRegion(_bounds: { minX: number; minY: number; maxX: number; maxY: number }): Promise<any> {
    throw new Error('Not implemented: getCellsInRegion');
  }

  // Fetch transcript tile data (cell_id, gene_name, position) from Zarr - pure fetch implementation
  public async getTranscriptTileData(z: number, y: number, x: number): Promise<any> {
    try {
      // Construct paths
      const zStr = `p${z}`;
      const yStr = `y${String(y).padStart(2, '0')}`;
      const xStr = `x${String(x).padStart(2, '0')}`;
      const basePath = `${this.zarrURL}/transcripts/tiles/${zStr}/${yStr}/${xStr}`;

      // Check if tile exists first to avoid console errors for missing tiles
      // Use a HEAD request or quick metadata check
      const cellIdMetaResp = await fetch(`${basePath}/cell_id/.zarray`);
      if (!cellIdMetaResp.ok) {
        // Tile doesn't exist - return empty data silently
        return { pointsData: [], numberOfPoints: 0 };
      }

      const cellIdMeta = await cellIdMetaResp.json();
      const numberOfPoints = cellIdMeta.shape[0];

      // Fetch metadata for gene_name to check if chunk 1.0 exists
      const geneNameMetaResp = await fetch(`${basePath}/gene_name/.zarray`);
      const geneNameMeta = geneNameMetaResp.ok ? await geneNameMetaResp.json() : null;

      // Calculate if we need chunk 1.0 based on chunk size
      const needsChunk1 = geneNameMeta && numberOfPoints > geneNameMeta.chunks[0];

      // Fetch all required chunks in parallel (skip gene_name/1.0 if not needed)
      const fetchPromises = [
        fetch(`${basePath}/cell_id/0.0`),
        fetch(`${basePath}/gene_name/0.0`),
        fetch(`${basePath}/position/0.0`)
      ];

      if (needsChunk1) {
        fetchPromises.push(fetch(`${basePath}/gene_name/1.0`));
      }

      const responses = await Promise.all(fetchPromises);
      const [cellIdResponse, geneNameChunk0Response, positionResponse, geneNameChunk1Response] = responses;

      // Check if required chunks exist
      if (!cellIdResponse.ok || !geneNameChunk0Response.ok || !positionResponse.ok) {
        console.warn(`Missing required chunks for tile [z:${z}, y:${y}, x:${x}]`);
        return { pointsData: [], numberOfPoints: 0 };
      }

      // Fetch array buffers for required chunks
      const fetchBufferPromises = [
        cellIdResponse.arrayBuffer(),
        geneNameChunk0Response.arrayBuffer(),
        positionResponse.arrayBuffer()
      ];

      if (needsChunk1 && geneNameChunk1Response?.ok) {
        fetchBufferPromises.push(geneNameChunk1Response.arrayBuffer());
      }

      const buffers = await Promise.all(fetchBufferPromises);
      const [cellIdCompressed, geneNameChunk0Compressed, positionCompressed, geneNameChunk1Compressed] = buffers;

      // Decompress using blosc
      const blosc = Blosc.fromConfig({ id: 'blosc' });

      // Decompress required chunks
      const decompressPromises = [
        blosc.decode(new Uint8Array(cellIdCompressed)),
        blosc.decode(new Uint8Array(geneNameChunk0Compressed)),
        blosc.decode(new Uint8Array(positionCompressed))
      ];

      // Add chunk 1.0 decompression if it was fetched
      if (geneNameChunk1Compressed) {
        decompressPromises.push(blosc.decode(new Uint8Array(geneNameChunk1Compressed)));
      }

      const decompressedBuffers = await Promise.all(decompressPromises);
      const [cellIdBuffer, geneNameChunk0Buffer, positionBuffer, geneNameChunk1Buffer] = decompressedBuffers;

      // Concatenate gene_name chunks into single buffer
      const geneNameBuffer = geneNameChunk1Buffer
        ? (() => {
            const buffer = new Uint8Array(geneNameChunk0Buffer.byteLength + geneNameChunk1Buffer.byteLength);
            buffer.set(new Uint8Array(geneNameChunk0Buffer.buffer), 0);
            buffer.set(new Uint8Array(geneNameChunk1Buffer.buffer), geneNameChunk0Buffer.byteLength);
            return buffer;
          })()
        : new Uint8Array(geneNameChunk0Buffer.buffer);

      // Parse cell_id (int32 little-endian, shape [N, 1])
      const cellIdView = new Int32Array(cellIdBuffer.buffer);

      // Parse gene_name (Unicode strings <U10 = UCS-4/UTF-32, 4 bytes per char, 10 chars each)
      // Since TextDecoder doesn't support utf-32le in browsers, decode manually
      const bytesPerChar = 4;
      const charsPerString = 10;
      const bytesPerString = bytesPerChar * charsPerString;
      const geneNames: string[] = [];

      for (let i = 0; i < numberOfPoints; i++) {
        const byteOffset = i * bytesPerString;
        let geneName = '';

        // Read UTF-32LE manually: 4 bytes per character, little-endian
        for (let c = 0; c < charsPerString; c++) {
          const charOffset = byteOffset + c * 4;
          const codePoint =
            geneNameBuffer[charOffset] |
            (geneNameBuffer[charOffset + 1] << 8) |
            (geneNameBuffer[charOffset + 2] << 16) |
            (geneNameBuffer[charOffset + 3] << 24);

          // Stop at null terminator
          if (codePoint === 0) break;
          geneName += String.fromCodePoint(codePoint);
        }

        geneNames.push(geneName.trim());
      }

      // Parse position (int32 little-endian, shape [N, 2])
      const positionView = new Int32Array(positionBuffer.buffer);

      const pointsData = [];
      for (let i = 0; i < numberOfPoints; i++) {
        const y = positionView[i * 2];
        const x = positionView[i * 2 + 1];
        pointsData.push({
          cellId: String(cellIdView[i]),
          geneName: geneNames[i],
          position: [x, y]
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
}
