import { useEffect, useState } from 'react';
import { useViewerStore, VIEWER_LOADING_TYPES, ViewerSourceType } from '../stores/ViewerStore';
import { buildDefaultSelection, getMultiSelectionStats, guessRgb } from '../legacy/utils';
import { loadOverlayImage } from '../utils/loadOverlayImage';
import { unstable_batchedUpdates } from 'react-dom';
import { isInterleaved } from '@hms-dbmi/viv';
import { useImageOverlaysStore } from '../stores/ImageOverlaysStore';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { MAX_UINT16_VALUE, MAX_UINT8_VALUE, COLOR_PALLETE } from '../shared/constants';

export const useOmeTiffImage = (source: ViewerSourceType | null) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaderCreated, setIsLoaderCreated] = useState(false);
  const omeTiffLoader = useImageOverlaysStore.getState().getOmeTiffLoader();

  useEffect(() => {
    setIsLoaderCreated(false);

    async function changeLoader() {
      if (!source) return null;

      try {
        useViewerStore.setState({
          isViewerLoading: {
            type: VIEWER_LOADING_TYPES.OMETIFF_IMAGE,
            message: t('viewer.loadingHeImage')
          }
        });

        const { loader: nextLoader, metadata: nextMeta } = await loadOverlayImage(source);

        if (nextLoader) {
          unstable_batchedUpdates(() => {
            useImageOverlaysStore.setState({ omeTiffLoader: nextLoader, omeTiffMetadata: nextMeta });
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
      useImageOverlaysStore.setState({
        omeTiffLoader: [{ labels: [], shape: [] }],
        omeTiffMetadata: null
      });
      useViewerStore.setState({ isViewerLoading: undefined });
    }
  }, [source, t, enqueueSnackbar]);

  useEffect(() => {
    if (!source || !isLoaderCreated) return;

    const omeTiffMetadata = useImageOverlaysStore.getState().omeTiffMetadata;

    useViewerStore.setState({
      isViewerLoading: {
        type: VIEWER_LOADING_TYPES.OMETIFF_IMAGE,
        message: t('viewer.loadingHeImage')
      }
    });

    async function changeSettings() {
      const isRgb = omeTiffMetadata ? guessRgb(omeTiffMetadata) : false;

      if (isRgb) {
        const newSelections = buildDefaultSelection(omeTiffLoader[0]);
        const isInterleavedRgb = isInterleaved(omeTiffLoader[0].shape);
        const newContrastLimits = isInterleavedRgb
          ? [[0, 255]]
          : [
              [0, 255],
              [0, 255],
              [0, 255]
            ];
        const newColors: [number, number, number][] = isInterleavedRgb
          ? [[255, 0, 0]]
          : [
              [255, 0, 0],
              [0, 255, 0],
              [0, 0, 255]
            ];

        useImageOverlaysStore.setState({
          omeTiffSelections: newSelections,
          omeTiffContrastLimits: newContrastLimits,
          omeTiffColors: newColors
        });
        useViewerStore.setState({ isViewerLoading: undefined });
        return;
      }

      if (!omeTiffMetadata) {
        // No metadata fallback — use dtype-based limits
        const { dtype } = omeTiffLoader[0];
        const maxValue = dtype === 'uint16' || dtype === '<u2' ? MAX_UINT16_VALUE : MAX_UINT8_VALUE;
        const newSelections = buildDefaultSelection(omeTiffLoader[0]);
        const newContrastLimits = isInterleaved(omeTiffLoader[0].shape)
          ? [[0, maxValue]]
          : [
              [0, maxValue],
              [0, maxValue],
              [0, maxValue]
            ];

        useImageOverlaysStore.setState({
          omeTiffSelections: newSelections,
          omeTiffContrastLimits: newContrastLimits
        });
        useViewerStore.setState({ isViewerLoading: undefined });
        return;
      }

      const { Channels } = omeTiffMetadata.Pixels;
      const baseSelection = buildDefaultSelection(omeTiffLoader[0])[0];
      const activeIndices = Channels.map((c: any, i: number) => (c.Active ? i : -1)).filter((i: number) => i >= 0);

      const newSelections =
        activeIndices.length > 0
          ? activeIndices.map((c: number) => ({ ...baseSelection, c }))
          : buildDefaultSelection(omeTiffLoader[0]);

      const stats = await getMultiSelectionStats({
        loader: omeTiffLoader,
        selections: newSelections
      });

      const newColors = newSelections.map((sel: any, i: number) => {
        const channelIndex = sel.c ?? i;
        return (
          (Channels[channelIndex]?.Color && Channels[channelIndex].Color.slice(0, -1)) ?? COLOR_PALLETE[channelIndex]
        );
      });

      useImageOverlaysStore.setState({
        omeTiffSelections: newSelections,
        omeTiffContrastLimits: stats.contrastLimits,
        omeTiffColors: newColors
      });
      useViewerStore.setState({ isViewerLoading: undefined });
    }

    changeSettings();
  }, [omeTiffLoader, source, isLoaderCreated, t]);
};
