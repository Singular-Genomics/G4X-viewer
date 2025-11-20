import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { usePolygonDetectionWorker } from '../PictureInPictureViewerAdapter/worker/usePolygonDetectionWorker';
import { PolygonFeature, usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';

export const usePolygonsFileImport = () => {
  const { detectCellPolygonsInPolygon, detectPointsInPolygon } = usePolygonDetectionWorker();
  const { addSelectedPoints } = useTranscriptLayerStore();
  const { addSelectedCells } = useCellSegmentationLayerStore();
  const { setPolygons } = usePolygonDrawingStore();

  const importPolygons = async (file: File) => {
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

    const importedData = JSON.parse(content);

    // Only support ROI format
    if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
      throw new Error('Invalid file format. Expected ROI format with ROI_ prefixed keys.');
    }

    const roiKeys = Object.keys(importedData).filter((key) => key.startsWith('ROI_'));
    if (roiKeys.length === 0) {
      throw new Error('Invalid file format. No ROI data found. Expected ROI format with ROI_ prefixed keys.');
    }

    // Extract coordinates and polygonId from ROI structure
    const polygonsWithData = Object.values(importedData).map((roi: any) => ({
      coordinates: roi.coordinates,
      polygonId: roi.polygonId
    }));

    const importedPolygons: PolygonFeature[] = polygonsWithData.map((polygonData, i: number) => ({
      type: 'Feature' as const,
      geometry: { type: 'Polygon' as const, coordinates: [polygonData.coordinates] },
      properties: {
        id: i,
        polygonId: polygonData.polygonId || i + 1 // Use original ID if available, otherwise sequential
      }
    }));

    // Add polygons to the interactive layer store
    setPolygons(importedPolygons);

    // Run detection for transcripts
    const { files: transcriptFiles, layerConfig } = useBinaryFilesStore.getState();
    if (transcriptFiles.length > 0) {
      for (const polygon of importedPolygons) {
        try {
          const result = await detectPointsInPolygon(polygon, transcriptFiles, layerConfig);

          // Update polygon properties
          polygon.properties = {
            ...polygon.properties,
            pointCount: result.pointCount,
            geneDistribution: result.geneDistribution
          };

          addSelectedPoints({ data: result.pointsInPolygon, roiId: polygon.properties?.polygonId });
        } catch (error) {
          console.error(`Error detecting points in polygon with id ${polygon.properties?.polygonId}:`, error);
        }
      }
    }

    // Run detection for cell segmentation
    const { cellMasksData } = useCellSegmentationLayerStore.getState();
    if (cellMasksData) {
      for (const polygon of importedPolygons) {
        try {
          const result = await detectCellPolygonsInPolygon(polygon, cellMasksData);

          // Update polygon properties
          polygon.properties = {
            ...polygon.properties,
            cellPolygonCount: result.cellPolygonCount,
            cellClusterDistribution: result.cellClusterDistribution
          };

          addSelectedCells({ data: result.cellPolygonsInDrawnPolygon, roiId: polygon.properties?.polygonId });
        } catch (error) {
          console.error(`Error detecting cell polygons in polygon with id ${polygon.properties?.polygonId}:`, error);
        }
      }
    }
  };

  return importPolygons;
};
