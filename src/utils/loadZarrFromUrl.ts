import { TFunction } from 'i18next';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useViewerStore } from '../stores/ViewerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { ZarrDataSet } from './ZarrDataSet';

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
  useViewerStore.setState({ physicalSize: null, isTranscriptTilesLoading: false });

  useZarrDataStore.getState().setZarrUrl(cloudImageUrl);
  useZarrDataStore.getState().setFileName(zarrDir);

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

    const transcriptColors = await zarrDataSet.fetchTranscriptColors();
    if (transcriptColors) {
      const colorMapEntries = Object.entries(transcriptColors).map(([gene_name, color]) => ({
        gene_name,
        color
      }));
      useZarrDataStore.getState().setColormapConfig(colorMapEntries);
    }
  } else {
    warningMessages.push(t('sourceFiles.transcriptsLoadError'));
  }

  useViewerStore.setState({
    source: { urlOrFile: zarrMultiplexUrl, description: zarrDir }
  });

  const metadata = await zarrDataSet.fetchRunMetadata();
  if (metadata) {
    useViewerStore.getState().setGeneralDetails({
      fileName: '.zattrs',
      data: metadata
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
    try {
      const cellsData = await zarrDataSet.fetchCellsData();

      let proteinNames = cellsData.metadata.proteinNames;
      if (proteinNames.length === 0 && metadata) {
        try {
          const { extractProteinNamesFromMetadata } = await import('./ZarrCellsLoader');
          proteinNames = extractProteinNamesFromMetadata(metadata);
        } catch {
          warningMessages.push(t('sourceFiles.proteinNamesExtractionError'));
        }
      }

      const hasUmapData = cellsData.cellMasks.some(
        (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
      );

      useCellSegmentationLayerStore.setState({
        cellMasksData: cellsData.cellMasks,
        cellColormapConfig: cellsData.colormap,
        fileName: zarrDir,
        umapDataAvailable: hasUmapData,
        segmentationMetadata: {
          ...cellsData.metadata,
          proteinNames
        }
      });

      successMessages.push(
        t('sourceFiles.segmentationSuccess', {
          count: cellsData.cellMasks.length,
          filename: zarrDir
        })
      );
    } catch {
      warningMessages.push(t('sourceFiles.segmentationLoadError'));
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
