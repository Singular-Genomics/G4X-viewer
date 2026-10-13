import { ZarrDataSet } from '../../utils/ZarrDataSet';
import type { ZarritaStoreFactory, ZarrTranscriptSource } from '../../utils/ZarrDataSet.types';

export class ZarrTranscriptLoader {
  private zarrDataSet: ZarrDataSet;
  private source: ZarrTranscriptSource;

  constructor(
    zarrUrl: string | undefined,
    storeFactory?: ZarritaStoreFactory,
    source: ZarrTranscriptSource = 'transcripts'
  ) {
    this.zarrDataSet = new ZarrDataSet(zarrUrl ?? '', storeFactory);
    this.source = source;
  }

  async loadTileData(z: number, x: number, y: number): Promise<any> {
    return await this.zarrDataSet.getTranscriptTileData({ z, y, x }, this.source);
  }
}
