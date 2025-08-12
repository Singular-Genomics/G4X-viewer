import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { SingleMask, PointData } from '../../shared/types';
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

    const cellsInPolygon: SingleMask[] = [];

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

    const header = [
      'cell_id',
      'ROI',
      'totalCounts',
      'totalGenes',
      'area',
      'clusterId',
      'umapX',
      'umapY',
      'vertices',
      'color',
      ...proteinColumns
    ];
    const rows: (string | number)[][] = [header];

    cellsInPolygon.forEach((cell) => {
      const base = [
        cell.cellId,
        polygonId,
        parseInt(cell.totalCounts, 10) || 0,
        parseInt(cell.totalGenes, 10) || 0,
        parseFloat(cell.area) || 0,
        cell.clusterId || '',
        cell.umapValues?.umapX || 0,
        cell.umapValues?.umapY || 0,
        JSON.stringify(cell.vertices || []),
        JSON.stringify(cell.color || [])
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

    const transcriptsInPolygon: PointData[] = [];
    const geneCountMap: Map<string, number> = new Map();

    if (selectedPoints && Array.isArray(selectedPoints)) {
      // First pass: collect transcripts and count genes
      for (const transcript of selectedPoints) {
        if (
          transcript.position &&
          transcript.position.length >= 2 &&
          isPointInPolygon([transcript.position[0], transcript.position[1]], coordinates)
        ) {
          const geneName = transcript.geneName || 'unknown';
          geneCountMap.set(geneName, (geneCountMap.get(geneName) || 0) + 1);
          transcriptsInPolygon.push(transcript);
        }
      }
    }

    const header = ['gene_name', 'count', 'ROI', 'position', 'color', 'cellId'];
    const rows: (string | number)[][] = [header];

    transcriptsInPolygon.forEach((transcript) => {
      const geneName = transcript.geneName || 'unknown';
      rows.push([
        geneName,
        geneCountMap.get(geneName) || 0,
        polygonId,
        JSON.stringify(transcript.position || []),
        JSON.stringify(transcript.color || []),
        transcript.cellId || ''
      ]);
    });

    const csv = rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
    downloadText(csv, `${roiName}_transcripts.csv`);
  });
};

export const exportROIMetadataCSV = (polygonFeatures: PolygonFeature[]) => {
  const { cellMasksData } = useCellSegmentationLayerStore.getState();
  const { selectedPoints } = useTranscriptLayerStore.getState();

  const header = ['ROI', 'ROI_coordinates', 'mean_counts', 'mean_genes', 'total_cells', 'total_transcripts'];
  const rows: (string | number)[][] = [header];

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const coordinates = feature.geometry.coordinates[0];

    // Convert coordinates to string format
    const coordinatesStr = JSON.stringify(coordinates);

    // Calculate cell statistics
    let totalCells = 0;
    let totalCounts = 0;
    let totalGenes = 0;

    if (cellMasksData && Array.isArray(cellMasksData)) {
      for (const cellMask of cellMasksData) {
        if (
          cellMask.vertices &&
          cellMask.vertices.length > 0 &&
          checkCellPolygonInDrawnPolygon(cellMask.vertices, coordinates)
        ) {
          totalCells++;
          totalCounts += parseInt(cellMask.totalCounts, 10) || 0;
          totalGenes += parseInt(cellMask.totalGenes, 10) || 0;
        }
      }
    }

    // Calculate transcript statistics
    let totalTranscripts = 0;
    if (selectedPoints && Array.isArray(selectedPoints)) {
      for (const transcript of selectedPoints) {
        if (
          transcript.position &&
          transcript.position.length >= 2 &&
          isPointInPolygon([transcript.position[0], transcript.position[1]], coordinates)
        ) {
          totalTranscripts++;
        }
      }
    }

    // Calculate means
    const meanCounts = totalCells > 0 ? Math.round((totalCounts / totalCells) * 100) / 100 : 0;
    const meanGenes = totalCells > 0 ? Math.round((totalGenes / totalCells) * 100) / 100 : 0;

    rows.push([polygonId, coordinatesStr, meanCounts, meanGenes, totalCells, totalTranscripts]);
  });

  const csv = rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
  downloadText(csv, 'ROI_metadata.csv');
};
