import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
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

export const exportPolygonsWithCellsCSV = (polygonFeatures: PolygonFeature[]) => {
  const { selectedCells } = useCellSegmentationLayerStore.getState();

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;

    const cellsInPolygon = selectedCells.find((selection) => selection.roiId === polygonId)?.data || [];

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
    downloadText(csv, `${roiName}_transcripts.csv`);
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
  downloadText(csv, 'ROI_metadata.csv');
};
