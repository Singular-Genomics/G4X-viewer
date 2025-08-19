import { useDropzone } from 'react-dropzone';
import * as protobuf from 'protobufjs';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { CellMasksSchema } from '../../../../../layers/cell-masks-layer/cell-masks-schema';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';

export const useCellMasksFileHandler = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = async (files: File[]) => {
    if (files.length !== 1) {
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const cellDataBuffer = new Uint8Array(reader.result as ArrayBuffer);
      const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
      const decodedData = protoRoot.lookupType('CellMasks').decode(cellDataBuffer) as any;

      const colormapConfig = decodedData.colormap;
      const cellMasks = decodedData.cellMasks;

      if (!colormapConfig || !colormapConfig.length) {
        enqueueSnackbar({
          message: 'Missing colormap config, transcript metadata filtering will be unavailable',
          variant: 'warning'
        });
      }

      if (!cellMasks || !cellMasks.length) {
        enqueueSnackbar({
          message: 'Given file is missing cell segmentation masks data',
          variant: 'error'
        });
      }

      let listOfProteinNames: string[] = [];
      let areUmapAvailable = false;

      if (cellMasks.length) {
        listOfProteinNames = Object.keys(cellMasks[0].proteins);
        areUmapAvailable = !!cellMasks[0].umapValues;
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
