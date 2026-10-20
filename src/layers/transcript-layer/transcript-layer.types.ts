import { PickingInfo } from '@deck.gl/core';
import { ColorMapEntry, LayerConfig } from '../../stores/ZarrDataStore';
import { GeneNameFilterType } from '../../stores/TranscriptLayerStore';
import type { Texture } from '@luma.gl/core';
import type { ZarritaStoreFactory, ZarrTranscriptTileData } from '../../utils/ZarrDataSet.types';

export type SingleTileLayerProps = CompositeLayerProps & {
  layerData: LayerDataItem[];
  pointSize: number;
  showBoundries: boolean;
  showData: boolean;
  showDiscardedPoints: boolean;
  disabledTiledView: boolean;
  /** gene index -> name (shared registry; may grow while tiles load) */
  geneNames: readonly string[];
  /** 1 when the gene passes the active filter, indexed by gene index */
  geneVisible: Uint8Array;
  geneLookupTexture: Texture | null;
  geneLookupVersion: number;
};

export type LayerDataItem = {
  index: LayerDataIndex;
  textPosition: { x: number; y: number };
  points: ZarrTranscriptTileData;
  tileData: { width: number; height: number };
  boundingBox: number[];
};

export type TranscriptLayerProps = CompositeLayerProps & {
  zarrUrl?: string | null;
  zarrStoreFactory?: ZarritaStoreFactory;
  config: LayerConfig;
  geneFilters: GeneNameFilterType | 'all';
  pointSize: number;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  showDiscardedPoints: boolean;
  overrideLayers: boolean;
  maxVisibleLayers: number;
  colormap: ColorMapEntry[];
  onHover?: (pikingInfo: PickingInfo) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
};

export type getTileDataProps = {
  index: LayerDataIndex;
  bbox: any;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};

type LayerDataIndex = { x: number; y: number; z: number };
