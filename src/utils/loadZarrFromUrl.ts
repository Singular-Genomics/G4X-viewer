import { TFunction } from 'i18next';
import { FetchStore } from 'zarrita';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import type { SegmentationOption } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useViewerStore } from '../stores/ViewerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { ZarrDataSet } from './ZarrDataSet';
import type { ZarritaStoreFactory } from './ZarrDataSet.types';
import { applyUrlSettings } from './urlSettings';
import { IMAGE_URL_PARAM } from '../hooks/useCloudImageLoader.hook';

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

  const isAccessible = await zarrDataSet.isAccessible();
  if (!isAccessible) {
    return {
      successMessages: [],
      warningMessages: [],
      errorMessage: t('sourceFiles.zarrNotFound')
    };
  }

  const zarrDir = zarrDataSet.getZarrDirectoryName();
  const zarrMultiplexUrl = zarrDataSet.getMultiplexPath();
  const successMessages: string[] = [];
  const warningMessages: string[] = [];

  const [hasImagesData, hasTranscriptsData, hasSegmentationData] = await Promise.all([
    zarrDataSet.hasImagesData(),
    zarrDataSet.hasTranscriptsData(),
    zarrDataSet.hasSegmentationData()
  ]);

  if (!hasImagesData && !hasTranscriptsData && !hasSegmentationData) {
    return {
      successMessages: [],
      warningMessages: [],
      errorMessage: t('sourceFiles.zarrCorrupted')
    };
  }

  useZarrDataStore.getState().reset();
  useTranscriptLayerStore.getState().reset();
  useCellSegmentationLayerStore.getState().reset();
  useBrightfieldImagesStore.getState().reset();
  useViewerStore.setState({
    physicalSize: null,
    isTranscriptTilesLoading: false,
    viewState: null,
    isViewerLoading: undefined
  });

  const zarrStoreFactory: ZarritaStoreFactory = (subpath: string) =>
    new FetchStore(cloudImageUrl.replace(/\/$/, '') + '/' + subpath);

  useZarrDataStore.getState().setZarrUrl(cloudImageUrl);
  useZarrDataStore.getState().setFileName(zarrDir);
  useZarrDataStore.getState().setZarrStoreFactory(zarrStoreFactory);
  useZarrDataStore.setState({ zarrDataSet });

  useZarrDataStore.getState().setHasTranscriptsData(hasTranscriptsData);
  useZarrDataStore.getState().setHasSegmentationData(hasSegmentationData);

  if (!hasTranscriptsData) {
    warningMessages.push(t('sourceFiles.transcriptsLoadError'));
  }

  if (hasImagesData) {
    useViewerStore.setState({
      source: { urlOrFile: zarrMultiplexUrl, description: zarrDir }
    });
  } else {
    warningMessages.push(t('sourceFiles.imagesLoadError'));
  }

  const runMetadataResult = await zarrDataSet.fetchRunMetadata();
  if (runMetadataResult) {
    useViewerStore.getState().setGeneralDetails({
      fileName: zarrDir,
      data: runMetadataResult.metadata,
      smpInfoOrder: runMetadataResult.smpInfoOrder
    });
  }

  const hAndEUrl = zarrDataSet.getHAndEPath();
  useBrightfieldImagesStore.getState().addNewFile(hAndEUrl);

  if (hasImagesData) {
    const imageAxes = await zarrDataSet.fetchImageAxesMetadata();
    if (imageAxes) {
      useViewerStore.setState({
        physicalSize: { size: 1 / imageAxes.pixel_per_um, unit: imageAxes.unit }
      });
    }
  }

  if (hasSegmentationData) {
    try {
      const cellsSegmentations = await zarrDataSet.fetchCellsSegmentations();

      const availableSegmentations: SegmentationOption[] = cellsSegmentations.segmentationOrder
        .map((label) => ({ label, folderName: cellsSegmentations.segmentationSources[label] }))
        .filter((seg) => !!seg.folderName);

      if (availableSegmentations.length === 0) throw new Error('No segmentations found');

      useCellSegmentationLayerStore.setState({
        availableSegmentations,
        selectedSegmentationLabel: availableSegmentations[0].label,
        fileName: zarrDir
      });
    } catch {
      useZarrDataStore.getState().setHasSegmentationData(false);
      warningMessages.push(t('sourceFiles.segmentationMissingData'));
    }
  } else {
    warningMessages.push(t('sourceFiles.segmentationMissingData'));
  }

  // Apply after availableSegmentations is populated so useOnDemandDataLoader finds segmentation data immediately.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(IMAGE_URL_PARAM)) {
    applyUrlSettings(urlParams);
  }

  if (warningMessages.length === 0) {
    successMessages.push(t('sourceFiles.zarrSuccess', { filename: zarrDir }));
  }

  return {
    successMessages,
    warningMessages,
    errorMessage: null
  };
};
