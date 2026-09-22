import { useCallback, useRef, useState } from 'react';
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

const stripImagesBase = (subpath: string) =>
  subpath.startsWith(`${ZARR_SUBPATHS.images.base}/`) ? subpath.slice(ZARR_SUBPATHS.images.base.length + 1) : subpath;

export const useDirectoryPicker = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { showConsolidatedMessages } = useConsolidatedSnackbar();
  const pendingRootHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const pendingWarningsRef = useRef<string[]>([]);
  const [needsImagesAccess, setNeedsImagesAccess] = useState(false);

  const showLoadMessages = useCallback(
    (filename: string, warningMessages: string[]) => {
      if (warningMessages.length === 0) {
        showConsolidatedMessages(
          [t('sourceFiles.zarrSuccess', { filename })],
          'success',
          'sourceFiles.zarrLoadComplete'
        );
      }
      showConsolidatedMessages(warningMessages, 'warning', 'sourceFiles.zarrLoadWarnings');
    },
    [showConsolidatedMessages, t]
  );

  const finalizeImages = useCallback(
    async (rootHandle: FileSystemDirectoryHandle, imagesHandle: FileSystemDirectoryHandle) => {
      const { LocalFileHandleZarritaStore } = await import('../../../../loaders/LocalFileStore');
      const { LRUCacheStore } = await import('../../../../loaders/LRUCacheStore');

      const overrides = { [ZARR_SUBPATHS.images.base]: imagesHandle };

      const lruStore = new LRUCacheStore(
        new LocalFileHandleZarritaStore(rootHandle, ZARR_SUBPATHS.images.multiplex(), overrides)
      );

      // Set the image source — createLoader will detect __localZarrStore
      useViewerStore.setState({
        source: {
          urlOrFile: lruStore as any,
          description: rootHandle.name
        }
      });

      // Load image axes metadata
      const imageAttrs = await readJsonFromHandle(imagesHandle, stripImagesBase(ZARR_SUBPATHS.attrs.images));
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
        await getDirectoryAt(imagesHandle, stripImagesBase(ZARR_SUBPATHS.images.h_and_e()));
        const heStore = new LRUCacheStore(
          new LocalFileHandleZarritaStore(rootHandle, ZARR_SUBPATHS.images.h_and_e(), overrides)
        );
        useBrightfieldImagesStore.getState().addNewFile({
          __localZarrImage: true,
          name: 'h_and_e',
          store: heStore
        });
      } catch {
        // No H&E directory — skip
      }
    },
    []
  );

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

    // `images` may be a symlink, which the File System Access API cannot
    // traverse — ask the user to grant access to it separately.
    let imagesHandle: FileSystemDirectoryHandle | null = null;
    try {
      imagesHandle = await handle.getDirectoryHandle(ZARR_SUBPATHS.images.base);
    } catch {
      imagesHandle = null;
    }
    const mayHaveSymlinkedImages = !imagesHandle;

    if (!hasImagesData && !mayHaveSymlinkedImages && !hasTranscriptsData && !hasSegmentationData) {
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
    pendingRootHandleRef.current = null;
    pendingWarningsRef.current = [];
    setNeedsImagesAccess(false);

    const { LocalFileHandleZarritaStore } = await import('../../../../loaders/LocalFileStore');

    // Create zarrita store factory for local files
    const zarrStoreFactory: ZarritaStoreFactory = (subpath: string) => new LocalFileHandleZarritaStore(handle, subpath);

    const zarrDataSet = new ZarrDataSet('', zarrStoreFactory);

    useZarrDataStore.getState().setFileName(handle.name);
    useZarrDataStore.getState().setZarrStoreFactory(zarrStoreFactory);
    useZarrDataStore.setState({ zarrDataSet });
    useZarrDataStore.getState().setPendingTranscriptAttrs(transcriptAttrs);
    useZarrDataStore.getState().setHasTranscriptsData(hasTranscriptsData);
    useZarrDataStore.getState().setHasSegmentationData(hasSegmentationData);

    const warningMessages: string[] = [];

    if (!hasTranscriptsData) {
      warningMessages.push(t('sourceFiles.transcriptsLoadError'));
    }

    // Load run metadata from root .zattrs
    if (rootAttrs?.run_metadata) {
      useViewerStore.getState().setGeneralDetails({
        fileName: handle.name,
        data: rootAttrs.run_metadata,
        smpInfoOrder: rootAttrs.smp_info_order ?? []
      });
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

    if (imagesHandle) {
      if (hasImagesData) {
        await finalizeImages(handle, imagesHandle);
      } else {
        warningMessages.push(t('sourceFiles.imagesLoadError'));
      }
      showLoadMessages(handle.name, warningMessages);
    } else {
      // Defer load messages until the user grants (or declines) images access
      pendingRootHandleRef.current = handle;
      pendingWarningsRef.current = warningMessages;
      setNeedsImagesAccess(true);
    }
  }, [enqueueSnackbar, t, finalizeImages, showLoadMessages]);

  const selectImagesFolder = useCallback(async () => {
    const rootHandle = pendingRootHandleRef.current;
    if (!rootHandle) return;

    let picked: FileSystemDirectoryHandle;
    try {
      picked = await window.showDirectoryPicker!();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      throw e;
    }

    const imagesHandle = await resolveImagesHandle(picked);
    if (!imagesHandle) {
      enqueueSnackbar(t('sourceFiles.folderImagesInvalid'), { variant: 'error' });
      return;
    }

    const warningMessages = pendingWarningsRef.current;
    setNeedsImagesAccess(false);
    pendingRootHandleRef.current = null;
    pendingWarningsRef.current = [];
    await finalizeImages(rootHandle, imagesHandle);
    showLoadMessages(rootHandle.name, warningMessages);
  }, [enqueueSnackbar, t, finalizeImages, showLoadMessages]);

  const cancelImagesAccess = useCallback(() => {
    const rootHandle = pendingRootHandleRef.current;
    const warningMessages = [...pendingWarningsRef.current, t('sourceFiles.imagesLoadError')];
    setNeedsImagesAccess(false);
    pendingRootHandleRef.current = null;
    pendingWarningsRef.current = [];
    if (rootHandle) {
      showLoadMessages(rootHandle.name, warningMessages);
    }
  }, [showLoadMessages, t]);

  return { openDirectory, needsImagesAccess, selectImagesFolder, cancelImagesAccess };
};

async function hasDirectory(handle: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try {
    await handle.getDirectoryHandle(name);
    return true;
  } catch {
    return false;
  }
}

async function resolveImagesHandle(picked: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle | null> {
  if ((await hasDirectory(picked, 'multiplex')) || (await hasDirectory(picked, 'h_and_e'))) {
    return picked;
  }
  try {
    return await picked.getDirectoryHandle(ZARR_SUBPATHS.images.base);
  } catch {
    return null;
  }
}

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
