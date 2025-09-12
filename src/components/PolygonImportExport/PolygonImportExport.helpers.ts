import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useViewerStore } from '../../stores/ViewerStore';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

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

const generateExportCsvFilename = (type: string): string => {
  const viewerSource = useViewerStore.getState().source;
  const ometiffName = viewerSource?.description?.replace(/\.(ome\.tiff?|tiff?|zarr)$/i, '') || 'export';
  const date = new Date().toISOString().split('T')[0];
  return `${ometiffName}_${type}_${date}.csv`;
};

export const exportPolygonsWithCellsCSV = (polygonFeatures: PolygonFeature[]) => {
  const { selectedCells, segmentationMetadata } = useCellSegmentationLayerStore.getState();

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;

    const cellsInPolygon = selectedCells.find((selection) => selection.roiId === polygonId)?.data || [];

    const proteinColumns = segmentationMetadata?.proteinNames || [];

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
      rows.push([
        cell.cellId,
        polygonId,
        cell.totalCounts || 0,
        cell.totalGenes || 0,
        cell.area || 0,
        cell.clusterId || '',
        cell.umapValues?.umapX || 0,
        cell.umapValues?.umapY || 0,
        JSON.stringify(cell.vertices || []),
        JSON.stringify(cell.color || []),
        ...cell.proteinValues
      ] as (string | number)[]);
    });

    const csv = rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
    downloadText(csv, generateExportCsvFilename(`${roiName}_segmentation`));
  });
};

export const exportPolygonsWithTranscriptsCSV = (polygonFeatures: PolygonFeature[]) => {
  const { selectedPoints } = useTranscriptLayerStore.getState();

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;

    const transcriptsInPolygon = selectedPoints.find((selection) => selection.roiId === polygonId)?.data || [];
    const geneCountMap: Map<string, number> = new Map();

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
    downloadText(csv, generateExportCsvFilename(`${roiName}_transcripts`));
  });
};

export const exportROIMetadataCSV = (polygonFeatures: PolygonFeature[]) => {
  const { selectedCells } = useCellSegmentationLayerStore.getState();
  const { selectedPoints } = useTranscriptLayerStore.getState();

  const header = ['ROI', 'ROI_coordinates', 'mean_counts', 'mean_genes', 'total_cells', 'total_transcripts'];
  const rows: (string | number)[][] = [header];

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const coordinates = feature.geometry.coordinates[0];

    // Convert coordinates to string format
    const coordinatesStr = JSON.stringify(coordinates);

    // Calculate cell statistics
    const cellStatistics = selectedCells.reduce(
      (acc, curr) => ({
        totalCells: acc.totalCells + curr.data.length,
        totalCounts: acc.totalCounts + curr.data.reduce((sum, cell) => sum + Number(cell.totalCounts), 0),
        totalGenes: acc.totalGenes + curr.data.reduce((sum, cell) => sum + Number(cell.totalGenes), 0)
      }),
      {
        totalCells: 0,
        totalCounts: 0,
        totalGenes: 0
      }
    );

    // Calculate transcript statistics
    const totalTranscripts = selectedPoints.reduce((acc, curr) => acc + curr.data.length, 0);

    // Calculate means
    const meanCounts =
      cellStatistics.totalCells > 0
        ? Math.round((cellStatistics.totalCounts / cellStatistics.totalCells) * 100) / 100
        : 0;
    const meanGenes =
      cellStatistics.totalCells > 0
        ? Math.round((cellStatistics.totalGenes / cellStatistics.totalCells) * 100) / 100
        : 0;

    rows.push([polygonId, coordinatesStr, meanCounts, meanGenes, cellStatistics.totalCells, totalTranscripts]);
  });

  const csv = rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
  downloadText(csv, generateExportCsvFilename('ROI_metadata'));
};
