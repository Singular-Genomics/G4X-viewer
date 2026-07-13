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
import { ZARR_SUBPATHS } from '../../../../utils/ZarrPaths';

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

    const transcriptAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.transcripts);
    useZarrDataStore.getState().setPendingTranscriptAttrs(transcriptAttrs);
    useZarrDataStore.getState().setHasTranscriptsData(!!transcriptAttrs?.layer_config);

    // Set the image source — createLoader will detect __localZarrStore
    useViewerStore.setState({
      source: {
        urlOrFile: lruStore as any,
        description: handle.name
      }
    });

    // Load run metadata from root .zattrs
    const rootAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.root);
    if (rootAttrs?.run_metadata) {
      useViewerStore.getState().setGeneralDetails({
        fileName: handle.name,
        data: rootAttrs.run_metadata,
        smpInfoOrder: rootAttrs.smp_info_order ?? []
      });
    }

    // Load image axes metadata
    const imageAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.images);
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

    const cellsAttrs = await readJsonFromHandle(handle, ZARR_SUBPATHS.attrs.cells);
    const segmentationOrder = (cellsAttrs?.segmentation_order ?? []) as string[];
    const segmentationSources = (cellsAttrs?.segmentation_sources ?? {}) as Record<string, string>;
    const availableSegmentations: SegmentationOption[] = segmentationOrder
      .map((label) => ({ label, folderName: segmentationSources[label] }))
      .filter((seg) => !!seg.folderName);

    const hasSegmentationData = availableSegmentations.length > 0;
    useZarrDataStore.getState().setHasSegmentationData(hasSegmentationData);

    if (hasSegmentationData) {
      useCellSegmentationLayerStore.setState({
        availableSegmentations,
        selectedSegmentationLabel: availableSegmentations[0].label,
        fileName: handle.name
      });
    }

    enqueueSnackbar(t('sourceFiles.zarrSuccess', { filename: handle.name }), { variant: 'success' });
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
