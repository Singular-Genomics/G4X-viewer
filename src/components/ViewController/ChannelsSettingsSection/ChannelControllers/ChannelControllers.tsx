import { useShallow } from 'zustand/react/shallow';
import { Box, Theme, useTheme } from '@mui/material';
import { ChannelController } from './ChannelController/ChannelController';
import { PropertiesUpdateType, useChannelsStore } from '../../../../stores/ChannelsStore';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useMetadata } from '../../../../hooks/useMetadata.hook';
import { getSingleSelectionStats } from '../../../../legacy/utils';
import { CHANNEL_MIN_FALLBACK, CHANNEL_MAX_FALLBACK } from './ChannelController/ChannelController.helpers';

export const ChannelControllers = () => {
  const theme = useTheme();
  const [
    ids,
    selections,
    channelsVisible,
    colors,
    contrastLimits,
    domains,
    channelsSettings,
    toggleIsOnSetter,
    removeChannel,
    setPropertiesForChannel,
    getLoader,
    soloChannelIndex,
    presoloChannelsVisible,
    setSoloChannel,
    togglePresoloIsOn
  ] = useChannelsStore(
    useShallow((store) => [
      store.ids,
      store.selections,
      store.channelsVisible,
      store.colors,
      store.contrastLimits,
      store.domains,
      store.channelsSettings,
      store.toggleIsOn,
      store.removeChannel,
      store.setPropertiesForChannel,
      store.getLoader,
      store.soloChannelIndex,
      store.presoloChannelsVisible,
      store.setSoloChannel,
      store.togglePresoloIsOn
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
  const areChannelControlsDisabled = isChannelLoading.some(Boolean);

  return (
    <Box sx={sx.channelControllersContainer}>
      {ids.map((id, index) => {
        const toggleIsOn = () => toggleIsOnSetter(index);
        const name = channelOptions[(selections as any)[index].c];

        const onSelectionChange = async (channelName: string) => {
          if (useViewerStore.getState().isChannelLoading.some(Boolean)) return;

          const selection = {
            ...selections[index],
            c: channelOptions.indexOf(channelName)
          };
          setIsChannelLoading(index, true);

          try {
            const { domain, contrastLimits: newContrastLimit } = await getSingleSelectionStats({
              loader,
              selection
            });
            const {
              Pixels: { Channels }
            } = metadata;
            const { c } = selection;

            const newProps: Partial<PropertiesUpdateType> = {};
            if (!(channelName in channelsSettings)) {
              channelsSettings[channelName] = {};
            }
            if (!channelsSettings[channelName].initialContrastLimits) {
              channelsSettings[channelName].initialContrastLimits = newContrastLimit as [number, number];
            }
            if (!channelsSettings[channelName].initialColor && Channels[c].Color) {
              channelsSettings[channelName].initialColor = Channels[c].Color.slice(0, -1) as [number, number, number];
            }
            if (channelsSettings[channelName].minValue && channelsSettings[channelName].maxValue) {
              const settings = channelsSettings[channelName];
              newProps.contrastLimits = [settings.minValue, settings.maxValue] as [number, number];
            } else {
              newProps.contrastLimits = newContrastLimit as [number, number];
            }

            if (channelName in channelsSettings && channelsSettings[channelName].color) {
              newProps.colors = channelsSettings[channelName].color as [number, number, number];
            } else if (Channels[c].Color) {
              newProps.colors = Channels[c].Color.slice(0, -1) as [number, number, number];
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
          } catch (error) {
            console.error('Failed to load channel:', error);
            setIsChannelLoading(index, false);
          }
        };

        const handleRemoveChannel = () => {
          removeChannel(index);
          removeIsChannelLoading(index);
        };

        const handleColorSelect = (color: [number, number, number]) => {
          if (name in channelsSettings) {
            channelsSettings[name].color = color;
          }
          setPropertiesForChannel(index, { colors: color });
        };

        const handleSliderChange = (newValue: [number, number]) => {
          if (name in channelsSettings) {
            channelsSettings[name].minValue = newValue[0];
            channelsSettings[name].maxValue = newValue[1];
          }
          setPropertiesForChannel(index, { contrastLimits: newValue });
        };

        const handleResetSlider = () => {
          const initialLimits = channelsSettings[name]?.initialContrastLimits ?? (domains[index] as [number, number]);
          if (name in channelsSettings) {
            channelsSettings[name].minValue = undefined;
            channelsSettings[name].maxValue = undefined;
          }
          setPropertiesForChannel(index, { contrastLimits: initialLimits });
        };

        return (
          <Box
            key={id}
            sx={sx.channelControlerWrapper}
          >
            <ChannelController
              name={name}
              domain={(domains[index] ?? [CHANNEL_MIN_FALLBACK, CHANNEL_MAX_FALLBACK]) as [number, number]}
              onSelectionChange={onSelectionChange}
              channelVisible={channelsVisible[index]}
              pixelValue={pixelValues[index]}
              toggleIsOn={toggleIsOn}
              color={colors[index]}
              defaultColor={(channelsSettings[name]?.initialColor ?? colors[index]) as [number, number, number]}
              isLoading={isChannelLoading[index]}
              disabled={areChannelControlsDisabled}
              handleColorSelect={handleColorSelect}
              handleRemoveChannel={handleRemoveChannel}
              slider={contrastLimits[index]}
              defaultSlider={
                (channelsSettings[name]?.initialContrastLimits ??
                  domains[index] ?? [CHANNEL_MIN_FALLBACK, CHANNEL_MAX_FALLBACK]) as [number, number]
              }
              handleSliderChange={handleSliderChange}
              handleResetSlider={handleResetSlider}
              isSoloed={soloChannelIndex === index}
              isSoloMode={soloChannelIndex !== null}
              presoloVisible={presoloChannelsVisible[index] ?? channelsVisible[index]}
              onSoloToggle={() => setSoloChannel(index)}
              toggleSelectInSoloMode={() => togglePresoloIsOn(index)}
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
