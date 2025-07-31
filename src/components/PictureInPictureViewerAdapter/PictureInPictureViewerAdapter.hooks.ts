import { useShallow } from 'zustand/react/shallow';
import { DETAIL_VIEW_ID, MultiscaleImageLayer } from '@hms-dbmi/viv';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { getVivId } from '../../utils/utils';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import CellMasksLayer from '../../layers/cell-masks-layer/cell-masks-layer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTooltipStore } from '../../stores/TooltipStore';
import TranscriptLayer from '../../layers/transcript-layer/transcript-layer';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { EditableGeoJsonLayer } from '@deck.gl-community/editable-layers';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { usePolygonDetectionWorker } from './worker/usePolygonDetectionWorker';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useCellFilteringWorker } from '../../layers/cell-masks-layer';
import { SingleMask, PointData } from '../../shared/types';
import { useSnackbar } from 'notistack';

const cleanupDuplicatePoints = (points: PointData[]): PointData[] => {
  if (!points || points.length <= 1) return points || [];

  const seen = new Set<string>();

  return points.filter((point) => {
    if (!point || !point.position || point.position.length < 2) {
      return false;
    }

    const key = point.position[0] + ',' + point.position[1];

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

export const useResizableContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  }, [containerRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('onControllerToggle', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('onControllerToggle', handleResize);
    };
  }, [handleResize]);

  return {
    containerRef,
    containerSize
  };
};

export const useTranscriptLayer = () => {
  const [files, layerConfig] = useBinaryFilesStore(useShallow((store) => [store.files, store.layerConfig]));

  const [
    isTranscriptLayerOn,
    pointSize,
    showTilesBoundries,
    showTilesData,
    geneNameFilters,
    isGeneNameFilterActive,
    showFilteredPoints,
    overrideLayers,
    maxVisibleLayers,
    selectedPoints
  ] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isTranscriptLayerOn,
      store.pointSize,
      store.showTilesBoundries,
      store.showTilesData,
      store.geneNameFilters,
      store.isGeneNameFilterActive,
      store.showFilteredPoints,
      store.overrideLayers,
      store.maxVisibleLayers,
      store.selectedPoints
    ])
  );

  if (!files.length) {
    return undefined;
  }

  const metadataLayer = new TranscriptLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-transcript-layer`,
    files,
    config: layerConfig,
    visible: !!files.length && isTranscriptLayerOn,
    geneFilters: isGeneNameFilterActive ? geneNameFilters : 'all',
    pointSize,
    showTilesBoundries,
    showTilesData,
    showDiscardedPoints: showFilteredPoints,
    overrideLayers: overrideLayers,
    maxVisibleLayers: maxVisibleLayers,
    selectedPoints,
    onHover: (pickingInfo) =>
      useTooltipStore.setState({
        position: { x: pickingInfo.x, y: pickingInfo.y },
        object: pickingInfo.object,
        type: 'Transcript'
      })
  });

  return metadataLayer;
};

export const useCellSegmentationLayer = () => {
  const [
    cellMasksData,
    isCellLayerOn,
    isCellFillOn,
    isCellNameFilterOn,
    cellFillOpacity,
    showFilteredCells,
    cellNameFilters,
    selectedCells
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.cellMasksData,
      store.isCellLayerOn,
      store.isCellFillOn,
      store.isCellNameFilterOn,
      store.cellFillOpacity,
      store.showFilteredCells,
      store.cellNameFilters,
      store.selectedCells
    ])
  );

  const { proteinNames, ranges } = useCytometryGraphStore();
  const { ranges: umapRange } = useUmapGraphStore();
  const { filterCells } = useCellFilteringWorker();

  const [filteredCells, setFilteredCells] = useState<{
    selectedCellsData: SingleMask[];
    unselectedCellsData: SingleMask[];
    outlierCellsData: SingleMask[];
  }>({ selectedCellsData: [], unselectedCellsData: [], outlierCellsData: [] });

  useEffect(() => {
    if (!cellMasksData) {
      setFilteredCells({
        selectedCellsData: [],
        unselectedCellsData: [],
        outlierCellsData: []
      });
      return;
    }

    const selectedCellIds = selectedCells.map((cell: SingleMask) => cell.cellId);

    filterCells(
      cellMasksData,
      selectedCellIds,
      isCellNameFilterOn ? cellNameFilters : 'all',
      ranges && proteinNames.xAxis && proteinNames.yAxis
        ? {
            proteins: proteinNames,
            range: ranges
          }
        : undefined,
      umapRange
    )
      .then((result) => {
        setFilteredCells(result);
      })
      .catch((error) => {
        console.error('Cell filtering error:', error);
        setFilteredCells({
          selectedCellsData: [],
          unselectedCellsData: cellMasksData,
          outlierCellsData: []
        });
      });
  }, [cellMasksData, selectedCells, isCellNameFilterOn, cellNameFilters, ranges, proteinNames, umapRange, filterCells]);

  if (!cellMasksData) {
    return undefined;
  }

  const cellMasksLayer = new CellMasksLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-cell-masks-layer`,
    masksData: cellMasksData || new Uint8Array(),
    visible: !!cellMasksData && isCellLayerOn,
    showCellFill: isCellFillOn,
    showDiscardedPoints: showFilteredCells,
    cellNameFilters: isCellNameFilterOn ? cellNameFilters : 'all',
    cellCytometryFilter: {
      proteins: proteinNames,
      range: ranges
    },
    umapFilter: umapRange,
    cellFillOpacity,
    selectedCells,
    preFilteredSelectedCells: filteredCells.selectedCellsData,
    preFilteredUnselectedCells: filteredCells.unselectedCellsData,
    preFilteredOutlierCells: filteredCells.outlierCellsData,
    onHover: (pickingInfo) =>
      useTooltipStore.setState({
        position: { x: pickingInfo.x, y: pickingInfo.y },
        object: pickingInfo.object,
        type: 'CellMask'
      })
  });

  return cellMasksLayer;
};

