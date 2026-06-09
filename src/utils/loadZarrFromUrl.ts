import { TFunction } from 'i18next';
import { FetchStore } from 'zarrita';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import type { SegmentationOption } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useViewerStore, VIEWER_LOADING_TYPES } from '../stores/ViewerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { ZarrDataSet } from './ZarrDataSet';
import { extractProteinNamesFromMetadata } from './ZarrCellsLoader';
import type { ZarritaStoreFactory } from './ZarrDataSet.types';
import { ZARR_SUBPATHS } from './ZarrPaths';

type LoadZarrFromUrlParams = {
  cloudImageUrl: string;
  t: TFunction;
};

type LoadZarrFromUrlResult = {
  successMessages: string[];
  warningMessages: string[];
  errorMessage: string | null;
};

export const loadZarrFromUrl = async ({ cloudImageUrl, t }: LoadZarrFromUrlParams): Promise<LoadZarrFromUrlResult> => {
  const zarrDataSet = new ZarrDataSet(cloudImageUrl);
  if (!zarrDataSet.isValid()) {
    return {
      successMessages: [],
      warningMessages: [],
      errorMessage: t('sourceFiles.zarrInvalidFile')
    };
  }

  const zarrDir = zarrDataSet.getZarrDirectoryName();
  const zarrMultiplexUrl = zarrDataSet.getMultiplexPath();
  const successMessages: string[] = [];
  const warningMessages: string[] = [];

  useZarrDataStore.getState().reset();
  useTranscriptLayerStore.getState().reset();
  useCellSegmentationLayerStore.getState().reset();
  useBrightfieldImagesStore.getState().reset();
  useViewerStore.setState({ physicalSize: null, isTranscriptTilesLoading: false, viewState: null });

  const zarrStoreFactory: ZarritaStoreFactory = (subpath: string) =>
    new FetchStore(cloudImageUrl.replace(/\/$/, '') + '/' + subpath);

  useZarrDataStore.getState().setZarrUrl(cloudImageUrl);
  useZarrDataStore.getState().setFileName(zarrDir);
  useZarrDataStore.getState().setZarrStoreFactory(zarrStoreFactory);
  useZarrDataStore.setState({ zarrDataSet });

  const [hasTranscriptsData, hasSegmentationData] = await Promise.all([
    zarrDataSet.hasTranscriptsData(),
    zarrDataSet.hasSegmentationData()
  ]);

  useZarrDataStore.getState().setHasTranscriptsData(hasTranscriptsData);

  if (hasTranscriptsData) {
    const layerConfig = await zarrDataSet.detectLayerConfig();
    if (layerConfig) {
      useZarrDataStore.getState().setLayerConfig(layerConfig);
    }

    const [transcriptColors, geneOrder] = await Promise.all([
      zarrDataSet.fetchTranscriptColors(),
      zarrDataSet.fetchTranscriptGeneOrder()
    ]);
    if (transcriptColors) {
      const colorMapEntries = Object.entries(transcriptColors).map(([gene_name, color]) => ({
        gene_name,
        color
      }));
      if (geneOrder) {
        const orderIndex = new Map(geneOrder.map((name, i) => [name, i]));
        colorMapEntries.sort(
          (a, b) => (orderIndex.get(a.gene_name) ?? Infinity) - (orderIndex.get(b.gene_name) ?? Infinity)
        );
      }
      useZarrDataStore.getState().setColormapConfig(colorMapEntries);
    }
  } else {
    warningMessages.push(t('sourceFiles.transcriptsLoadError'));
  }

  useViewerStore.setState({
    source: { urlOrFile: zarrMultiplexUrl, description: zarrDir }
  });

  const runMetadataResult = await zarrDataSet.fetchRunMetadata();
  if (runMetadataResult) {
    useViewerStore.getState().setGeneralDetails({
      fileName: ZARR_SUBPATHS.attrs.root,
      data: runMetadataResult.metadata,
      smpInfoOrder: runMetadataResult.smpInfoOrder
    });
  }

  const hAndEUrl = zarrDataSet.getHAndEPath();
  useBrightfieldImagesStore.getState().addNewFile(hAndEUrl);

  const imageAxes = await zarrDataSet.fetchImageAxesMetadata();
  if (imageAxes) {
    useViewerStore.setState({
      physicalSize: { size: 1 / imageAxes.pixel_per_um, unit: imageAxes.unit }
    });
  }

  if (hasSegmentationData) {
    useViewerStore.setState({
      isViewerLoading: {
        type: VIEWER_LOADING_TYPES.SEGMENTATION_PROCESSING,
        message: t('viewer.loadingSegmentationProcessing')
      }
    });
    try {
      const cellsSegmentations = await zarrDataSet.fetchCellsSegmentations();

      const availableSegmentations: SegmentationOption[] = cellsSegmentations.segmentationOrder
        .map((label) => ({ label, folderName: cellsSegmentations.segmentationSources[label] }))
        .filter((seg) => !!seg.folderName);

      const defaultSegmentation = availableSegmentations[0];
      const cellsData = await zarrDataSet.fetchCellsData(defaultSegmentation.folderName);

      let proteinNames = cellsData.metadata.proteinNames;
      if (proteinNames.length === 0 && runMetadataResult) {
        proteinNames = extractProteinNamesFromMetadata(runMetadataResult.metadata);
      }

      const hasUmapData = cellsData.cellMasks.some(
        (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
      );

      useCellSegmentationLayerStore.setState({
        cellMasksData: cellsData.cellMasks,
        cellColormapConfig: cellsData.colormap,
        fileName: zarrDir,
        umapDataAvailable: hasUmapData,
        segmentationMetadata: { ...cellsData.metadata, proteinNames },
        availableSegmentations,
        selectedSegmentationLabel: defaultSegmentation.label,
        availableClusterLabels: cellsData.clusterLabels,
        selectedClusterLabelKey: cellsData.clusterLabels[0].key
      });

      successMessages.push(
        t('sourceFiles.segmentationSuccess', {
          count: cellsData.cellMasks.length,
          filename: zarrDir
        })
      );
    } catch {
      warningMessages.push(t('sourceFiles.segmentationLoadError'));
    } finally {
      if (useViewerStore.getState().isViewerLoading?.type === VIEWER_LOADING_TYPES.SEGMENTATION_PROCESSING) {
        useViewerStore.setState({ isViewerLoading: undefined });
      }
    }
  } else {
    warningMessages.push(t('sourceFiles.segmentationMissingData'));
  }

  successMessages.push(t('sourceFiles.zarrSuccess', { filename: zarrDir }));

  return {
    successMessages,
    warningMessages,
    errorMessage: null
  };
};
