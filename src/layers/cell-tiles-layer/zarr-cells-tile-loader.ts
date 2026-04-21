import { ZarrDataSet } from '../../utils/ZarrDataSet';
import type { ZarrCellTileData } from '../../utils/ZarrDataSet.types';

export class ZarrCellsTileLoader {
  private zarrDataSet: ZarrDataSet;

  constructor(zarrUrl: string) {
    this.zarrDataSet = new ZarrDataSet(zarrUrl);
  }

  async loadTileData(
    folder: string,
    x: number,
    y: number,
    clusterLabelIndex: number
  ): Promise<ZarrCellTileData | null> {
    return await this.zarrDataSet.getCellTileData({ folder, y, x }, clusterLabelIndex);
  }

  isValid(): boolean {
    return this.zarrDataSet.isValid();
  }

  getBaseUrl(): string {
    return this.zarrDataSet.getBaseURL();
  }
}
