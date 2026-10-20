import { ZarrDataSet } from '../../utils/ZarrDataSet';
import { GeneRegistry } from '../../utils/GeneRegistry';
import { emptyTile } from '../../utils/transcriptTileDecode';
import type { ZarritaStoreFactory, ZarrTranscriptTileData } from '../../utils/ZarrDataSet.types';

export class ZarrTranscriptLoader {
  private zarrDataSet: ZarrDataSet;
  /** Resolves with the gene registry once layer_config / gene_order are loaded (null if the dataset has none) */
  readonly ready: Promise<GeneRegistry | null>;

  constructor(zarrUrl: string | undefined, storeFactory?: ZarritaStoreFactory) {
    this.zarrDataSet = new ZarrDataSet(zarrUrl ?? '', storeFactory);
    this.ready = this.zarrDataSet.getGeneRegistry().catch((error) => {
      console.error('Failed to initialise transcript metadata:', error);
      return null;
    });
  }

  async loadTileData(z: number, x: number, y: number): Promise<ZarrTranscriptTileData> {
    return (await this.zarrDataSet.getTranscriptTileData({ z, y, x })) ?? emptyTile();
  }
}
