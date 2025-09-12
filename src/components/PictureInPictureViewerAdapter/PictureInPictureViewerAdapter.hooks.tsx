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
import { EditableGeoJsonLayer, ViewMode } from '@deck.gl-community/editable-layers';
import { TextLayer } from '@deck.gl/layers';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { usePolygonDetectionWorker } from './worker/usePolygonDetectionWorker';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useCellFilteringWorker } from '../../layers/cell-masks-layer';
import { SingleMask } from '../../shared/types';
import { useSnackbar } from 'notistack';
import { generatePolygonColor } from '../../utils/utils';
import {
  checkPolygonSelfIntersections,
  findEditedPolygon
} from '../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';
import { useTranslation } from 'react-i18next';
import { List, ListItem } from '@mui/material';

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
    cellNameFilters
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.cellMasksData,
      store.isCellLayerOn,
      store.isCellFillOn,
      store.isCellNameFilterOn,
      store.cellFillOpacity,
      store.showFilteredCells,
      store.cellNameFilters
    ])
  );

  const { proteinIndices, ranges } = useCytometryGraphStore();
  const { ranges: umapRange } = useUmapGraphStore();
  const { filterCells } = useCellFilteringWorker();
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

    filterCells(
      cellMasksData,
      isCellNameFilterOn ? cellNameFilters : 'all',
      ranges && proteinIndices.xAxisIndex && proteinIndices.yAxisIndex
        ? {
            proteins: proteinIndices,
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
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'error',
          message: 'Failed to filter cells. Please try again or contact support.'
        });
        setFilteredCells({
          unselectedCellsData: cellMasksData,
          outlierCellsData: []
        });
      });
  }, [
    cellMasksData,
    isCellNameFilterOn,
    cellNameFilters,
    ranges,
    proteinIndices,
    umapRange,
    filterCells,
    enqueueSnackbar
  ]);

  if (!cellMasksData) {
    return undefined;
  }

  const cellMasksLayer = new CellMasksLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-cell-masks-layer`,
    visible: !!cellMasksData && isCellLayerOn,
    showCellFill: isCellFillOn,
    showDiscardedPoints: showFilteredCells,
    cellNameFilters: isCellNameFilterOn ? cellNameFilters : 'all',
    cellCytometryFilter: {
      proteins: proteinIndices,
      range: ranges
    },
    umapFilter: umapRange,
    cellFillOpacity,
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
    polygonOpacity
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
      store.polygonOpacity
    ])
  );

  const [files, layerConfig] = useBinaryFilesStore(useShallow((store) => [store.files, store.layerConfig]));
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

      if (files.length > 0) {
        try {
          const result = await detectPointsInPolygon(newPolygon, files, layerConfig);

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
      const { editedPolygon, editedPolygonIndex } = findEditedPolygon(allPolygons, previousFeatures);

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

      if (files.length > 0) {
        try {
          const result = await detectPointsInPolygon(editedPolygon, files, layerConfig);

          // Update polygon properties
          editedPolygon.properties = {
            ...editedPolygon.properties,
            pointCount: result.pointCount,
            geneDistribution: result.geneDistribution
          };

          updateSelectedPoints(result.pointsInPolygon, editedPolygonIndex);
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
    }
  };

  const onPolygonClickForDeletion = (info: any) => {
    if (isDeleteMode && info.index !== undefined && info.index >= 0) {
      const deltedPolygonId = info.object.properties.polygonId;
      deletePolygon(deltedPolygonId);
      deleteSelectedCells(deltedPolygonId);
      deleteSelectedPoints(deltedPolygonId);
      return true; // Prevent further event propagation
    }
    return false;
  };

  const polygonLayer = new EditableGeoJsonLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-polygon-drawing-layer`,
    data: featureCollection,
    mode: isDetecting ? new ViewMode() : isViewMode || isDeleteMode ? new ViewMode() : mode,
    selectedFeatureIndexes: isViewMode || isDeleteMode || isDetecting ? [] : polygonFeatures.map((_, index) => index),
    onEdit: isViewMode || isDeleteMode || isDetecting ? undefined : onEdit,
    onClick: isDeleteMode ? onPolygonClickForDeletion : undefined,
    pickable: !isDetecting && (!isViewMode || isDeleteMode),
    autoHighlight: isDeleteMode,
    getFillColor: (feature: any) => {
      const alphaFill = isViewMode ? 50 : 100;
      return getPolygonColor(feature, alphaFill, 0).fill;
    },
    getLineColor: (feature: any) => {
      const alphaLine = isViewMode ? 150 : 200;
      return getPolygonColor(feature, 0, alphaLine).line;
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
    isPolygonDrawingEnabled,
    isPolygonLayerVisible,
    polygonFeatures,
    isDetecting,
    isViewMode,
    isDeleteMode,
    polygonOpacity
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.isPolygonDrawingEnabled,
      store.isPolygonLayerVisible,
      store.polygonFeatures,
      store.isDetecting,
      store.isViewMode,
      store.isDeleteMode,
      store.polygonOpacity
    ])
  );

  if (!isPolygonLayerVisible || !polygonFeatures.length || isDetecting) {
    return undefined;
  }

  // Show text only in view mode or delete mode (when polygon drawing is disabled or explicitly in view/delete mode)
  if (isPolygonDrawingEnabled && !isViewMode && !isDeleteMode) {
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
    fontFamily: 'Arial, sans-serif',
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
