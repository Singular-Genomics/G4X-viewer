import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../../../stores/ViewerStore/ViewerStore";
import { useChannelsStore } from "../../../../stores/ChannelsStore/ChannelsStore";
import { useLoader } from "../../../../hooks/useLoader.hook";
import { useMetadata } from "../../../../hooks/useMetadata.hook";
import { useCallback } from "react";
import { getSingleSelectionStats } from "../../../../legacy/utils";
import { COLOR_PALLETE } from "../../../../shared/constants";
import { Button, Theme, alpha, useTheme } from "@mui/material";
import { MAX_CHANNELS } from "@hms-dbmi/viv";
import AddIcon from '@mui/icons-material/Add';

export const AddChannel = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const [
    globalSelection,
    isViewerLoading,
    setIsChannelLoading,
    addIsChannelLoading,
  ] = useViewerStore(
    useShallow((store) => [
      store.globalSelection,
      store.isViewerLoading,
      store.setIsChannelLoading,
      store.addIsChannelLoading,
    ])
  );

  const [selections, setPropertiesForChannel, addChannel] = useChannelsStore(
    useShallow((store) => [
      store.selections,
      store.setPropertiesForChannel,
      store.addChannel,
    ])
  );

  const loader = useLoader();
  const metadata = useMetadata();
  const { labels } = loader[0];

  const handleChannelAdd = useCallback(() => {
    let selection = Object.fromEntries(
      labels.map((label: string) => [label, 0])
    );
    selection = { ...selection, ...globalSelection };

    const numSelectionsBeforeAdd = selections.length;
    getSingleSelectionStats({
      loader,
      selection,
    }).then(({ domain, contrastLimits }) => {
      setPropertiesForChannel(numSelectionsBeforeAdd, {
        domains: domain,
        contrastLimits,
        channelsVisible: true,
      });
      useViewerStore.setState({
        onViewportLoad: () => {
          useViewerStore.setState({ onViewportLoad: () => {} });
          setIsChannelLoading(numSelectionsBeforeAdd, false);
        },
      });
      addIsChannelLoading(true);
      const {
        Pixels: { Channels },
      } = metadata;
      const { c } = selection;
      addChannel({
        selections: selection,
        ids: String(Math.random()),
        channelsVisible: false,
        colors:
          (Channels[c].Color && Channels[c].Color.slice(0, -1)) ??
          (COLOR_PALLETE[c] || [255, 255, 255]),
      } as any);
    });
  }, [
    addChannel,
    addIsChannelLoading,
    globalSelection,
    labels,
    loader,
    metadata,
    selections,
    setIsChannelLoading,
    setPropertiesForChannel,
  ]);

  return (
    <Button
      disabled={selections.length === MAX_CHANNELS || isViewerLoading}
      onClick={handleChannelAdd}
      fullWidth
      startIcon={<AddIcon/>}
      sx={sx.addChannelButton}
    >
      Add channel
    </Button>
  )
};

const styles = (theme: Theme) => ({
  addChannelButton: {
    marginTop: '16px',
    color: theme.palette.gx.accent.greenBlue,
    border: '1px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2),
    }
  }
});
