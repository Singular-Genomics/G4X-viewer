import { useDropzone } from 'react-dropzone';
import * as protobuf from 'protobufjs';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { CellMasksSchema } from '../../../../../layers/cell-masks-layer/cell-masks-schema';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { useTranslation } from 'react-i18next';
import { usePolygonDrawingStore } from '../../../../../stores/PolygonDrawingStore';
import { usePolygonDetectionWorker } from '../../../../PictureInPictureViewerAdapter/worker/usePolygonDetectionWorker';
import { SEGMENTATION_FILE_SIZE_LIMIT } from '../../../../../shared/constants';
import { humanFileSize } from '../../../../../utils/utils';

export const useCellMasksFileHandler = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { detectCellPolygonsInPolygon } = usePolygonDetectionWorker();
  const { setSelectedCells, addSelectedCells } = useCellSegmentationLayerStore();
  const { setDetecting } = usePolygonDrawingStore();
  const { t } = useTranslation();

  const onDrop = async (files: File[]) => {
    if (files.length !== 1) {
      return;
    }

    if (files[0].size > SEGMENTATION_FILE_SIZE_LIMIT) {
      enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'error',
        message: t('sourceFiles.uploadedFileSizeError', { size: humanFileSize(SEGMENTATION_FILE_SIZE_LIMIT) })
      });
      return;
    }

    console.log(files[0].size);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const cellDataBuffer = new Uint8Array(reader.result as ArrayBuffer);
      const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
      const decodedData = protoRoot.lookupType('CellMasks').decode(cellDataBuffer) as any;

      const colormapConfig = decodedData.colormap;
      const cellMasks = decodedData.cellMasks;

      if (!colormapConfig || !colormapConfig.length) {
        enqueueSnackbar({
          message: t('sourceFiles.segmentationMissingColormap'),
          variant: 'warning'
        });
      }

      if (!cellMasks || !cellMasks.length) {
        enqueueSnackbar({
          message: t('sourceFiles.segmentationMissingData'),
          variant: 'error'
        });
      }

      let listOfProteinNames: string[] = [];
      let areUmapAvailable = false;

      if (cellMasks.length) {
        listOfProteinNames = Object.keys(cellMasks[0].proteins);
        areUmapAvailable = !!cellMasks[0].umapValues;
      }

      const polygonFeatures = usePolygonDrawingStore.getState().polygonFeatures;

      if (polygonFeatures.length > 0) {
        setDetecting(true);
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'info',
          message: t('interactiveLayer.detectingCells')
        });

        setSelectedCells([]);
        for (const polygon of polygonFeatures) {
          const result = await detectCellPolygonsInPolygon(polygon, cellMasks);

          polygon.properties = {
            ...polygon.properties,
            cellPolygonCount: result.cellPolygonCount,
            cellClusterDistribution: result.cellClusterDistribution
          };

          addSelectedCells({ data: result.cellPolygonsInDrawnPolygon, roiId: polygon.properties.polygonId });
        }

        setDetecting(false);
      }

      useCellSegmentationLayerStore.setState({
        cellMasksData: cellMasks || [],
        cellColormapConfig: colormapConfig.map((entry: any) => ({
          clusterId: entry.clusterId,
          color: entry.color
        })),
        cytometryProteinsNames: listOfProteinNames,
        umapDataAvailable: areUmapAvailable
      });
      useCytometryGraphStore.getState().resetFilters();
    };
    reader.onerror = () => console.error('Something went wrong during file load!');
    reader.readAsArrayBuffer(files[0]);
    reader.addEventListener('progress', (event: ProgressEvent<FileReader>) =>
      setProgress(Math.round((event.loaded / event.total) * 100))
    );
    reader.addEventListener('loadend', () => setLoading(false));

    useCellSegmentationLayerStore.setState({
      fileName: files[0].name
    });
  };

  const dropzoneProps = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/octet-stream': ['.bin'],
      'application/macbinary': ['.bin'],
      'application/binary': ['.bin'],
      '': ['.bin'],
      '*': ['.bin']
    }
  });

  return {
    dropzoneProps,
    progress,
    loading
  };
};
