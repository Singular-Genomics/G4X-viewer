// Single source of truth for URL share param keys
export const URL_KEYS = {
  // Layer visibility
  channelsVisible: 'ch',
  heVisible: 'he',
  transcriptOn: 'tr',
  cellOn: 'seg',
  // View
  overview: 'ov',
  globalT: 'gt',
  globalZ: 'gz',
  camera: 'cam',
  polygonVisible: 'pol',
  polygonOpacity: 'poa',
  // Transcript
  transcriptGeneFilterActive: 'tr_gf',
  transcriptShowFiltered: 'tr_sf',
  transcriptPointSize: 'tr_ps',
  transcriptOverrideLayers: 'tr_ol',
  transcriptMaxLayers: 'tr_ml',
  transcriptFilterIndices: 'tr_fi',
  transcriptFilterColors: 'tr_fc',
  // UMAP
  umapRanges: 'umap_r',
  umapPointSize: 'umap_ps',
  umapSubsampling: 'umap_ss',
  // Cytometry
  cytoGraphMode: 'cyto_gm',
  cytoPointSize: 'cyto_ps',
  cytoSubsampling: 'cyto_ss',
  cytoBinCountX: 'cyto_bx',
  cytoBinCountY: 'cyto_by',
  cytoAxisType: 'cyto_at',
  cytoExponentFormat: 'cyto_ef',
  cytoColorscale: 'cyto_cs',
  cytoColorscaleReversed: 'cyto_cr',
  cytoLowerThreshold: 'cyto_tl',
  cytoUpperThreshold: 'cyto_tu',
  cytoAxes: 'cyto_xy',
  cytoRanges: 'cyto_r',
  // Cell segmentation
  segFillOpacity: 'seg_fo',
  segShowBoundary: 'seg_sb',
  segBoundaryWidth: 'seg_bw',
  segCellFilterOn: 'seg_cf',
  segClusterKey: 'seg_ck',
  segFilterIndices: 'seg_fi',
  segFilterColors: 'seg_fc',
  segShowFiltered: 'seg_sf',
  // Brightfield
  heOpacity: 'he_op',
  heImage: 'he_img',
  // Channels
  channelCount: 'ch_n',
  colormap: 'cm',
  lensOn: 'ln',
  lensSelection: 'ls',
  channelVisibility: 'ch_v',
  channelColors: 'ch_c',
  channelContrast: 'ch_cl',
  channelSelections: 'ch_s',
  soloChannel: 'ch_si'
} as const;

// Prefixes for feature-availability gating
export const URL_KEY_PREFIXES = {
  transcript: 'tr_',
  umap: 'umap_',
  cytometry: 'cyto_',
  segmentation: 'seg_'
} as const;
