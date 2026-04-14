import { useShallow } from 'zustand/react/shallow';
import { DETAIL_VIEW_ID, MultiscaleImageLayer } from '@hms-dbmi/viv';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { getVivId } from '../../utils/utils';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import CellMasksLayer from '../../layers/cell-masks-layer/cell-masks-layer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTooltipStore } from '../../stores/TooltipStore';
import TranscriptLayer from '../../layers/transcript-layer/transcript-layer';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { EditableGeoJsonLayer, ViewMode } from '@deck.gl-community/editable-layers';
import { TextLayer } from '@deck.gl/layers';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { usePolygonDetectionWorker } from './worker/usePolygonDetectionWorker';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { SingleMask } from '../../shared/types';
import { useSnackbar } from 'notistack';
import { generatePolygonColor } from '../../utils/utils';
import {
  checkPolygonSelfIntersections,
  findEditedPolygon
} from '../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';
import { useTranslation } from 'react-i18next';
import { List, ListItem } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore';
import { MAX_TRANSCRIPT_POINTS_LIMIT } from '../../shared/constants';

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
  const [layerConfig, colorMapConfig, zarrUrl, hasTranscriptsData] = useZarrDataStore(
    useShallow((store) => [store.layerConfig, store.colorMapConfig, store.zarrUrl, store.hasTranscriptsData])
  );

  const [
    isTranscriptLayerOn,
    pointSize,
    showTilesBoundries,
    showTilesData,
    geneNameFilters,
    isGeneNameFilterActive,
    showFilteredPoints,
    overrideLayers,
    maxVisibleLayers
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
      store.maxVisibleLayers
    ])
  );

  if (!hasTranscriptsData) {
    return undefined;
  }

  const metadataLayer = new TranscriptLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-transcript-layer`,
    zarrUrl: zarrUrl!,
    config: layerConfig,
    visible: isTranscriptLayerOn,
    geneFilters: isGeneNameFilterActive ? geneNameFilters : 'all',
    pointSize,
    showTilesBoundries,
    showTilesData,
    showDiscardedPoints: showFilteredPoints,
    overrideLayers: overrideLayers,
    maxVisibleLayers: maxVisibleLayers,
    colormap: colorMapConfig,
    onLoadingStateChange: (isLoading) => useViewerStore.getState().setIsTranscriptTilesLoading(isLoading),
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
    isCellNameFilterOn,
    cellFillOpacity,
    showBoundary,
    boundaryWidth,
    showFilteredCells,
    cellNameFilters,
    cellColormapConfig
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.cellMasksData,
      store.isCellLayerOn,
      store.isCellNameFilterOn,
      store.cellFillOpacity,
      store.showBoundary,
      store.boundaryWidth,
      store.showFilteredCells,
      store.cellNameFilters,
      store.cellColormapConfig
    ])
  );

  const { proteinIndices, ranges } = useCytometryGraphStore();
  const { ranges: umapRange } = useUmapGraphStore();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [filteredCells, setFilteredCells] = useState<{
    unselectedCellsData: SingleMask[];
    outlierCellsData: SingleMask[];
  }>({ unselectedCellsData: [], outlierCellsData: [] });

  useEffect(() => {
    if (!cellMasksData) {
      setFilteredCells({
        unselectedCellsData: [],
        outlierCellsData: []
      });
      return;
    }

    try {
      const nameFilters = isCellNameFilterOn ? cellNameFilters : 'all';
      let unselectedCellsData = cellMasksData;
      let outlierCellsData: SingleMask[] = [];

      if (nameFilters !== 'all' && nameFilters.length > 0) {
        const selected: SingleMask[] = [];
        const outliers: SingleMask[] = [];
        for (const cell of cellMasksData) {
          if (nameFilters.includes(cell.clusterId)) {
            selected.push(cell);
          } else {
            outliers.push(cell);
          }
        }
        unselectedCellsData = selected;
        outlierCellsData = outliers;
      }

      if (ranges && proteinIndices.xAxisIndex > 0 && proteinIndices.yAxisIndex > 0) {
        unselectedCellsData = unselectedCellsData.filter(
          (cell) =>
            cell.proteinValues[proteinIndices.xAxisIndex] <= ranges.xEnd &&
            cell.proteinValues[proteinIndices.xAxisIndex] >= ranges.xStart &&
            cell.proteinValues[proteinIndices.yAxisIndex] >= ranges.yEnd &&
            cell.proteinValues[proteinIndices.yAxisIndex] <= ranges.yStart
        );
      }

      if (umapRange) {
        unselectedCellsData = unselectedCellsData.filter(
          (cell) =>
            cell.umapValues.umapX >= umapRange.xStart &&
            cell.umapValues.umapX <= umapRange.xEnd &&
            cell.umapValues.umapY <= umapRange.yStart &&
            cell.umapValues.umapY >= umapRange.yEnd
        );
      }

      setFilteredCells({
        unselectedCellsData,
        outlierCellsData
      });
    } catch (error) {
      console.error('Cell filtering error:', error);
      enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'error',
        message: t('segmentationSettings.filteringFailed')
      });
      setFilteredCells({
        unselectedCellsData: cellMasksData,
        outlierCellsData: []
      });
    }
  }, [cellMasksData, isCellNameFilterOn, cellNameFilters, ranges, proteinIndices, umapRange, enqueueSnackbar, t]);

  if (!cellMasksData) {
    return undefined;
  }

  const cellMasksLayer = new CellMasksLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-cell-masks-layer`,
    visible: !!cellMasksData && isCellLayerOn,
    showCellFill: true,
    showDiscardedPoints: showFilteredCells,
    cellFillOpacity,
    showBoundary,
    boundaryWidth,
    cellsData: filteredCells.unselectedCellsData,
    outlierCellsData: filteredCells.outlierCellsData,
    colormap: cellColormapConfig,
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
  const [selections, contrastLimits, colors, opacity, isLayerVisible, getLoader] = useBrightfieldImagesStore(
    useShallow((store) => [
      store.selections,
      store.contrastLimits,
      store.colors,
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
    colors: colors as any,
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
  const { t } = useTranslation();
  const [
    isPolygonDrawingEnabled,
    isPolygonLayerVisible,
    polygonFeatures,
    mode,
    addPolygon,
    updatePolygon,
    deletePolygon,
    isDetecting,
    setDetecting,
    isViewMode,
    isDeleteMode,
    polygonOpacity,
    selectedROIId
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.isPolygonDrawingEnabled,
      store.isPolygonLayerVisible,
      store.polygonFeatures,
      store.mode,
      store.addPolygon,
      store.updatePolygon,
      store.deletePolygon,
      store.isDetecting,
      store.setDetecting,
      store.isViewMode,
      store.isDeleteMode,
      store.polygonOpacity,
      store.selectedROIId
    ])
  );

  const [layerConfig, zarrUrl] = useZarrDataStore(useShallow((store) => [store.layerConfig, store.zarrUrl]));
  const [setSelectedPoints, updateSelectedPoints, addSelectedPoints, deleteSelectedPoints] = useTranscriptLayerStore(
    useShallow((store) => [
      store.setSelectedPoints,
      store.updateSelectedPoints,
      store.addSelectedPoints,
      store.deleteSelectedPoints
    ])
  );

  const [cellMasksData] = useCellSegmentationLayerStore(useShallow((store) => [store.cellMasksData]));
  const [setSelectedCells, updateSelectedCells, addSelectedCells, deleteSelectedCells] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.setSelectedCells,
      store.updateSelectedCells,
      store.addSelectedCells,
      store.deleteSelectedCells
    ])
  );

  const { detectPointsInPolygon, detectCellPolygonsInPolygon } = usePolygonDetectionWorker();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const polygonFeaturesBeforeEdit = useRef<PolygonFeature[]>([]);
  const isCellMasksInitialLoad = useRef(true);

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickedPolygonRef = useRef<number | null>(null);

  useEffect(() => {
    if (isCellMasksInitialLoad.current) {
      isCellMasksInitialLoad.current = false;
      return;
    }
    if (!cellMasksData) return;

    const currentPolygons = usePolygonDrawingStore.getState().polygonFeatures;
    if (currentPolygons.length === 0) return;

    const redetect = async () => {
      setDetecting(true);

      const results = await Promise.all(
        currentPolygons.map(async (polygon) => {
          const result = await detectCellPolygonsInPolygon(polygon, cellMasksData);
          return { polygon, result };
        })
      );

      const updatedFeatures = results.map(({ polygon, result }) => ({
        ...polygon,
        properties: {
          ...polygon.properties,
          cellPolygonCount: result.cellPolygonCount,
          cellClusterDistribution: result.cellClusterDistribution
        }
      }));

      const newSelectedCells = results.map(({ polygon, result }) => ({
        roiId: polygon.properties?.polygonId as number,
        data: result.cellPolygonsInDrawnPolygon
      }));

      usePolygonDrawingStore.setState({ polygonFeatures: updatedFeatures });
      setSelectedCells(newSelectedCells);
      setDetecting(false);
    };

    redetect().catch((error) => {
      console.error('Error re-detecting cells after segmentation change:', error);
      setDetecting(false);
    });
  }, [cellMasksData, detectCellPolygonsInPolygon, setDetecting, setSelectedCells]);

  const getPolygonColor = (
    feature: any,
    alphaFill: number,
    alphaLine: number
  ): { fill: [number, number, number, number]; line: [number, number, number, number] } => {
    if (isDetecting) {
      return {
        fill: [255, 255, 0, Math.round(polygonOpacity * 255)],
        line: [255, 255, 0, Math.round(polygonOpacity * 255)]
      };
    }

    const polygonId = feature?.properties?.polygonId || 1;
    const [r, g, b] = generatePolygonColor(polygonId - 1);

    return {
      fill: [r, g, b, Math.round(alphaFill * polygonOpacity)],
      line: [r, g, b, Math.round(alphaLine * polygonOpacity)]
    };
  };

  if (!isPolygonLayerVisible || (!isPolygonDrawingEnabled && polygonFeatures.length === 0)) {
    return undefined;
  }

  const featureCollection = {
    type: 'FeatureCollection' as const,
    features: polygonFeatures
  };

  const onEdit = async ({ updatedData, editType }: any) => {
    if (editType === 'movePosition' || editType === 'addPosition' || editType === 'removePosition') {
      if (polygonFeaturesBeforeEdit.current.length === 0) {
        polygonFeaturesBeforeEdit.current = [...polygonFeatures];
      }
    }

    // Store previous state for rollback if validation fails
    const previousFeatures = [...polygonFeatures];

    if (editType === 'addFeature') {
      // Validate only the newly added polygon
      const newPolygon = updatedData.features[updatedData.features.length - 1];

      const validationResult = checkPolygonSelfIntersections(newPolygon);
      if (validationResult.hasIntersection) {
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'error',
          preventDuplicate: true,
          key: 'polygon-intersection-error',
          message: t('interactiveLayer.intersectingPolygonError')
        });
        return;
      }

      const newPolygonId = addPolygon(newPolygon);

      // Start detection
      setDetecting(true);

      const loadingSnackbarId = enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'info',
        message: `${t('interactiveLayer.detectingData')}...`,
        persist: true,
        autoHideDuration: 10000
      });

      let totalFoundPoints = 0;
      let totalFoundCells = 0;

      if (zarrUrl) {
        try {
          const result = await detectPointsInPolygon(newPolygon, layerConfig, zarrUrl);

          // If point limit was exceeded, delete the polygon and show error
          if (result.limitExceeded) {
            setDetecting(false);
            closeSnackbar(loadingSnackbarId);
            deletePolygon(newPolygonId);
            enqueueSnackbar({
              variant: 'gxSnackbar',
              titleMode: 'error',
              message: t('interactiveLayer.pointLimitExceeded', {
                totalPoints: result.totalPointsFound?.toLocaleString() || 'Unknown',
                limit: MAX_TRANSCRIPT_POINTS_LIMIT.toLocaleString(),
                reductionPercent: result.suggestedReductionPercent || 50
              }),
              persist: true
            });
            return;
          }

          // Update polygon properties
          newPolygon.properties = {
            ...newPolygon.properties,
            pointCount: result.pointCount,
            geneDistribution: result.geneDistribution
          };

          addSelectedPoints({ data: result.pointsInPolygon, roiId: newPolygonId });
          totalFoundPoints = result.pointCount;
        } catch (error) {
          console.error('Error detecting points in polygon:', error);
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('interactiveLayer.transcriptsDetectionFailed')
          });
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

          addSelectedCells({ data: result.cellPolygonsInDrawnPolygon, roiId: newPolygonId });
          totalFoundCells = result.cellPolygonCount;
        } catch (error) {
          console.error('Error detecting cell polygons in polygon:', error);
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('interactiveLayer.cellsDetectionFailed')
          });
        }
      }

      setDetecting(false);
      closeSnackbar(loadingSnackbarId);

      if (!totalFoundPoints && !totalFoundCells) {
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'warning',
          message: t('interactiveLayer.noDataDetected', { polygonId: newPolygonId })
        });
      } else {
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'success',
          message: t('interactiveLayer.dataDetected', { polygonId: newPolygonId }),
          customContent: (
            <List>
              <ListItem>{t('interactiveLayer.transcriptsDetected', { count: totalFoundPoints })}</ListItem>
              <ListItem>{t('interactiveLayer.cellsDetected', { count: totalFoundCells })}</ListItem>
            </List>
          )
        });
      }
    } else if (editType === 'movePosition' || editType === 'addPosition' || editType === 'removePosition') {
      // Validate only the edited polygon for self-intersections
      const { editedPolygon, editedPolygonIndex } = findEditedPolygon(updatedData.features, previousFeatures);

      if (!editedPolygon) {
        return;
      }

      const validationResult = checkPolygonSelfIntersections(editedPolygon);
      if (validationResult.hasIntersection) {
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'error',
          preventDuplicate: true,
          key: 'polygon-intersection-error',
          message: t('interactiveLayer.intersectingPolygonError')
        });
        return;
      }

      updatePolygon(editedPolygon, editedPolygonIndex);
    } else if (editType === 'removeFeature') {
      setSelectedPoints([]);
      setSelectedCells([]);
    }

    if (editType === 'finishMovePosition') {
      // Find the edited polygon by comparing with previous state
      const allPolygons = updatedData.features;
      const initialFeatures =
        polygonFeaturesBeforeEdit.current.length > 0 ? polygonFeaturesBeforeEdit.current : previousFeatures;
      const { editedPolygon, editedPolygonIndex } = findEditedPolygon(allPolygons, initialFeatures);

      polygonFeaturesBeforeEdit.current = [];

      if (!editedPolygon) {
        console.warn('No polygon found to process');
        return;
      }

      // Start detection
      setDetecting(true);

      const loadingSnackbarId = enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'info',
        message: `${t('interactiveLayer.updatingPolygons')}...`,
        persist: true,
        autoHideDuration: 10000
      });

      let totalFoundPoints = 0;
      let totalFoundCells = 0;

      if (zarrUrl) {
        try {
          const result = await detectPointsInPolygon(editedPolygon, layerConfig, zarrUrl);

          // If point limit was exceeded, revert the polygon to its previous position
          if (result.limitExceeded) {
            setDetecting(false);
            closeSnackbar(loadingSnackbarId);
            // Revert to previous polygon state
            updatePolygon(initialFeatures[editedPolygonIndex], editedPolygonIndex);
            enqueueSnackbar({
              variant: 'gxSnackbar',
              titleMode: 'error',
              message: t('interactiveLayer.pointLimitExceeded', {
                totalPoints: result.totalPointsFound?.toLocaleString() || 'Unknown',
                limit: MAX_TRANSCRIPT_POINTS_LIMIT.toLocaleString(),
                reductionPercent: result.suggestedReductionPercent || 50
              }),
              persist: true
            });
            return;
          }

          // Update polygon properties
          editedPolygon.properties = {
            ...editedPolygon.properties,
            pointCount: result.pointCount,
            geneDistribution: result.geneDistribution
          };

          updateSelectedPoints(result.pointsInPolygon, editedPolygonIndex);
          totalFoundPoints = result.pointCount;
        } catch (error) {
          console.error('Error detecting points in polygon:', error);
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('interactiveLayer.transcriptsDetectionFailed')
          });
        }
      }

      if (cellMasksData) {
        try {
          const result = await detectCellPolygonsInPolygon(editedPolygon, cellMasksData);

          // Update polygon properties
          editedPolygon.properties = {
            ...editedPolygon.properties,
            cellPolygonCount: result.cellPolygonCount,
            cellClusterDistribution: result.cellClusterDistribution
          };

          // Add new cells from the updated polygon
          updateSelectedCells(result.cellPolygonsInDrawnPolygon, editedPolygonIndex);
          totalFoundCells = result.cellPolygonCount;
        } catch (error) {
          console.error('Error detecting cell polygons in polygon:', error);
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('interactiveLayer.cellsDetectionFailed')
          });
        }
      }

      setDetecting(false);
      closeSnackbar(loadingSnackbarId);

      // Show success message with updated counts
      const polygonId = editedPolygon.properties?.id || editedPolygonIndex;
      if (!totalFoundPoints && !totalFoundCells) {
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'warning',
          message: t('interactiveLayer.noDataDetected', { polygonId })
        });
      } else {
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'success',
          message: t('interactiveLayer.dataDetected', { polygonId }),
          customContent: (
            <List>
              <ListItem>{t('interactiveLayer.transcriptsDetected', { count: totalFoundPoints })}</ListItem>
              <ListItem>{t('interactiveLayer.cellsDetected', { count: totalFoundCells })}</ListItem>
            </List>
          )
        });
      }
    }
  };

  const onPolygonClick = (info: any) => {
    // Handle delete mode
    if (isDeleteMode && info.index !== undefined && info.index >= 0) {
      const deletedPolygonId = info.object.properties.polygonId;
      deletePolygon(deletedPolygonId);
      deleteSelectedCells(deletedPolygonId);
      deleteSelectedPoints(deletedPolygonId);
      return true;
    }

    // Handle double-click for ROI details in view mode
    if (isViewMode && info.index !== undefined && info.index >= 0 && info.object?.properties?.polygonId) {
      const polygonId = info.object.properties.polygonId;

      // Check if this is a double-click
      if (lastClickedPolygonRef.current === polygonId && clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        lastClickedPolygonRef.current = null;
        usePolygonDrawingStore.getState().selectROIForDetails(polygonId);
        return true;
      }

      lastClickedPolygonRef.current = polygonId;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      clickTimeoutRef.current = setTimeout(() => {
        lastClickedPolygonRef.current = null;
        clickTimeoutRef.current = null;
      }, 300); // 300ms window for double-click

      return true;
    }

    return false;
  };

  const polygonLayer = new EditableGeoJsonLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-polygon-drawing-layer`,
    data: featureCollection,
    mode: isDetecting ? new ViewMode() : isViewMode || isDeleteMode ? new ViewMode() : mode,
    selectedFeatureIndexes: isViewMode || isDeleteMode || isDetecting ? [] : polygonFeatures.map((_, index) => index),
    onEdit: isViewMode || isDeleteMode || isDetecting ? undefined : onEdit,
    onClick: isDeleteMode || isViewMode ? onPolygonClick : undefined,
    pickable: !isDetecting,
    autoHighlight: isDeleteMode,
    getFillColor: (feature: any) => {
      return getPolygonColor(feature, isViewMode ? 50 : 100, 0).fill;
    },
    getLineColor: (feature: any) => {
      return feature.properties.polygonId === selectedROIId
        ? [255, 255, 255, 255]
        : getPolygonColor(feature, 0, isViewMode ? 150 : 200).line;
    },
    highlightColor: isDeleteMode ? [255, 0, 0, 120] : undefined,
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

export const usePolygonTextLayer = () => {
  const [
    isPolygonLayerVisible,
    polygonFeatures,
    isDetecting,
    isViewMode,
    isDeleteMode,
    polygonOpacity,
    showROINumbers
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.isPolygonLayerVisible,
      store.polygonFeatures,
      store.isDetecting,
      store.isViewMode,
      store.isDeleteMode,
      store.polygonOpacity,
      store.showROINumbers
    ])
  );

  if (!isPolygonLayerVisible || !polygonFeatures.length || isDetecting) {
    return undefined;
  }

  // Show text only when:
  // 1. In view mode AND showROINumbers is true (user's preference)
  // 2. OR in delete mode (always show numbers to identify which ROI to delete)
  if (!isDeleteMode && (!isViewMode || !showROINumbers)) {
    return undefined;
  }

  const getFirstPointFromPolygon = (polygon: PolygonFeature) => {
    const coordinates = polygon.geometry.coordinates[0];
    if (coordinates && coordinates.length > 0) {
      const firstPoint = coordinates[0];
      return firstPoint;
    }
    return null;
  };

  const textData = polygonFeatures
    .map((feature) => {
      const firstPoint = getFirstPointFromPolygon(feature);
      if (!firstPoint || !feature.properties?.polygonId) {
        return null;
      }

      return {
        position: firstPoint,
        text: feature.properties.polygonId.toString()
      };
    })
    .filter(Boolean);

  const textLayer = new TextLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-polygon-text-layer`,
    data: textData,
    getPosition: (d: any) => d.position,
    getText: (d: any) => d.text,
    getColor: [255, 255, 255, Math.round(polygonOpacity * 255)],
    getSize: 18,
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 'bold',
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    billboard: true,
    pickable: false,
    background: true,
    getBackgroundColor: [0, 0, 0, Math.round(polygonOpacity * 180)],
    backgroundPadding: [6, 6, 6, 6]
  });

  return textLayer;
};
