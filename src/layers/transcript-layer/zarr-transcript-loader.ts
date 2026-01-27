import { ZarrDataSet } from '../../utils/ZarrDataSet';

export class ZarrTranscriptLoader {
  private zarrDataSet: ZarrDataSet;

  constructor(zarrUrl: string) {
    this.zarrDataSet = new ZarrDataSet(zarrUrl);
  }

  async loadTileData(z: number, x: number, y: number): Promise<any> {
    return await this.zarrDataSet.getTranscriptTileData(z, y, x);
  }

  isValid(): boolean {
    return this.zarrDataSet.isValid();
  }

  getBaseUrl(): string {
    return this.zarrDataSet.getBaseURL();
  }
}