export const useBrightfieldImageLayer = () => {
  const [selections, contrastLimits, opacity, isLayerVisible, getLoader] = useBrightfieldImagesStore(
    useShallow((store) => [
      store.selections,
      store.contrastLimits,
      store.opacity,
      store.isLayerVisible,
      store.getLoader
    ])
  );

  const loader = getLoader();

  if (!loader || !loader[0] || !loader[0].shape) {
    return undefined;
  }

  const { dtype } = loader[0];

  const brightfieldImageLayer = new MultiscaleImageLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-h&e-image-layer`,
    channelsVisible: [true, true, true],
    selections: selections as any,
    contrastLimits: contrastLimits as any,
    loader: loader as any,
    dtype: dtype,
    opacity: isLayerVisible ? opacity : 0,
    ...({
      pickable: false
    } as any)
  });

  return brightfieldImageLayer;
};

export const usePolygonDrawingLayer = () => {
  const [isPolygonDrawingEnabled, polygonFeatures, mode, updatePolygonFeatures, isDetecting, setDetecting] =
    usePolygonDrawingStore(
      useShallow((store) => [
        store.isPolygonDrawingEnabled,
        store.polygonFeatures,
        store.mode,
        store.updatePolygonFeatures,
        store.isDetecting,
        store.setDetecting
      ])
    );

  const [files] = useBinaryFilesStore(useShallow((store) => [store.files]));
  const [selectedPoints, setSelectedPoints] = useTranscriptLayerStore(
    useShallow((store) => [store.selectedPoints, store.setSelectedPoints])
  );

  const [cellMasksData] = useCellSegmentationLayerStore(useShallow((store) => [store.cellMasksData]));
  const [selectedCells, setSelectedCells] = useCellSegmentationLayerStore(
    useShallow((store) => [store.selectedCells, store.setSelectedCells])
  );

  const { detectPointsInPolygon, detectCellPolygonsInPolygon } = usePolygonDetectionWorker();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  if (!isPolygonDrawingEnabled) {
    return undefined;
  }

  const featureCollection = {
    type: 'FeatureCollection' as const,
    features: polygonFeatures
  };

  const onEdit = async ({ updatedData, editType }: any) => {
    updatePolygonFeatures(updatedData.features);

    if (editType === 'addFeature') {
      const newFeatureIndex = updatedData.features.length - 1;
      const newPolygon = updatedData.features[newFeatureIndex];

      // Start detection
      setDetecting(true);

      const loadingSnackbarId = enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'info',
        message: 'Detecting elements in polygon...',
        persist: true,
        autoHideDuration: 10000
      });

      if (files.length > 0) {
        try {
          const result = await detectPointsInPolygon(newPolygon, files);

          // Update polygon properties
          newPolygon.properties = {
            ...newPolygon.properties,
            pointCount: result.pointCount,
            geneDistribution: result.geneDistribution
          };

          const combinedSelectedPoints = [...selectedPoints, ...result.pointsInPolygon];
          const uniqueCombinedPoints = cleanupDuplicatePoints(combinedSelectedPoints);
          setSelectedPoints(uniqueCombinedPoints);
          updatePolygonFeatures(updatedData.features);
        } catch (error) {
          console.error('Error detecting points in polygon:', error);
        }
      }

      if (cellMasksData) {
        try {
          const result = await detectCellPolygonsInPolygon(newPolygon, cellMasksData);

          // Update polygon properties
          newPolygon.properties = {
            ...newPolygon.properties,
            cellPolygonCount: result.cellPolygonCount,
            cellClusterDistribution: result.cellClusterDistribution
          };

          const combinedSelectedCells = [...selectedCells, ...result.cellPolygonsInDrawnPolygon];
          setSelectedCells(combinedSelectedCells);
        } catch (error) {
          console.error('Error detecting cell polygons in polygon:', error);
        }
      }

      setDetecting(false);
      closeSnackbar(loadingSnackbarId);
    } else if (editType === 'selectFeature') {
      // All features always selected
    } else if (editType === 'removeFeature') {
      setSelectedPoints([]);
      setSelectedCells([]);
    } else if (editType === 'finishMovePosition') {
      // Re-run detection on all polygons
      const allPolygons = updatedData.features;

      if (!allPolygons || allPolygons.length === 0) {
        console.warn('No polygons to process');
        return;
      }

      // Start detection
      setDetecting(true);

      const loadingSnackbarId = enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'info',
        message: 'Updating polygon selection...',
        persist: true,
        autoHideDuration: 10000
      });

      // Reset selections
      setSelectedPoints([]);
      setSelectedCells([]);

      if (files.length > 0) {
        try {
          let allPointsInPolygons: PointData[] = [];

          for (const polygon of allPolygons) {
            const result = await detectPointsInPolygon(polygon, files);

            // Update polygon properties
            polygon.properties = {
              ...polygon.properties,
              pointCount: result.pointCount,
              geneDistribution: result.geneDistribution
            };

            allPointsInPolygons = [...allPointsInPolygons, ...result.pointsInPolygon];
          }

          const uniquePoints = cleanupDuplicatePoints(allPointsInPolygons);
          setSelectedPoints(uniquePoints);
          updatePolygonFeatures(updatedData.features);
        } catch (error) {
          console.error('Error detecting points in polygons:', error);
        }
      }

      if (cellMasksData) {
        try {
          let allCellsInPolygons: SingleMask[] = [];

          for (const polygon of allPolygons) {
            const result = await detectCellPolygonsInPolygon(polygon, cellMasksData);

            // Update polygon properties
            polygon.properties = {
              ...polygon.properties,
              cellPolygonCount: result.cellPolygonCount,
              cellClusterDistribution: result.cellClusterDistribution
            };

            allCellsInPolygons = [...allCellsInPolygons, ...result.cellPolygonsInDrawnPolygon];
          }

          setSelectedCells(allCellsInPolygons);
        } catch (error) {
          console.error('Error detecting cell polygons in polygons:', error);
        }
      }

      setDetecting(false);
      closeSnackbar(loadingSnackbarId);
    }
  };

  const polygonLayer = new EditableGeoJsonLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-polygon-drawing-layer`,
    data: featureCollection,
    mode: isDetecting ? undefined : mode,
    selectedFeatureIndexes: polygonFeatures.map((_, index) => index),
    onEdit,
    pickable: !isDetecting,
    autoHighlight: true,
    getFillColor: isDetecting ? [255, 255, 0, 100] : [0, 200, 0, 100],
    getLineColor: isDetecting ? [255, 255, 0, 200] : [0, 200, 0, 200],
    lineWidthMinPixels: 2,
    pointRadiusMinPixels: 5,
    editHandlePointRadiusMinPixels: 5,
    editHandlePointRadiusScale: 20,
    getEditHandlePointColor: (handle: any) => {
      if (handle.type === 'intermediate') {
        return [0, 0, 255, 255];
      }
      return [200, 0, 0, 255];
    }
  });

  return polygonLayer;
};
