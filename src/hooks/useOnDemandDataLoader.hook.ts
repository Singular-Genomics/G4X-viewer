import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { useViewerStore, VIEWER_LOADING_TYPES } from '../stores/ViewerStore';

export const useOnDemandDataLoader = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const isTranscriptLayerOn = useTranscriptLayerStore((s) => s.isTranscriptLayerOn);
  const isCellLayerOn = useCellSegmentationLayerStore((s) => s.isCellLayerOn);

  useEffect(() => {
    if (!isTranscriptLayerOn) return;

    const { hasTranscriptsData, transcriptConfigLoaded, zarrDataSet, pendingTranscriptAttrs } =
      useZarrDataStore.getState();

    if (!hasTranscriptsData || transcriptConfigLoaded) return;

    const load = async () => {
      try {
        if (zarrDataSet) {
          const layerConfig = await zarrDataSet.detectLayerConfig();
          if (useZarrDataStore.getState().zarrDataSet !== zarrDataSet) return;

          if (layerConfig) {
            useZarrDataStore.getState().setLayerConfig(layerConfig);
          }

          const [transcriptColors, geneOrder] = await Promise.all([
            zarrDataSet.fetchTranscriptColors(),
            zarrDataSet.fetchTranscriptGeneOrder()
          ]);
          if (useZarrDataStore.getState().zarrDataSet !== zarrDataSet) return;

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
        } else if (pendingTranscriptAttrs) {
          if (pendingTranscriptAttrs.layer_config) {
            useZarrDataStore.getState().setLayerConfig(pendingTranscriptAttrs.layer_config);
          }
          if (pendingTranscriptAttrs.gene_colors) {
            const colorMapEntries = Object.entries(pendingTranscriptAttrs.gene_colors).map(([gene_name, color]) => ({
              gene_name,
              color: color as number[]
            }));
            useZarrDataStore.getState().setColormapConfig(colorMapEntries);
          }
        }

        useZarrDataStore.getState().setTranscriptConfigLoaded(true);
      } catch {
        enqueueSnackbar(t('sourceFiles.transcriptsLoadError'), { variant: 'error' });
        useTranscriptLayerStore.getState().reset();
      }
    };

    load();
  }, [isTranscriptLayerOn, enqueueSnackbar, t]);

  useEffect(() => {
    if (!isCellLayerOn) return;

    const { hasSegmentationData, zarrDataSet, zarrStoreFactory, fileName } = useZarrDataStore.getState();
    const { cellMasksData, availableSegmentations } = useCellSegmentationLayerStore.getState();

    if (!hasSegmentationData || cellMasksData !== null) return;

    const load = async () => {
      useViewerStore.setState({
        isViewerLoading: {
          type: VIEWER_LOADING_TYPES.SEGMENTATION_PROCESSING,
          message: t('viewer.loadingSegmentationProcessing')
        }
      });

      try {
        const defaultSegmentation = availableSegmentations[0];
        if (!defaultSegmentation) throw new Error('No segmentation available');

        const generalDetails = useViewerStore.getState().generalDetails;

        if (zarrDataSet) {
          const cellsData = await zarrDataSet.fetchCellsData(defaultSegmentation.folderName);
          if (useZarrDataStore.getState().zarrDataSet !== zarrDataSet) return;

          let proteinNames = cellsData.metadata.proteinNames;
          if (proteinNames.length === 0 && generalDetails?.data) {
            const { extractProteinNamesFromMetadata } = await import('../utils/ZarrCellsLoader');
            proteinNames = extractProteinNamesFromMetadata(generalDetails.data);
          }

          const hasUmapData = cellsData.cellMasks.some(
            (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
          );

          useCellSegmentationLayerStore.setState({
            cellMasksData: cellsData.cellMasks,
            cellColormapConfig: cellsData.colormap,
            umapDataAvailable: hasUmapData,
            segmentationMetadata: { ...cellsData.metadata, proteinNames },
            availableClusterLabels: cellsData.clusterLabels,
            selectedClusterLabelKey: cellsData.clusterLabels[0].key
          });
        } else if (zarrStoreFactory) {
          const { loadCellsFromStoreFactory, extractProteinNamesFromMetadata } =
            await import('../utils/ZarrCellsLoader');

          const cellsData = await loadCellsFromStoreFactory(zarrStoreFactory, defaultSegmentation.folderName);
          if (useZarrDataStore.getState().zarrStoreFactory !== zarrStoreFactory) return;

          let proteinNames = cellsData.metadata.proteinNames;
          if (proteinNames.length === 0 && generalDetails?.data) {
            proteinNames = extractProteinNamesFromMetadata(generalDetails.data);
          }

          const hasUmapData = cellsData.cellMasks.some(
            (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
          );

          useCellSegmentationLayerStore.setState({
            cellMasksData: cellsData.cellMasks,
            cellColormapConfig: cellsData.colormap,
            fileName,
            umapDataAvailable: hasUmapData,
            segmentationMetadata: { ...cellsData.metadata, proteinNames },
            availableClusterLabels: cellsData.clusterLabels,
            selectedClusterLabelKey: cellsData.clusterLabels[0].key
          });
        }

        enqueueSnackbar(
          t('sourceFiles.segmentationSuccess', {
            count: useCellSegmentationLayerStore.getState().cellMasksData?.length ?? 0,
            filename: fileName
          }),
          { variant: 'success' }
        );
      } catch {
        enqueueSnackbar(t('sourceFiles.segmentationLoadError'), { variant: 'error' });
        useCellSegmentationLayerStore.getState().toggleCellLayer();
      } finally {
        if (useViewerStore.getState().isViewerLoading?.type === VIEWER_LOADING_TYPES.SEGMENTATION_PROCESSING) {
          useViewerStore.setState({ isViewerLoading: undefined });
        }
      }
    };

    load();
  }, [isCellLayerOn, enqueueSnackbar, t]);
};
