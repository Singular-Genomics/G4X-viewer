import { useEffect } from "react";
import { useChannelsStore } from "../stores/ChannelsStore/ChannelsStore";
import { ViewerSourceType } from "../stores/ViewerStore/ViewerStore.types";
import { useMetadata } from "./useMetadata.hook";
import { useViewerStore } from "../stores/ViewerStore/ViewerStore";

// Legacy from original Avivator app
import {
  buildDefaultSelection,
  createLoader,
  getMultiSelectionStats,
  guessRgb,
} from "../legacy/utils";
import { unstable_batchedUpdates } from "react-dom";
import { isInterleaved } from "@hms-dbmi/viv";
import { COLOR_PALLETE } from "../shared/constants";
import { ChannelsSettings } from "../stores/ChannelsStore";

export const useProteinImage = (source: ViewerSourceType | null) => {
  const loader = useChannelsStore.getState().getLoader();
  const metadata = useMetadata();

  useEffect(() => {
    async function changeLoader() {
      if (!source) return null;

      // Should we use sth different than setState
      useViewerStore.setState({ isChannelLoading: [true] });
      useViewerStore.setState({ isViewerLoading: true });

      const { urlOrFile } = source;

      // --------------------- LEGACY LOADER ----------------------
      const newLoader = await createLoader(
        urlOrFile,
        () => {},
        () => {}
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
      } else {
        nextMeta = newLoader.metadata;
        nextLoader = newLoader.data;
      }
      if (nextLoader) {
        unstable_batchedUpdates(() => {
          useChannelsStore.setState({ loader: nextLoader });
          useViewerStore.setState({
            metadata: nextMeta,
          });
        });
      }
    }
    if (source) changeLoader();
  }, [source, history]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const changeSettings = async () => {
      if (!source) return null;
      // Placeholder
      useViewerStore.setState({ isChannelLoading: [true] });
      useViewerStore.setState({ isViewerLoading: true });
      const newSelections = buildDefaultSelection(loader[0]);
      const { Channels } = metadata.Pixels;
      const channelOptions = Channels.map(
        (c: any, i: any) => c.Name ?? `Channel ${i}`
      );
      // Default RGB.
      let newContrastLimits = [];
      let newDomains = [];
      let newColors = [];
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
            [0, 255],
          ];
          newDomains = [
            [0, 255],
            [0, 255],
            [0, 255],
          ];
          newColors = [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
          ];
        }
        useViewerStore.setState({ useColorMap: false });
      } else {
        const stats = await getMultiSelectionStats({
          loader,
          selections: newSelections,
        });
        newDomains = stats.domains;
        newContrastLimits = stats.contrastLimits;
        // If there is only one channel, use white.
        newColors =
          newDomains.length === 1
            ? [[255, 255, 255]]
            : newDomains.map(
                (_, i) =>
                  (Channels[i]?.Color && Channels[i].Color.slice(0, -1)) ??
                  COLOR_PALLETE[i]
              );
        useViewerStore.setState({
          useColorMap: true,
        });
      }

      const channelsIds = newDomains.map(() => String(Math.random()));
      const channelsSettings: ChannelsSettings = {};

      channelOptions.forEach((channelName: any) => {
        channelsSettings[`${channelName}`] = {
          color: undefined,
          maxValue: undefined,
          minValue: undefined,
        };
      });

      useChannelsStore.setState({
        ids: channelsIds,
        selections: newSelections,
        domains: newDomains,
        contrastLimits: newContrastLimits,
        colors: newColors,
        channelsVisible: newColors.map(() => true),
        channelsSettings,
      });
      useViewerStore.setState({
        isChannelLoading: newSelections.map((i) => !i),
        isViewerLoading: false,
        pixelValues: new Array(newSelections.length).fill("0"),
        globalSelection: newSelections[0],
        channelOptions,
      });
    };
    if (metadata) changeSettings();
  }, [loader, metadata]); // eslint-disable-line react-hooks/exhaustive-deps
};
