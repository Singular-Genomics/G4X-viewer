import { useRef, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useZarrDataStore } from '../../../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import type { ZarritaStoreFactory } from '../../../../utils/ZarrDataSet.types';

const hasNativePicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

export const useDirectoryPicker = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      // Validate: check for .zattrs or .zgroup among the files
      const fileNames = Array.from(files).map((f) => f.webkitRelativePath || f.name);
      const hasZarrMarker = fileNames.some((name) => {
        const parts = name.split('/');
        return parts.length === 2 && (parts[1] === '.zattrs' || parts[1] === '.zgroup');
      });

      if (!hasZarrMarker) {
        enqueueSnackbar(t('sourceFiles.folderInvalidDirectory'), { variant: 'error' });
        return;
      }

      // Build a virtual file map keyed by relative path (strip the root folder prefix)
      const rootPrefix = files[0].webkitRelativePath.split('/')[0];
      const fileMap = new Map<string, File>();
      for (const file of Array.from(files)) {
        const relativePath = file.webkitRelativePath.replace(`${rootPrefix}/`, '');
        fileMap.set(relativePath, file);
      }

      const { LocalFileMapStore, LocalFileMapZarritaStore } = await import('../../../../loaders/LocalFileStore');
      const { LRUCacheStore } = await import('../../../../loaders/LRUCacheStore');

      const store = new LRUCacheStore(new LocalFileMapStore(fileMap));

      // Create zarrita store factory for local files
      const zarrStoreFactory: ZarritaStoreFactory = (subpath: string) => new LocalFileMapZarritaStore(fileMap, subpath);

      // Reset dependent stores (mirrors ZarrCloudUploadButton)
      useZarrDataStore.getState().reset();
      useTranscriptLayerStore.getState().reset();
      useCellSegmentationLayerStore.getState().reset();
      useBrightfieldImagesStore.getState().reset();
      useViewerStore.setState({ physicalSize: null });

      useZarrDataStore.getState().setFileName(rootPrefix);
      useZarrDataStore.getState().setZarrStoreFactory(zarrStoreFactory);

      // Load layer config from transcript .zattrs
      const transcriptAttrs = await readJsonFile(fileMap, 'transcripts/.zattrs');
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

      // Set the image source — createLoader will detect __localZarrStore
      useViewerStore.setState({
        source: {
          urlOrFile: store as any,
          description: rootPrefix
        }
      });

      // Load run metadata from root .zattrs
      const rootAttrs = await readJsonFile(fileMap, '.zattrs');
      if (rootAttrs?.run_metadata) {
        useViewerStore.getState().setGeneralDetails({
          fileName: '.zattrs',
          data: rootAttrs.run_metadata
        });
      }

      // Load image axes metadata
      const imageAttrs = await readJsonFile(fileMap, 'images/.zattrs');
      if (imageAttrs?.axes?.pixel_per_um) {
        useViewerStore.setState({
          physicalSize: {
            size: 1 / imageAttrs.axes.pixel_per_um,
            unit: imageAttrs.axes.unit ?? 'μm'
          }
        });
      }

      // Load cells/segmentation data
      const successMessages: string[] = [];
      const warningMessages: string[] = [];

      try {
        const { loadCellsFromZarr, extractProteinNamesFromMetadata } =
          await import('../../../../utils/ZarrCellsLoader');

        const cellsData = await loadCellsFromZarr(zarrStoreFactory);

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
          fileName: rootPrefix,
          umapDataAvailable: hasUmapData,
          segmentationMetadata: {
            ...cellsData.metadata,
            proteinNames
          }
        });

        successMessages.push(
          t('sourceFiles.segmentationSuccess', {
            count: cellsData.cellMasks.length,
            filename: rootPrefix
          })
        );
      } catch (e) {
        console.warn('Failed to load cell segmentation data:', e);
        warningMessages.push(t('sourceFiles.segmentationLoadError'));
      }

      successMessages.push(t('sourceFiles.zarrSuccess', { filename: rootPrefix }));

      if (successMessages.length > 0) {
        enqueueSnackbar(successMessages.join('; '), { variant: 'success' });
      }
      if (warningMessages.length > 0) {
        enqueueSnackbar(warningMessages.join('; '), { variant: 'warning' });
      }
    },
    [enqueueSnackbar, t]
  );

  const openDirectory = useCallback(async () => {
    if (hasNativePicker) {
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

      useZarrDataStore.getState().reset();
      useTranscriptLayerStore.getState().reset();
      useCellSegmentationLayerStore.getState().reset();
      useBrightfieldImagesStore.getState().reset();
      useViewerStore.setState({ physicalSize: null });

      useViewerStore.setState({
        source: {
          urlOrFile: handle,
          description: handle.name
        }
      });

      enqueueSnackbar(t('sourceFiles.folderSuccess', { name: handle.name }), {
        variant: 'success'
      });
    } else {
      // Fallback: trigger hidden directory input
      inputRef.current?.click();
    }
  }, [enqueueSnackbar, t]);

  return { inputRef, openDirectory, handleFiles };
};

async function readJsonFile(fileMap: Map<string, File>, path: string): Promise<Record<string, any> | null> {
  const file = fileMap.get(path);
  if (!file) return null;
  try {
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
