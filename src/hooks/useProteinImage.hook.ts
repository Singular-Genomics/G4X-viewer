import { useEffect, useRef } from 'react';
import { useChannelsStore } from '../stores/ChannelsStore/ChannelsStore';
import { VIEWER_LOADING_TYPES, ViewerSourceType } from '../stores/ViewerStore/ViewerStore.types';
import { useMetadata } from './useMetadata.hook';
import { useViewerStore } from '../stores/ViewerStore/ViewerStore';

// Legacy from original Avivator app
import { buildDefaultSelection, createLoader, getMultiSelectionStats, guessRgb } from '../legacy/utils';
import { MAX_CHANNELS } from '@hms-dbmi/viv';
import { unstable_batchedUpdates } from 'react-dom';
import { isInterleaved } from '@hms-dbmi/viv';
import { COLOR_PALLETE } from '../shared/constants';
import { ChannelsSettings } from '../stores/ChannelsStore';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

export const useProteinImage = (source: ViewerSourceType | null) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const loader = useChannelsStore.getState().getLoader();
  const metadata = useMetadata();
  const lastValidSourceRef = useRef<ViewerSourceType | null>(null);

  useEffect(() => {
    async function changeLoader() {
      if (!source) return null;

      try {
        // Should we use sth different than setState
        useViewerStore.setState({ isChannelLoading: [true] });
        useViewerStore.setState({
          isViewerLoading: {
            type: VIEWER_LOADING_TYPES.MAIN_IMAGE,
            message: t('viewer.loadingImage')
          }
        });

        const { urlOrFile } = source;

        // --------------------- LEGACY LOADER ----------------------
        const newLoader = await createLoader(
          urlOrFile,
          () => {},
          (errorMessage: string | null) => {
            enqueueSnackbar({
              message: errorMessage || t('sourceFiles.imageLoadError'),
              variant: 'error',
              autoHideDuration: 5000
            });
            useViewerStore.setState({
              source: lastValidSourceRef.current,
              isViewerLoading: undefined,
              isChannelLoading: [false]
            });
          }
        );
        // ----------------------------------------------------------

        let nextMeta: any;
        let nextLoader: any;

        if (Array.isArray(newLoader)) {
          if (newLoader.length > 1) {
            nextMeta = newLoader.map((l) => l.metadata);
            nextLoader = newLoader.map((l) => l.data);
          } else {
            nextMeta = newLoader[0].metadata;
            nextLoader = newLoader[0].data;
          }
        } else if ('metadata' in newLoader) {
          nextMeta = newLoader.metadata;
          nextLoader = newLoader.data;
        } else {
          nextLoader = newLoader.data;
        }

        // Validate that HE images (isRgb with single channel) are not allowed
        if (nextMeta && nextLoader) {
          const isRgb = guessRgb(nextMeta);
          const numChannels = nextMeta.Pixels?.Channels?.length || 0;

          if (isRgb && numChannels === 1) {
            enqueueSnackbar({
              message: t('sourceFiles.heImageNotSupported'),
              variant: 'error',
              autoHideDuration: 5000
            });
            useViewerStore.setState({
              source: lastValidSourceRef.current,
              isViewerLoading: undefined,
              isChannelLoading: [false]
            });
            return;
          }
        }

        if (nextLoader) {
          lastValidSourceRef.current = source;

          unstable_batchedUpdates(() => {
            useChannelsStore.setState({ loader: nextLoader });
            useViewerStore.setState({
              metadata: nextMeta
            });
          });
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        enqueueSnackbar({
          message: t('viewer.imageLoadError'),
          variant: 'error',
          autoHideDuration: 5000
        });
        useViewerStore.setState({
          source: lastValidSourceRef.current,
          isViewerLoading: undefined,
          isChannelLoading: [false]
        });
      }
    }
    if (source) changeLoader();
  }, [source, history]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const changeSettings = async () => {
      if (!source) return null;
      useViewerStore.setState({ isChannelLoading: [true] });
      if (!useViewerStore.getState().isViewerLoading) {
        useViewerStore.setState({
          isViewerLoading: { type: VIEWER_LOADING_TYPES.MAIN_IMAGE, message: t('viewer.loadingImage') }
        });
      }
      const { Channels } = metadata.Pixels;
      const channelOptions = Channels.map((c: any, i: any) => c.Name ?? `Channel ${i}`);

      const baseSelection = buildDefaultSelection(loader[0])[0];
      const activeIndices = Channels.map((c: any, i: number) => (c.Active ? i : -1))
        .filter((i: number) => i >= 0)
        .slice(0, MAX_CHANNELS);
      const newSelections =
        activeIndices.length > 0
          ? activeIndices.map((c: number) => ({ ...baseSelection, c }))
          : buildDefaultSelection(loader[0]);
      // Default RGB.
      let newContrastLimits: [number, number][] = [];
      let newDomains: [number, number][] = [];
      let newColors: [number, number, number][] = [];
      const isRgb = guessRgb(metadata);
      if (isRgb) {
        if (isInterleaved(loader[0].shape)) {
          // These don't matter because the data is interleaved.
          newContrastLimits = [[0, 255]];
          newDomains = [[0, 255]];
          newColors = [[255, 0, 0]];
        } else {
          newContrastLimits = [
            [0, 255],
            [0, 255],
            [0, 255]
          ];
          newDomains = [
            [0, 255],
            [0, 255],
            [0, 255]
          ];
          newColors = [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255]
          ];
        }
        useViewerStore.setState({ useColorMap: false });
      } else {
        const selectionsNeedingStats = newSelections.filter((sel: any, i: number) => {
          const w = Channels[sel.c ?? i]?.Window;
          return !(typeof w?.min === 'number' && typeof w?.max === 'number');
        });

        const stats =
          selectionsNeedingStats.length > 0
            ? await getMultiSelectionStats({ loader, selections: selectionsNeedingStats })
            : { domains: [], contrastLimits: [] };

        let statsIndex = 0;
        newSelections.forEach((sel: any, i: number) => {
          const w = Channels[sel.c ?? i]?.Window;
          const hasDomain = typeof w?.min === 'number' && typeof w?.max === 'number';

          if (hasDomain) {
            newDomains.push([Math.trunc(w.min), Math.trunc(w.max)]);
            const hasContrast = typeof w?.start === 'number' && typeof w?.end === 'number';
            newContrastLimits.push(
              hasContrast ? [Math.trunc(w.start), Math.trunc(w.end)] : [Math.trunc(w.min), Math.trunc(w.max)]
            );
          } else {
            newDomains.push(stats.domains[statsIndex]);
            newContrastLimits.push(stats.contrastLimits[statsIndex]);
            statsIndex++;
          }
        });

        // If there is only one channel, use white.
        newColors =
          newDomains.length === 1
            ? [[255, 255, 255]]
            : newSelections.map((sel: any, i: number) => {
                const channelIndex = sel.c ?? i;
                return (
                  (Channels[channelIndex]?.Color && Channels[channelIndex].Color.slice(0, -1)) ??
                  COLOR_PALLETE[channelIndex]
                );
              });
        useViewerStore.setState({
          useColorMap: true
        });
      }

      const channelsIds = newDomains.map(() => String(Math.random()));
      const channelsSettings: ChannelsSettings = {};

      channelOptions.forEach((channelName: any, i: number) => {
        const selectionIndex = newSelections.findIndex((sel: any) => (sel.c ?? 0) === i);
        channelsSettings[`${channelName}`] = {
          color: undefined,
          maxValue: undefined,
          minValue: undefined,
          initialContrastLimits:
            selectionIndex >= 0 ? (newContrastLimits[selectionIndex] as [number, number]) : undefined
        };
      });

      useChannelsStore.setState({
        ids: channelsIds,
        selections: newSelections,
        domains: newDomains,
        contrastLimits: newContrastLimits,
        colors: newColors,
        channelsVisible: newSelections.map((sel: any) => Channels[sel.c ?? 0]?.Active ?? false),
        isLayerVisible: true,
        channelsSettings
      });
      const currentLoading = useViewerStore.getState().isViewerLoading;
      useViewerStore.setState({
        isChannelLoading: newSelections.map((_i: any) => false),
        isViewerLoading: currentLoading?.type === VIEWER_LOADING_TYPES.MAIN_IMAGE ? undefined : currentLoading,
        pixelValues: new Array(newSelections.length).fill('0'),
        globalSelection: newSelections[0],
        channelOptions
      });
    };
    if (metadata) changeSettings();
  }, [loader, metadata]); // eslint-disable-line react-hooks/exhaustive-deps
};
