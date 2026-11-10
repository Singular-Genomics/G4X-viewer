import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useDirectSeqLayerStore } from '../stores/DirectSeqLayerStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { useViewerStore } from '../stores/ViewerStore';
import type { ColorMapEntry } from '../stores/ZarrDataStore';
import type { ZarrColorMapAttrs, ZarrTargetMetadata } from '../utils/ZarrDataSet.types';
import {
  applyCellFilterUrlSettings,
  applyCytometryFilterUrlSettings,
  applyTranscriptFilterUrlSettings
} from '../utils/urlSettings';
import { URL_KEYS } from '../utils/urlSettings.keys';

const sortByOrder = (entries: ColorMapEntry[], order: string[] | null): ColorMapEntry[] => {
  if (order) {
    const orderIndex = new Map(order.map((name, i) => [name, i]));
    entries.sort((a, b) => (orderIndex.get(a.gene_name) ?? Infinity) - (orderIndex.get(b.gene_name) ?? Infinity));
  }
  return entries;
};

const toColorMapEntries = (colors: Record<string, number[]>, order: string[] | null): ColorMapEntry[] =>
  sortByOrder(
    Object.entries(colors).map(([gene_name, color]) => ({ gene_name, color })),
    order
  );

// Every metadata field except `color` is kept, it drives the filter table columns
const toMetadataColorMapEntries = (
  metadata: Record<string, ZarrTargetMetadata>,
  order: string[] | null
): ColorMapEntry[] =>
  sortByOrder(
    Object.entries(metadata).map(([gene_name, { color, ...fields }]) => ({ gene_name, color, metadata: fields })),
    order
  );

// `metadata` fully replaces gene_colors / gene_order, the latter stay as a fallback for older datasets
const attrsToColorMapEntries = ({
  metadata,
  metadata_order,
  gene_colors,
  gene_order
}: ZarrColorMapAttrs): ColorMapEntry[] | null => {
  if (metadata) return toMetadataColorMapEntries(metadata, metadata_order ?? null);
  if (gene_colors) return toColorMapEntries(gene_colors, gene_order ?? null);
  return null;
};

export const useOnDemandDataLoader = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const isTranscriptLayerOn = useTranscriptLayerStore((s) => s.isTranscriptLayerOn);
  const isDirectSeqLayerOn = useDirectSeqLayerStore((s) => s.isTranscriptLayerOn);
  const isCellLayerOn = useCellSegmentationLayerStore((s) => s.isCellLayerOn);
  const availableSegmentations = useCellSegmentationLayerStore((s) => s.availableSegmentations);

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

          const colorMapEntries = attrsToColorMapEntries(await zarrDataSet.fetchColorMapAttrs());
          if (useZarrDataStore.getState().zarrDataSet !== zarrDataSet) return;

          if (colorMapEntries) {
            useZarrDataStore.getState().setLoadedColorMapConfig(colorMapEntries);
            useZarrDataStore.getState().setColormapConfig(colorMapEntries);
          }
        } else if (pendingTranscriptAttrs) {
          if (pendingTranscriptAttrs.layer_config) {
            useZarrDataStore.getState().setLayerConfig(pendingTranscriptAttrs.layer_config);
          }
          const colorMapEntries = attrsToColorMapEntries(pendingTranscriptAttrs);
          if (colorMapEntries) {
            useZarrDataStore.getState().setLoadedColorMapConfig(colorMapEntries);
            useZarrDataStore.getState().setColormapConfig(colorMapEntries);
          }
        }

        useZarrDataStore.getState().setTranscriptConfigLoaded(true);
        applyTranscriptFilterUrlSettings(new URLSearchParams(window.location.search));
      } catch {
        enqueueSnackbar(t('sourceFiles.transcriptsConfigLoadError'), { variant: 'error' });
        useTranscriptLayerStore.getState().reset();
      }
    };

    load();
  }, [isTranscriptLayerOn, enqueueSnackbar, t]);

  // Direct-Seq config, same flow as transcripts
  useEffect(() => {
    if (!isDirectSeqLayerOn) return;

    const { directSeq, zarrDataSet, setDirectSeqData } = useZarrDataStore.getState();

    if (!directSeq.hasData || directSeq.configLoaded) return;

    const load = async () => {
      try {
        if (zarrDataSet) {
          const layerConfig = await zarrDataSet.detectLayerConfig('directSeq');
          if (useZarrDataStore.getState().zarrDataSet !== zarrDataSet) return;

          const colorMapEntries = attrsToColorMapEntries(await zarrDataSet.fetchColorMapAttrs('directSeq'));
          if (useZarrDataStore.getState().zarrDataSet !== zarrDataSet) return;

          setDirectSeqData({
            ...(layerConfig && { layerConfig }),
            ...(colorMapEntries && { colorMapConfig: colorMapEntries })
          });
        }

        setDirectSeqData({ configLoaded: true });
      } catch {
        enqueueSnackbar(t('sourceFiles.directSeqConfigLoadError'), { variant: 'error' });
        useDirectSeqLayerStore.getState().reset();
      }
    };

    load();
  }, [isDirectSeqLayerOn, enqueueSnackbar, t]);

  useEffect(() => {
    if (!isCellLayerOn) return;
    if (availableSegmentations.length === 0) return;

    const { hasSegmentationData, zarrDataSet, zarrStoreFactory, fileName } = useZarrDataStore.getState();
    const { cellMasksData } = useCellSegmentationLayerStore.getState();

    if (!hasSegmentationData || cellMasksData !== null) return;

    const load = async () => {
      try {
        const defaultSegmentation = availableSegmentations[0];

        const generalDetails = useViewerStore.getState().generalDetails;
        // Share links can request a non-default cluster label
        const clusterLabelKey = new URLSearchParams(window.location.search).get(URL_KEYS.segClusterKey) ?? undefined;

        if (zarrDataSet) {
          const cellsData = await zarrDataSet.fetchCellsData(defaultSegmentation.folderName, clusterLabelKey);
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
            selectedClusterLabelKey: cellsData.selectedClusterLabelKey
          });
          applyCellFilterUrlSettings(new URLSearchParams(window.location.search));
          applyCytometryFilterUrlSettings(new URLSearchParams(window.location.search));
        } else if (zarrStoreFactory) {
          const { loadCellsFromStoreFactory, extractProteinNamesFromMetadata } =
            await import('../utils/ZarrCellsLoader');

          const cellsData = await loadCellsFromStoreFactory(
            zarrStoreFactory,
            defaultSegmentation.folderName,
            clusterLabelKey
          );
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
            selectedClusterLabelKey: cellsData.selectedClusterLabelKey
          });
          applyCellFilterUrlSettings(new URLSearchParams(window.location.search));
          applyCytometryFilterUrlSettings(new URLSearchParams(window.location.search));
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
      }
    };

    load();
  }, [isCellLayerOn, availableSegmentations, enqueueSnackbar, t]);
};
