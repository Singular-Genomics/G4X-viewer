import { useShallow } from "zustand/react/shallow";
import { useChannelsStore } from "../../../stores/ChannelsStore/ChannelsStore";
import { useViewerStore } from "../../../stores/ViewerStore/ViewerStore";
import { Box } from "@mui/material";
import { ChannelController } from "../ChannelController/ChannelController";
import { getSingleSelectionStats } from "../../../legacy/utils";
import { useLoader } from "../../../hooks/useLoader.hook";
import { useMetadata } from "../../../hooks/useMetadata.hook";

export const ChannelControllers = () => {
  const [
    ids,
    selections,
    channelsVisible,
    colors,
    domains,
    contrastLimits,
    toggleIsOnSetter,
    removeChannel,
    setPropertiesForChannel,
  ] = useChannelsStore(
    useShallow((store) => [
      store.ids,
      store.selections,
      store.channelsVisible,
      store.colors,
      store.domains,
      store.contrastLimits,
      store.toggleIsOn,
      store.removeChannel,
      store.setPropertiesForChannel,
    ])
  );

  const [
    channelOptions,
    pixelValues,
    isChannelLoading,
    setIsChannelLoading,
    removeIsChannelLoading,
  ] = useViewerStore(
    useShallow((store) => [
      store.channelOptions,
      store.pixelValues,
      store.isChannelLoading,
      store.setIsChannelLoading,
      store.removeIsChannelLoading,
    ])
  );

  const loader = useLoader();
  const metadata = useMetadata();

  return (
    <Box sx={sx.channelControllersContainer}>
      {ids.map((id, index) => {
        const toggleIsOn = () => toggleIsOnSetter(index);
        const name = channelOptions[(selections as any)[index].c];

        const onSelectionChange = (newValue: string) => {
          const selection = {
            ...selections[index],
            c: channelOptions.indexOf(newValue),
          };
          setIsChannelLoading(index, true);
          getSingleSelectionStats({
            loader,
            selection,
          }).then(({ domain, contrastLimits: newContrastLimit }) => {
            const {
              Pixels: { Channels },
            } = metadata;
            const { c } = selection;
            
            // Can this be done differently ?
            const newProps: {[k: string]: any} = {
              contrastLimits: newContrastLimit,
              domains: domain,
            };
            if (Channels[c].Color) {
              newProps.colors = Channels[c].Color.slice(0, -1);
            }
            setPropertiesForChannel(index, newProps);
            useViewerStore.setState({
              onViewportLoad: () => {
                useViewerStore.setState({ onViewportLoad: () => {} });
                setIsChannelLoading(index, false);
              },
            });
            setPropertiesForChannel(index, { selections: selection });
          });
        };

        const handleRemoveChannel = () => {
          removeChannel(index);
          removeIsChannelLoading(index);
        };

        const handleColorSelect = (color: number[]) => {
          setPropertiesForChannel(index, { colors: color });
        };

        const handleSliderChange = (newValue: number[]) => { 
          setPropertiesForChannel(index, { contrastLimits: newValue })
        };

        return (
          <Box key={id}>
            <ChannelController
              name={name}
              onSelectionChange={onSelectionChange}
              channelVisible={channelsVisible[index]}
              pixelValue={pixelValues[index]}
              toggleIsOn={toggleIsOn}
              domain={domains[index]}
              color={colors[index]}
              isLoading={isChannelLoading[index]}
              handleColorSelect={handleColorSelect}
              handleRemoveChannel={handleRemoveChannel}
              slider={contrastLimits[index]}
              handleSliderChange={handleSliderChange}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const sx = {
  channelControllersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxHeight: '550px',
    paddingRight: '10px',
    overflowY: 'auto',
  }
}
