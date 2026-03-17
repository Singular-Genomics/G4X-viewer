import { useEffect, useState } from 'react';
import { useViewerStore, VIEWER_LOADING_TYPES, ViewerSourceType } from '../stores/ViewerStore';
import { buildDefaultSelection, createLoader } from '../legacy/utils';
import { unstable_batchedUpdates } from 'react-dom';
import { isInterleaved } from '@hms-dbmi/viv';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { MAX_UINT16_VALUE, MAX_UINT8_VALUE } from '../shared/constants';

export const useOmeTiffImage = (source: ViewerSourceType | null) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaderCreated, setIsLoaderCreated] = useState(false);
  const omeTiffLoader = useBrightfieldImagesStore.getState().getOmeTiffLoader();

  useEffect(() => {
    setIsLoaderCreated(false);

    async function changeLoader() {
      if (!source) return null;

      try {
        useViewerStore.setState({
          isViewerLoading: {
            type: VIEWER_LOADING_TYPES.OMETIFF_IMAGE,
            message: t('viewer.loadingBrightfieldImage')
          }
        });

        const { urlOrFile } = source;

        const newLoader = await createLoader(
          urlOrFile,
          () => {},
          () => {}
        );

        let nextLoader: any;
        if (Array.isArray(newLoader)) {
          if (newLoader.length > 1) {
            nextLoader = newLoader.map((l) => l.data);
          } else {
            nextLoader = newLoader[0].data;
          }
        } else {
          nextLoader = newLoader.data;
        }

        if (nextLoader) {
          unstable_batchedUpdates(() => {
            useBrightfieldImagesStore.setState({ omeTiffLoader: nextLoader });
          });
          setIsLoaderCreated(true);
        }
      } catch (error) {
        console.error('Failed to load OmeTiff image:', error);
        enqueueSnackbar({
          message: t('viewer.brightfieldImageLoadError'),
          variant: 'error',
          autoHideDuration: 5000
        });
        useViewerStore.setState({ isViewerLoading: undefined });
      }
    }

    if (source) {
      changeLoader();
    } else {
      useBrightfieldImagesStore.setState({
        omeTiffLoader: [{ labels: [], shape: [] }]
      });
      useViewerStore.setState({ isViewerLoading: undefined });
    }
  }, [source, t, enqueueSnackbar]);

  useEffect(() => {
    if (!source || !isLoaderCreated) return;

    useViewerStore.setState({
      isViewerLoading: {
        type: VIEWER_LOADING_TYPES.OMETIFF_IMAGE,
        message: t('viewer.loadingBrightfieldImage')
      }
    });

    const newSelections = buildDefaultSelection(omeTiffLoader[0]);
    const { dtype } = omeTiffLoader[0];
    const maxValue = dtype === 'uint16' || dtype === '<u2' ? MAX_UINT16_VALUE : MAX_UINT8_VALUE;
    const newContrastLimits = isInterleaved(omeTiffLoader[0].shape)
      ? [[0, maxValue]]
      : [
          [0, maxValue],
          [0, maxValue],
          [0, maxValue]
        ];

    useBrightfieldImagesStore.setState({
      omeTiffSelections: newSelections,
      omeTiffContrastLimits: newContrastLimits
    });
    useViewerStore.setState({ isViewerLoading: undefined });
  }, [omeTiffLoader, source, isLoaderCreated, t]);
};
