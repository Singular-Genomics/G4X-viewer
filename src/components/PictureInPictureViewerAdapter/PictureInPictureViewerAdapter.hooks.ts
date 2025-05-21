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

// Checks if a point is inside a polygon using ray-casting algorithm
const isPointInPolygon = (point: [number, number], polygon: any) => {
  const vertices = polygon.geometry.coordinates[0];
  let inside = false;
  const x = point[0],
    y = point[1];

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0],
      yi = vertices[i][1];
    const xj = vertices[j][0],
      yj = vertices[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

// Checks point in both normal and flipped coordinate systems
const checkPointInPolygon = (point: [number, number], polygon: any) => {
  // Try normal coordinates
  if (isPointInPolygon(point, polygon)) {
    return true;
  }

  // Try flipped coordinates (x,y) -> (y,x)
  const flippedPoint: [number, number] = [point[1], point[0]];
  return isPointInPolygon(flippedPoint, polygon);
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

  if (!cellMasksData) {
    return undefined;
  }

  const cellMasksLayer = new CellMasksLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-cell-masks-layer`,
    masksData: cellMasksData || new Uint8Array(),
    visible: !!cellMasksData && isCellLayerOn,
    showCellFill: isCellFillOn,
    showDiscardedPoints: showFilteredCells,
    cellFilters: isCellNameFilterOn ? cellNameFilters : 'all',
    cellFillOpacity,
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
  const [isPolygonDrawingEnabled, polygonFeatures, selectedFeatureIndex, mode, updatePolygonFeatures, selectFeature] =
    usePolygonDrawingStore(
      useShallow((store) => [
        store.isPolygonDrawingEnabled,
        store.polygonFeatures,
        store.selectedFeatureIndex,
        store.mode,
        store.updatePolygonFeatures,
        store.selectFeature
      ])
    );

  const [files, layerConfig] = useBinaryFilesStore(useShallow((store) => [store.files, store.layerConfig]));

  const transcriptLayerRef = useRef<any>(null);
  const transcriptLayer = useTranscriptLayer();

  useEffect(() => {
    if (transcriptLayer) {
      transcriptLayerRef.current = transcriptLayer;
    }
  }, [transcriptLayer]);

  if (!isPolygonDrawingEnabled) {
    return undefined;
  }

  const featureCollection = {
    type: 'FeatureCollection',
    features: polygonFeatures
  };

  // Loads transcript data from a specific tile
  const loadTileData = async (zoom: number, x: number, y: number) => {
    if (!transcriptLayerRef.current || !files.length) return null;

    try {
      return await transcriptLayerRef.current.loadMetadata(zoom, x, y);
    } catch (error) {
      console.error('Error loading tile data:', error);
      return null;
    }
  };

  const onEdit = async ({ updatedData, editType, featureIndexes }: any) => {
    updatePolygonFeatures(updatedData.features);

    if (editType === 'addFeature') {
      const newFeatureIndex = updatedData.features.length - 1;
      selectFeature(newFeatureIndex);
      const newPolygon = updatedData.features[newFeatureIndex];

      console.log('Created polygon:', newPolygon);
      console.log('Polygon coordinates:', newPolygon.geometry.coordinates[0]);

      if (files.length > 0 && transcriptLayerRef.current && layerConfig) {
        // Calculate polygon boundaries
        const coordinates = newPolygon.geometry.coordinates[0];
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        for (const coord of coordinates) {
          minX = Math.min(minX, coord[0]);
          minY = Math.min(minY, coord[1]);
          maxX = Math.max(maxX, coord[0]);
          maxY = Math.max(maxY, coord[1]);
        }

        console.log(`Polygon boundaries: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);

        const pointsInPolygon: any[] = [];

        // Extract tile information from file names
        const tileRegex = /\/(\d+)\/(\d+)\/(\d+)\.bin$/;
        const tilePromises: Promise<any>[] = [];

        files.forEach((file: any) => {
          const match = file.name.match(tileRegex);
          if (match) {
            const zoom = parseInt(match[1], 10);
            const x = parseInt(match[2], 10);
            const y = parseInt(match[3], 10);

            // Process each tile to find points inside polygon
            tilePromises.push(
              (async () => {
                try {
                  const tileData = await loadTileData(zoom, y, x);
                  if (tileData && Array.isArray(tileData.pointsData)) {
                    const pointsFoundInTile = tileData.pointsData.filter((point: any) => {
                      if (!point || !point.position || point.position.length < 2) return false;

                      const pointPosition = [point.position[0], point.position[1]];
                      return checkPointInPolygon(pointPosition as [number, number], newPolygon);
                    });

                    if (pointsFoundInTile.length > 0) {
                      console.log(`Tile ${zoom}/${y}/${x}: Found ${pointsFoundInTile.length} points inside polygon`);
                      return pointsFoundInTile;
                    }
                  }
                  return [];
                } catch (error) {
                  console.error(`Error processing tile ${zoom}/${y}/${x}:`, error);
                  return [];
                }
              })()
            );
          }
        });

        // Collect results from all tiles
        const allPointArrays = await Promise.all(tilePromises);
        allPointArrays.forEach((pointArray) => {
          pointsInPolygon.push(...pointArray);
        });

        console.log(`Total points found inside polygon: ${pointsInPolygon.length}`);

        // Analyze points by gene name
        if (pointsInPolygon.length > 0) {
          const countByGeneName: Record<string, number> = {};
          for (const point of pointsInPolygon) {
            const geneName = point.geneName || 'unknown';
            countByGeneName[geneName] = (countByGeneName[geneName] || 0) + 1;
          }

          console.log('Count by gene name:', countByGeneName);
          console.log(
            'First 10 points (sample):',
            pointsInPolygon.slice(0, 10).map((p) => ({
              position: p.position,
              geneName: p.geneName,
              cellId: p.cellId
            }))
          );

          // Store results in polygon properties
          newPolygon.properties = {
            ...newPolygon.properties,
            pointCount: pointsInPolygon.length,
            geneDistribution: countByGeneName
          };

          updatePolygonFeatures(updatedData.features);
        }
      }
    } else if (editType === 'selectFeature') {
      selectFeature(featureIndexes[0]);
    }
  };

  const polygonLayer = new EditableGeoJsonLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-polygon-drawing-layer`,
    data: featureCollection as any,
    mode,
    selectedFeatureIndexes: selectedFeatureIndex !== null ? [selectedFeatureIndex] : [],
    onEdit,
    pickable: true,
    autoHighlight: true,
    getFillColor: [0, 200, 0, 100],
    getLineColor: [0, 200, 0, 200],
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
