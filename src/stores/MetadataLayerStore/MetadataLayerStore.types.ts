export type MetadataLayerStore = MetadataLayerStoreValues & MetadataLayerStoreMethods;

export type MetadataLayerStoreValues = {
  isMetadataLayerOn: boolean;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  pointSize: number;
}

export type MetadataLayerStoreMethods = {
  toggleMetadataLayer: () => void;
  toggleTileBoundries: () => void;
  toggleTileData: () => void;
  setPointSize: (newPointSize: number) => void;
}