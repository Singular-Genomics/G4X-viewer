import { useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useViewerStore } from '../stores/ViewerStore';
import { useBinaryFilesStore } from '../stores/BinaryFilesStore';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';

export const IMAGE_URL_PARAM = 'imageUrl';

export const useCloudImageLoader = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const hasLoadedFromUrl = useRef(false);
  const [loadedUrl, setLoadedUrl] = useState('');

  useEffect(() => {
    if (hasLoadedFromUrl.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const imageUrl = urlParams.get(IMAGE_URL_PARAM);

    if (imageUrl) {
      hasLoadedFromUrl.current = true;

      const filename = imageUrl.split('/').pop() || imageUrl;

      if (!/^.+\.(ome\.tiff|tif|zarr)$/.test(filename)) {
        enqueueSnackbar({
          message: t('sourceFiles.imageInvalidFile'),
          variant: 'error'
        });
        return;
      }

      useViewerStore.setState({
        source: { urlOrFile: imageUrl, description: filename }
      });
      useBinaryFilesStore.getState().reset();
      useTranscriptLayerStore.getState().reset();
      useCellSegmentationLayerStore.getState().reset();
      useBrightfieldImagesStore.getState().reset();

      setLoadedUrl(imageUrl);

      enqueueSnackbar({
        message: t('sourceFiles.imageSuccess', { filename }),
        variant: 'success'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loadedUrl };
};
