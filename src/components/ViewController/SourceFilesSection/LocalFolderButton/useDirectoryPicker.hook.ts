import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useZarrDataStore } from '../../../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import type { ZarritaStoreFactory } from '../../../../utils/ZarrDataSet.types';
import type { SegmentationOption } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';

export const useDirectoryPicker = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const openDirectory = useCallback(async () => {
    let handle: FileSystemDirectoryHandle;
    try {
      handle = await window.showDirectoryPicker!();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      throw e;
    }

    const isValid = await hasZarrMarkerInHandle(handle);
    if (!isValid) {
      enqueueSnackbar(t('sourceFiles.folderInvalidDirectory'), { variant: 'error' });
      return;
    }

    // Reset dependent stores
    useZarrDataStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();
    useViewerStore.setState({ physicalSize: null });

    const { LocalFileStore, LocalFileHandleZarritaStore } = await import('../../../../loaders/LocalFileStore');
    const { LRUCacheStore } = await import('../../../../loaders/LRUCacheStore');

    const lruStore = new LRUCacheStore(new LocalFileStore(handle));

    // Create zarrita store factory for local files
    const zarrStoreFactory: ZarritaStoreFactory = (subpath: string) => new LocalFileHandleZarritaStore(handle, subpath);

    useZarrDataStore.getState().setFileName(handle.name);
    useZarrDataStore.getState().setZarrStoreFactory(zarrStoreFactory);

    // Load layer config from transcript .zattrs
    const transcriptAttrs = await readJsonFromHandle(handle, 'transcripts/.zattrs');
    if (transcriptAttrs?.layer_config) {
      useZarrDataStore.getState().setLayerConfig(transcriptAttrs.layer_config);
    }

    // Load transcript colors
    if (transcriptAttrs?.gene_colors) {
      const colorMapEntries = Object.entries(transcriptAttrs.gene_colors).map(([gene_name, color]) => ({
        gene_name,
        color: color as number[]
      }));
      useZarrDataStore.getState().setColormapConfig(colorMapEntries);
    }

    useZarrDataStore.getState().setHasTranscriptsData(!!transcriptAttrs?.layer_config);

    // Set the image source — createLoader will detect __localZarrStore
    useViewerStore.setState({
      source: {
        urlOrFile: lruStore as any,
        description: handle.name
      }
    });

    // Load run metadata from root .zattrs
    const rootAttrs = await readJsonFromHandle(handle, '.zattrs');
    if (rootAttrs?.run_metadata) {
      useViewerStore.getState().setGeneralDetails({
        fileName: '.zattrs',
        data: rootAttrs.run_metadata,
        smpInfoOrder: rootAttrs.smp_info_order ?? []
      });
    }

    // Load image axes metadata
    const imageAttrs = await readJsonFromHandle(handle, 'images/.zattrs');
    if (imageAttrs?.axes?.pixel_per_um) {
      useViewerStore.setState({
        physicalSize: {
          size: 1 / imageAttrs.axes.pixel_per_um,
          unit: imageAttrs.axes.unit ?? 'μm'
        }
      });
    }

    // Check for H&E brightfield image
    try {
      const imagesDir = await handle.getDirectoryHandle('images');
      await imagesDir.getDirectoryHandle('h_and_e');
      const heStore = new LRUCacheStore(new LocalFileStore(handle), 100, 'images/h_and_e');
      useBrightfieldImagesStore.getState().addNewFile({
        __localZarrImage: true,
        name: 'h_and_e',
        store: heStore
      });
    } catch {
      // No H&E directory — skip
    }

    // Load cells/segmentation data
    const successMessages: string[] = [];
    const warningMessages: string[] = [];

    try {
      const { loadCellsFromStoreFactory, extractProteinNamesFromMetadata } =
        await import('../../../../utils/ZarrCellsLoader');

      const cellsAttrs = await readJsonFromHandle(handle, 'cells/.zattrs');
      const segmentationOrder = (cellsAttrs?.segmentation_order ?? []) as string[];
      const segmentationSources = (cellsAttrs?.segmentation_sources ?? {}) as Record<string, string>;
      const availableSegmentations: SegmentationOption[] = segmentationOrder
        .map((label) => ({ label, folderName: segmentationSources[label] }))
        .filter((seg) => !!seg.folderName);

      if (availableSegmentations.length === 0) {
        throw new Error('No segmentations found in cells/.zattrs');
      }

      const defaultSegmentation = availableSegmentations[0];
      const cellsData = await loadCellsFromStoreFactory(zarrStoreFactory, defaultSegmentation.folderName);

      let proteinNames = cellsData.metadata.proteinNames;
      if (proteinNames.length === 0 && rootAttrs?.run_metadata) {
        proteinNames = extractProteinNamesFromMetadata(rootAttrs.run_metadata);
      }

      const hasUmapData = cellsData.cellMasks.some(
        (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
      );

      useCellSegmentationLayerStore.setState({
        cellMasksData: cellsData.cellMasks,
        cellColormapConfig: cellsData.colormap,
        fileName: handle.name,
        umapDataAvailable: hasUmapData,
        segmentationMetadata: {
          ...cellsData.metadata,
          proteinNames
        },
        availableSegmentations,
        selectedSegmentationLabel: defaultSegmentation.label,
        availableClusterLabels: cellsData.clusterLabels,
        selectedClusterLabelKey: cellsData.clusterLabels[0].key
      });

      successMessages.push(
        t('sourceFiles.segmentationSuccess', {
          count: cellsData.cellMasks.length,
          filename: handle.name
        })
      );
    } catch (e) {
      console.warn('Failed to load cell segmentation data:', e);
      warningMessages.push(t('sourceFiles.segmentationLoadError'));
    }

    successMessages.push(t('sourceFiles.zarrSuccess', { filename: handle.name }));

    if (successMessages.length > 0) {
      enqueueSnackbar(successMessages.join('; '), { variant: 'success' });
    }
    if (warningMessages.length > 0) {
      enqueueSnackbar(warningMessages.join('; '), { variant: 'warning' });
    }
  }, [enqueueSnackbar, t]);

  return { openDirectory };
};

async function readJsonFromHandle(
  handle: FileSystemDirectoryHandle,
  path: string
): Promise<Record<string, any> | null> {
  const parts = path.split('/').filter(Boolean);
  try {
    let dir = handle;
    for (const part of parts.slice(0, -1)) {
      dir = await dir.getDirectoryHandle(part);
    }
    const fileHandle = await dir.getFileHandle(parts[parts.length - 1]);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function hasZarrMarkerInHandle(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    await handle.getFileHandle('.zattrs');
    return true;
  } catch {
    // .zattrs not found, try .zgroup
  }
  try {
    await handle.getFileHandle('.zgroup');
    return true;
  } catch {
    return false;
  }
}
