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
import * as protobuf from 'protobufjs';
import { CellMasksSchema } from '../../layers/cell-masks-layer/cell-masks-schema';

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

const checkPointInPolygon = (point: [number, number], polygon: any) => {
  return isPointInPolygon(point, polygon);
};

const checkCellPolygonInDrawnPolygon = (cellVertices: number[], drawnPolygon: any) => {
  if (!cellVertices || cellVertices.length < 6) return false;

  for (let i = 0; i < cellVertices.length; i += 2) {
    const point: [number, number] = [cellVertices[i], cellVertices[i + 1]];
    if (!isPointInPolygon(point, drawnPolygon)) {
      return false;
    }
  }

  return true;
};

// Removes duplicate points based on position values
const cleanupDuplicatePoints = (points: any[]): any[] => {
  if (!points || points.length <= 1) return points || [];

  const seen = new Set<string>();
  const uniquePoints: any[] = [];

  uniquePoints.length = Math.ceil(points.length * 0.7);
  uniquePoints.length = 0;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point || !point.position || point.position.length < 2) continue;

    const key = point.position[0] + ',' + point.position[1];

    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push(point);
    }
  }

  return uniquePoints;
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
    selectedCells,
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
  const [selectedPoints, setSelectedPoints] = useTranscriptLayerStore(
    useShallow((store) => [store.selectedPoints, store.setSelectedPoints])
  );

  const [cellMasksData] = useCellSegmentationLayerStore(useShallow((store) => [store.cellMasksData]));
  const [selectedCells, setSelectedCells] = useCellSegmentationLayerStore(
    useShallow((store) => [store.selectedCells, store.setSelectedCells])
  );

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

        // Remove duplicate points
        const uniquePointsInPolygon = cleanupDuplicatePoints(pointsInPolygon);

        console.log(`Total points found inside polygon: ${pointsInPolygon.length}`);

        // Analyze points by gene name
        if (uniquePointsInPolygon.length > 0) {
          const countByGeneName: Record<string, number> = {};
          for (const point of uniquePointsInPolygon) {
            const geneName = point.geneName || 'unknown';
            countByGeneName[geneName] = (countByGeneName[geneName] || 0) + 1;
          }

          console.log('Count by gene name:', countByGeneName);
          console.log(
            'First 10 points (sample):',
            uniquePointsInPolygon.slice(0, 10).map((p) => ({
              position: p.position,
              geneName: p.geneName,
              cellId: p.cellId
            }))
          );

          // Store results in polygon properties
          newPolygon.properties = {
            ...newPolygon.properties,
            pointCount: uniquePointsInPolygon.length,
            geneDistribution: countByGeneName
          };

          const combinedSelectedPoints = [...selectedPoints, ...uniquePointsInPolygon];
          const uniqueCombinedPoints = cleanupDuplicatePoints(combinedSelectedPoints);
          setSelectedPoints(uniqueCombinedPoints);
          updatePolygonFeatures(updatedData.features);
        }
      }

      if (cellMasksData) {
        try {
          const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
          const decodedCellMasks = (protoRoot.lookupType('CellMasks').decode(cellMasksData) as any).cellMasks;

          const cellPolygonsInDrawnPolygon: any[] = [];

          for (const cellMask of decodedCellMasks) {
            if (cellMask.vertices && checkCellPolygonInDrawnPolygon(cellMask.vertices, newPolygon)) {
              cellPolygonsInDrawnPolygon.push({
                cellId: cellMask.cellId,
                clusterId: cellMask.clusterId,
                area: cellMask.area,
                totalCounts: cellMask.totalCounts,
                totalGenes: cellMask.totalGenes,
                vertices: cellMask.vertices,
                color: cellMask.color
              });
            }
          }

          console.log(`Total cell polygons found inside drawn polygon: ${cellPolygonsInDrawnPolygon.length}`);

          if (cellPolygonsInDrawnPolygon.length > 0) {
            const countByClusterId: Record<string, number> = {};
            for (const cellPolygon of cellPolygonsInDrawnPolygon) {
              const clusterId = cellPolygon.clusterId || 'unknown';
              countByClusterId[clusterId] = (countByClusterId[clusterId] || 0) + 1;
            }

            console.log('Cell polygons count by cluster ID:', countByClusterId);
            console.log(
              'First 5 cell polygons (sample):',
              cellPolygonsInDrawnPolygon.slice(0, 5).map((c) => ({
                cellId: c.cellId,
                clusterId: c.clusterId,
                area: c.area,
                totalCounts: c.totalCounts,
                totalGenes: c.totalGenes,
                verticesCount: c.vertices ? c.vertices.length / 2 : 0
              }))
            );

            console.log('Cell polygons coordinates (first 3):');
            for (let i = 0; i < Math.min(3, cellPolygonsInDrawnPolygon.length); i++) {
              const cell = cellPolygonsInDrawnPolygon[i];
              const coordinates = [];
              if (cell.vertices) {
                for (let j = 0; j < cell.vertices.length; j += 2) {
                  coordinates.push([cell.vertices[j], cell.vertices[j + 1]]);
                }
              }
              console.log(`Cell ${cell.cellId} coordinates:`, coordinates);
            }

            newPolygon.properties = {
              ...newPolygon.properties,
              cellPolygonCount: cellPolygonsInDrawnPolygon.length,
              cellClusterDistribution: countByClusterId
            };

            const combinedSelectedCells = [...selectedCells, ...cellPolygonsInDrawnPolygon];
            setSelectedCells(combinedSelectedCells);
          }
        } catch (error) {
          console.error('Error processing cell masks:', error);
        }
      }
    } else if (editType === 'selectFeature') {
      selectFeature(featureIndexes[0]);
    } else if (editType === 'removeFeature' || editType === 'moveFeature') {
      setSelectedPoints([]);
      setSelectedCells([]);
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
    // coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
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
