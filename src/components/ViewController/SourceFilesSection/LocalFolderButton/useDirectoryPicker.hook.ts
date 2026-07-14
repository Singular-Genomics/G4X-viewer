import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useConsolidatedSnackbar } from '../../../../hooks/useConsolidatedSnackbar.hook.tsx';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useZarrDataStore } from '../../../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { ZarrDataSet } from '../../../../utils/ZarrDataSet';
import type { ZarritaStoreFactory } from '../../../../utils/ZarrDataSet.types';
import type { SegmentationOption } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { ZARR_SUBPATHS } from '../../../../utils/ZarrPaths';

export const useDirectoryPicker = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { showConsolidatedMessages } = useConsolidatedSnackbar();

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

    const transcriptAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.transcripts);
    const rootAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.root);
    const imageAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.images);
    const cellsAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.cells);

    const segmentationOrder = (cellsAttrs?.segmentation_order ?? []) as string[];
    const segmentationSources = (cellsAttrs?.segmentation_sources ?? {}) as Record<string, string>;
    const availableSegmentations: SegmentationOption[] = segmentationOrder
      .map((label) => ({ label, folderName: segmentationSources[label] }))
      .filter((seg) => !!seg.folderName);

    const hasImagesData = imageAttrs !== null;
    const hasTranscriptsData = !!transcriptAttrs?.layer_config;
    const hasSegmentationData = availableSegmentations.length > 0;

    if (!hasImagesData && !hasTranscriptsData && !hasSegmentationData) {
      enqueueSnackbar(t('sourceFiles.zarrCorrupted'), { variant: 'error' });
      return;
    }

    // Reset dependent stores
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

    const { LocalFileStore, LocalFileHandleZarritaStore } = await import('../../../../loaders/LocalFileStore');
    const { LRUCacheStore } = await import('../../../../loaders/LRUCacheStore');

    // Create zarrita store factory for local files
    const zarrStoreFactory: ZarritaStoreFactory = (subpath: string) => new LocalFileHandleZarritaStore(handle, subpath);

    const zarrDataSet = new ZarrDataSet('', zarrStoreFactory);

    useZarrDataStore.getState().setFileName(handle.name);
    useZarrDataStore.getState().setZarrStoreFactory(zarrStoreFactory);
    useZarrDataStore.setState({ zarrDataSet });
    useZarrDataStore.getState().setPendingTranscriptAttrs(transcriptAttrs);
    useZarrDataStore.getState().setHasTranscriptsData(hasTranscriptsData);
    useZarrDataStore.getState().setHasSegmentationData(hasSegmentationData);

    const successMessages: string[] = [];
    const warningMessages: string[] = [];

    // Set the image source — createLoader will detect __localZarrStore
    if (hasImagesData) {
      const lruStore = new LRUCacheStore(new LocalFileStore(handle));
      useViewerStore.setState({
        source: {
          urlOrFile: lruStore as any,
          description: handle.name
        }
      });
    } else {
      warningMessages.push(t('sourceFiles.imagesLoadError'));
    }

    if (!hasTranscriptsData) {
      warningMessages.push(t('sourceFiles.transcriptsLoadError'));
    }

    // Load run metadata from root .zattrs
    if (rootAttrs?.run_metadata) {
      useViewerStore.getState().setGeneralDetails({
        fileName: ZARR_SUBPATHS.attrs.root,
        data: rootAttrs.run_metadata,
        smpInfoOrder: rootAttrs.smp_info_order ?? []
      });
    }

    // Load image axes metadata
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
      await getDirectoryAt(handle, ZARR_SUBPATHS.images.h_and_e());
      const heStore = new LRUCacheStore(new LocalFileStore(handle), 100, ZARR_SUBPATHS.images.h_and_e());
      useBrightfieldImagesStore.getState().addNewFile({
        __localZarrImage: true,
        name: 'h_and_e',
        store: heStore
      });
    } catch {
      // No H&E directory — skip
    }

    if (hasSegmentationData) {
      useCellSegmentationLayerStore.setState({
        availableSegmentations,
        selectedSegmentationLabel: availableSegmentations[0].label,
        fileName: handle.name
      });
    } else {
      warningMessages.push(t('sourceFiles.segmentationMissingData'));
    }

    if (warningMessages.length === 0) {
      successMessages.push(t('sourceFiles.zarrSuccess', { filename: handle.name }));
      showConsolidatedMessages(successMessages, 'success', 'sourceFiles.zarrLoadComplete');
    }
    showConsolidatedMessages(warningMessages, 'warning', 'sourceFiles.zarrLoadWarnings');
  }, [enqueueSnackbar, showConsolidatedMessages, t]);

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

async function getDirectoryAt(handle: FileSystemDirectoryHandle, subpath: string): Promise<FileSystemDirectoryHandle> {
  const parts = subpath.split('/').filter(Boolean);
  let dir = handle;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part);
  }
  return dir;
}

async function hasZarrMarkerInHandle(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    await handle.getFileHandle(ZARR_SUBPATHS.attrs.root);
    return true;
  } catch {
    // .zattrs not found, try .zgroup
  }
  try {
    await handle.getFileHandle(ZARR_SUBPATHS.attrs.group);
    return true;
  } catch {
    return false;
  }
}
