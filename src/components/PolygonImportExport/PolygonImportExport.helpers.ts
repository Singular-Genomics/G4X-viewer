import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useViewerStore } from '../../stores/ViewerStore';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { TarFileEntry } from './PolygonImportExport.types';

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

const createTarFile = (files: TarFileEntry[]): Uint8Array => {
  const tarData: Uint8Array[] = [];

  files.forEach((file) => {
    const fileName = file.name;
    const fileContent = new TextEncoder().encode(file.content);
    const fileSize = fileContent.length;

    const header = new Uint8Array(512);
    header.fill(0);

    const nameBytes = new TextEncoder().encode(fileName);
    header.set(nameBytes.slice(0, 100), 0);

    const mode = '0000644\0';
    header.set(new TextEncoder().encode(mode), 100);

    const uid = '0000000\0';
    header.set(new TextEncoder().encode(uid), 108);

    const gid = '0000000\0';
    header.set(new TextEncoder().encode(gid), 116);

    const sizeStr = fileSize.toString(8).padStart(11, '0') + '\0';
    header.set(new TextEncoder().encode(sizeStr), 124);

    const mtime =
      Math.floor(Date.now() / 1000)
        .toString(8)
        .padStart(11, '0') + '\0';
    header.set(new TextEncoder().encode(mtime), 136);

    header.set(new TextEncoder().encode('        '), 148);

    header[156] = 48; // '0' for regular file

    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i];
    }
    const checksumStr = checksum.toString(8).padStart(6, '0') + '\0 ';
    header.set(new TextEncoder().encode(checksumStr), 148);

    tarData.push(header);

    tarData.push(fileContent);

    const padding = 512 - (fileSize % 512);
    if (padding !== 512) {
      const paddingBytes = new Uint8Array(padding);
      paddingBytes.fill(0);
      tarData.push(paddingBytes);
    }
  });

  const endMarker = new Uint8Array(1024);
  endMarker.fill(0);
  tarData.push(endMarker);

  const totalLength = tarData.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  tarData.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
};

const downloadTarFile = (files: TarFileEntry[], fileName: string) => {
  const tarData = createTarFile(files);
  const blob = new Blob([new Uint8Array(tarData)], { type: 'application/x-tar' });
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

const generateExportTarFilename = (roiCount: number): string => {
  const viewerSource = useViewerStore.getState().source;
  const ometiffName = viewerSource?.description?.replace(/\.(ome\.tiff?|tiff?|zarr)$/i, '') || 'export';
  const date = new Date().toISOString().split('T')[0];
  return `${date}_${ometiffName}_${roiCount}ROIs.tar`;
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

const generateCsvContentForSinglePolygon = (feature: PolygonFeature, type: 'cells' | 'transcripts'): string => {
  const polygonId = feature.properties?.polygonId || 1;

  if (type === 'cells') {
    const { selectedCells } = useCellSegmentationLayerStore.getState();
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

    return rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
  } else {
    const { selectedPoints } = useTranscriptLayerStore.getState();
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

    return rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
  }
};

const generateMetadataCSVContent = (polygonFeatures: PolygonFeature[]): string => {
  const { selectedCells } = useCellSegmentationLayerStore.getState();
  const { selectedPoints } = useTranscriptLayerStore.getState();

  const header = ['ROI', 'ROI_coordinates', 'mean_counts', 'mean_genes', 'total_cells', 'total_transcripts'];
  const rows: (string | number)[][] = [header];

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const coordinates = feature.geometry.coordinates[0];
    const coordinatesStr = JSON.stringify(coordinates);

    const cellStatistics = selectedCells.reduce(
      (acc, curr) => ({
        totalCells: acc.totalCells + curr.data.length,
        totalCounts: acc.totalCounts + curr.data.reduce((sum, cell) => sum + Number(cell.totalCounts), 0),
        totalGenes: acc.totalGenes + curr.data.reduce((sum, cell) => sum + Number(cell.totalGenes), 0)
      }),
      { totalCells: 0, totalCounts: 0, totalGenes: 0 }
    );

    const totalTranscripts = selectedPoints.reduce((acc, curr) => acc + curr.data.length, 0);
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

  return rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
};

const createCSVTarFile = (polygonFeatures: PolygonFeature[], type: 'cells' | 'transcripts') => {
  const files: TarFileEntry[] = [];

  // Generate CSV for each ROI
  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const csvContent = generateCsvContentForSinglePolygon(feature, type);
    const fileType = type === 'cells' ? 'segmentation' : 'transcripts';

    files.push({
      name: generateExportCsvFilename(`${roiName}_${fileType}`),
      content: csvContent
    });
  });

  // Add metadata CSV
  files.push({
    name: generateExportCsvFilename('ROI_metadata'),
    content: generateMetadataCSVContent(polygonFeatures)
  });

  const tarFileName = generateExportTarFilename(polygonFeatures.length);
  downloadTarFile(files, tarFileName);
};

export const exportPolygonsWithCellsCSVAsTar = (polygonFeatures: PolygonFeature[]) => {
  createCSVTarFile(polygonFeatures, 'cells');
};

export const exportPolygonsWithTranscriptsCSVAsTar = (polygonFeatures: PolygonFeature[]) => {
  createCSVTarFile(polygonFeatures, 'transcripts');
};
