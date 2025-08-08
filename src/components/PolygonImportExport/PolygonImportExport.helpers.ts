import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import {
  checkCellPolygonInDrawnPolygon,
  isPointInPolygon
} from '../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';

const escapeCsvValue = (value: string | number) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const downloadText = (content: string, fileName: string, mime = 'text/csv') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPolygonsWithCellsCSV = (polygonFeatures: PolygonFeature[]) => {
  const { cellMasksData } = useCellSegmentationLayerStore.getState();

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    const cellsInPolygon: any[] = [];

    if (cellMasksData && Array.isArray(cellMasksData)) {
      for (const cellMask of cellMasksData) {
        if (
          cellMask.vertices &&
          cellMask.vertices.length > 0 &&
          checkCellPolygonInDrawnPolygon(cellMask.vertices, coordinates)
        ) {
          cellsInPolygon.push(cellMask);
        }
      }
    }

    const proteinSet = new Set<string>();
    cellsInPolygon.forEach((cell) => {
      Object.keys(cell.proteins || {}).forEach((p) => proteinSet.add(p));
    });
    const proteinColumns = Array.from(proteinSet);

    const header = ['cell_id', 'ROI', 'totalCounts', 'totalGenes', ...proteinColumns];
    const rows: (string | number)[][] = [header];

    cellsInPolygon.forEach((cell) => {
      const base = [
        cell.cellId,
        polygonId,
        parseInt(cell.totalCounts, 10) || 0,
        parseInt(cell.totalGenes, 10) || 0
      ] as (string | number)[];
      const proteinValues = proteinColumns.map((name) => {
        const value = cell.proteins?.[name];
        return typeof value === 'number' ? value : 0;
      });
      rows.push([...base, ...proteinValues]);
    });

    const csv = rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
    downloadText(csv, `${roiName}_cells.csv`);
  });
};

export const exportPolygonsWithTranscriptsCSV = (polygonFeatures: PolygonFeature[]) => {
  const { selectedPoints } = useTranscriptLayerStore.getState();

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    const geneCountMap: Map<string, number> = new Map();

    if (selectedPoints && Array.isArray(selectedPoints)) {
      for (const transcript of selectedPoints) {
        if (
          transcript.position &&
          transcript.position.length >= 2 &&
          isPointInPolygon([transcript.position[0], transcript.position[1]], coordinates)
        ) {
          const geneName = transcript.geneName || 'unknown';
          geneCountMap.set(geneName, (geneCountMap.get(geneName) || 0) + 1);
        }
      }
    }

    const header = ['gene_name', 'ROI', 'count'];
    const rows: (string | number)[][] = [header];
    Array.from(geneCountMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([gene, count]) => rows.push([gene, polygonId, count]));

    const csv = rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
    downloadText(csv, `${roiName}_transcripts.csv`);
  });
};
