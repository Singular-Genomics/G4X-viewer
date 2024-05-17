export type MetadataLayerStore = MetadataLayerStoreValues & MetadataLayerStoreMethods;

export type MetadataLayerStoreValues = {
  isMetadataLayerOn: boolean;
  pointSize: number;
}

export type MetadataLayerStoreMethods = {
  toggleMetadataLayer: () => void;
  setPointSize: (newPointSize: number) => void;
}