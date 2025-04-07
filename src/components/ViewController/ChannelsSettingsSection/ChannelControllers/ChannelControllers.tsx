import { useShallow } from 'zustand/react/shallow';
import { Box, Theme, useTheme } from '@mui/material';
import { ChannelController } from './ChannelController/ChannelController';
import { PropertiesUpdateType, useChannelsStore } from '../../../../stores/ChannelsStore';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useMetadata } from '../../../../hooks/useMetadata.hook';
import { getSingleSelectionStats } from '../../../../legacy/utils';
import { ChannelSettingsImportExportButtons } from './ChannelSettingsImportExportButtons';

export const ChannelControllers = () => {
  const theme = useTheme();
  const [
    ids,
    selections,
    channelsVisible,
    colors,
    contrastLimits,
    channelsSettings,
    toggleIsOnSetter,
    removeChannel,
    setPropertiesForChannel,
    getLoader
  ] = useChannelsStore(
    useShallow((store) => [
      store.ids,
      store.selections,
      store.channelsVisible,
      store.colors,
      store.contrastLimits,
      store.channelsSettings,
      store.toggleIsOn,
      store.removeChannel,
      store.setPropertiesForChannel,
      store.getLoader
    ])
  );

  const [channelOptions, pixelValues, isChannelLoading, setIsChannelLoading, removeIsChannelLoading] = useViewerStore(
    useShallow((store) => [
      store.channelOptions,
      store.pixelValues,
      store.isChannelLoading,
      store.setIsChannelLoading,
      store.removeIsChannelLoading
    ])
  );

  const loader = getLoader();
  const metadata = useMetadata();
  const sx = styles(theme);

  return (
    <Box sx={sx.channelControllersContainer}>
      <ChannelSettingsImportExportButtons />

      {ids.map((id, index) => {
        const toggleIsOn = () => toggleIsOnSetter(index);
        const name = channelOptions[(selections as any)[index].c];

        const onSelectionChange = (channelName: string) => {
          const selection = {
            ...selections[index],
            c: channelOptions.indexOf(channelName)
          };
          setIsChannelLoading(index, true);

          getSingleSelectionStats({
            loader,
            selection
          }).then(({ domain, contrastLimits: newContrastLimit }) => {
            const {
              Pixels: { Channels }
            } = metadata;
            const { c } = selection;

            const newProps: Partial<PropertiesUpdateType> = {};
            if (
              channelName in channelsSettings &&
              channelsSettings[channelName].minValue &&
              channelsSettings[channelName].maxValue
            ) {
              const settings = channelsSettings[channelName];
              newProps.contrastLimits = [settings.minValue, settings.maxValue] as number[];
            } else {
              newProps.contrastLimits = newContrastLimit;
            }

            if (channelName in channelsSettings && channelsSettings[channelName].color) {
              newProps.colors = channelsSettings[channelName].color;
            } else if (Channels[c].Color) {
              newProps.colors = Channels[c].Color.slice(0, -1);
            }

            newProps.domains = domain;

            setPropertiesForChannel(index, newProps);
            useViewerStore.setState({
              onViewportLoad: () => {
                useViewerStore.setState({ onViewportLoad: () => {} });
                setIsChannelLoading(index, false);
              }
            });
            setPropertiesForChannel(index, { selections: selection });
          });
        };

        const handleRemoveChannel = () => {
          removeChannel(index);
          removeIsChannelLoading(index);
        };

        const handleColorSelect = (color: number[]) => {
          if (name in channelsSettings) {
            channelsSettings[name].color = color;
          }
          setPropertiesForChannel(index, { colors: color });
        };

        const handleSliderChange = (newValue: number[]) => {
          if (name in channelsSettings) {
            channelsSettings[name].minValue = newValue[0];
            channelsSettings[name].maxValue = newValue[1];
          }
          setPropertiesForChannel(index, { contrastLimits: newValue });
        };

        return (
          <Box
            key={id}
            sx={sx.channelControlerWrapper}
          >
            <ChannelController
              name={name}
              onSelectionChange={onSelectionChange}
              channelVisible={channelsVisible[index]}
              pixelValue={pixelValues[index]}
              toggleIsOn={toggleIsOn}
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

const styles = (theme: Theme) => ({
  channelControllersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '8px',
    overflowY: 'auto'
  },
  channelControlerWrapper: {
    padding: '8px',
    background: theme.palette.gx.lightGrey[900],
    borderRadius: '4px'
  }
});
