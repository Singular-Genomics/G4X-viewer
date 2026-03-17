import { useEffect, useState } from 'react';
import { useViewerStore, VIEWER_LOADING_TYPES, ViewerSourceType } from '../stores/ViewerStore';
import { buildDefaultSelection, createLoader } from '../legacy/utils';
import { unstable_batchedUpdates } from 'react-dom';
import { isInterleaved } from '@hms-dbmi/viv';
import { useImageOverlaysStore } from '../stores/ImageOverlaysStore';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { MAX_UINT16_VALUE, MAX_UINT8_VALUE } from '../shared/constants';

export const useBrightfieldImage = (source: ViewerSourceType | null) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaderCreated, setIsLoaderCreated] = useState(false);
  const loader = useImageOverlaysStore.getState().getLoader();

  useEffect(() => {
    // Reset state when source changes
    setIsLoaderCreated(false);

    async function changeLoader() {
      if (!source) return null;

      try {
        useViewerStore.setState({
          isViewerLoading: {
            type: VIEWER_LOADING_TYPES.BRIGHTFIELD_IMAGE,
            message: t('viewer.loadingBrightfieldImage')
          }
        });

        const { urlOrFile } = source;

        // --------------------- LEGACY LOADER ----------------------
        const newLoader = await createLoader(
          urlOrFile,
          () => {},
          () => {}
        );
        // ----------------------------------------------------------
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
            useImageOverlaysStore.setState({ loader: nextLoader });
          });
          setIsLoaderCreated(true);
        }
      } catch (error) {
        console.error('Failed to load H&E image:', error);
        enqueueSnackbar({
          message: t('viewer.brightfieldImageLoadError'),
          variant: 'error',
          autoHideDuration: 5000
        });
        useViewerStore.setState({
          isViewerLoading: undefined
        });
      }
    }

    if (source) {
      changeLoader();
    } else {
      // Reset loader state when source is null
      useImageOverlaysStore.setState({
        loader: [{ labels: [], shape: [] }]
      });
      useViewerStore.setState({
        isViewerLoading: undefined
      });
    }
  }, [source, t, enqueueSnackbar]);

  useEffect(() => {
    if (!source || !isLoaderCreated) return;

    useViewerStore.setState({
      isViewerLoading: {
        type: VIEWER_LOADING_TYPES.BRIGHTFIELD_IMAGE,
        message: t('viewer.loadingBrightfieldImage')
      }
    });
    const newSelections = buildDefaultSelection(loader[0]);

    const { dtype } = loader[0];
    const maxValue = dtype === 'uint16' || dtype === '<u2' ? MAX_UINT16_VALUE : MAX_UINT8_VALUE;
    const newContrastLimits = isInterleaved(loader[0].shape)
      ? [[0, maxValue]]
      : [
          [0, maxValue],
          [0, maxValue],
          [0, maxValue]
        ];

    useImageOverlaysStore.setState({
      selections: newSelections,
      contrastLimits: newContrastLimits
    });
    useViewerStore.setState({
      isViewerLoading: undefined
    });
  }, [loader, source, isLoaderCreated, t]);
};
