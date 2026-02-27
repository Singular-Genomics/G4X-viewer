import { ZarrDataSet } from '../../utils/ZarrDataSet';
import type { ZarritaStoreFactory } from '../../utils/ZarrDataSet.types';

export class ZarrTranscriptLoader {
  private zarrDataSet: ZarrDataSet;

  constructor(zarrUrl: string | undefined, storeFactory?: ZarritaStoreFactory) {
    this.zarrDataSet = new ZarrDataSet(zarrUrl ?? '', storeFactory);
  }

  async loadTileData(z: number, x: number, y: number): Promise<any> {
    return await this.zarrDataSet.getTranscriptTileData({ z, y, x });
  }

  isValid(): boolean {
    return this.zarrDataSet.isValid();
  }

  getBaseUrl(): string {
    return this.zarrDataSet.getBaseURL();
  }
}
