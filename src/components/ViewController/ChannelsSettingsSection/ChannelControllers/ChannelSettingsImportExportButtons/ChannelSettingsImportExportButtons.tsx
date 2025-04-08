import { Box, Button, Theme, alpha, useTheme } from '@mui/material';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { PropertiesUpdateType, useChannelsStore } from '../../../../../stores/ChannelsStore';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { useShallow } from 'zustand/react/shallow';

export const ChannelSettingsImportExportButtons = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [ids, selections, channelsVisible, colors, contrastLimits, channelsSettings, setPropertiesForChannel] =
    useChannelsStore(
      useShallow((store) => [
        store.ids,
        store.selections,
        store.channelsVisible,
        store.colors,
        store.contrastLimits,
        store.channelsSettings,
        store.setPropertiesForChannel
      ])
    );

  const [channelOptions] = useViewerStore(useShallow((store) => [store.channelOptions]));

  const exportChannelSettings = () => {
    try {
      const exportData = {
        channelsSettings,
        channels: ids.map((id, index) => ({
          id,
          name: channelOptions[(selections as any)[index].c],
          visible: channelsVisible[index],
          color: colors[index],
          contrastLimits: contrastLimits[index],
          selection: selections[index]
        }))
      };

      const jsonData = JSON.stringify(exportData, null, 2);

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'channel-settings.json';
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      enqueueSnackbar({
        message: 'Channel settings exported successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error exporting channel settings:', error);
      enqueueSnackbar({
        message: 'Error exporting channel settings',
        variant: 'error'
      });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);

          const { addIsChannelLoading, setIsChannelLoading } = useViewerStore.getState();

          if (importData.channelsSettings) {
            useChannelsStore.setState({
              channelsSettings: importData.channelsSettings
            });
          }

          if (importData.channels && Array.isArray(importData.channels)) {
            importData.channels.forEach((channelData: any, idx: number) => {
              if (idx < ids.length && channelData.name) {
                const channelName = channelData.name;
                const channelIndex = channelOptions.indexOf(channelName);

                if (channelIndex !== -1) {
                  const newProps: Partial<PropertiesUpdateType> = {};

                  if (channelData.contrastLimits) {
                    newProps.contrastLimits = channelData.contrastLimits;
                  }

                  if (channelData.color) {
                    newProps.colors = channelData.color;
                  }

                  if (channelData.visible !== undefined) {
                    newProps.channelsVisible = channelData.visible;
                  }

                  if (channelData.selection) {
                    newProps.selections = channelData.selection;
                  }

                  setPropertiesForChannel(idx, newProps);
                }
              }
            });

            if (importData.channels.length > ids.length) {
              const channelsToAdd = importData.channels.slice(ids.length);

              channelsToAdd.forEach((channelData: any) => {
                if (channelData.name) {
                  const channelName = channelData.name;
                  const channelIndex = channelOptions.indexOf(channelName);

                  if (channelIndex !== -1) {
                    const newSelection = channelData.selection || {
                      z: 0,
                      c: channelIndex,
                      t: 0
                    };

                    const numSelectionsBeforeAdd = useChannelsStore.getState().selections.length;

                    addIsChannelLoading(true);
                    useChannelsStore.getState().addChannel({
                      selections: newSelection,
                      ids: String(Math.random()),
                      channelsVisible: channelData.visible !== undefined ? channelData.visible : true,
                      colors: channelData.color || [255, 255, 255]
                    } as any);

                    if (channelData.contrastLimits) {
                      setPropertiesForChannel(numSelectionsBeforeAdd, {
                        contrastLimits: channelData.contrastLimits
                      });
                    }

                    useViewerStore.setState({
                      onViewportLoad: () => {
                        useViewerStore.setState({ onViewportLoad: () => {} });
                        setIsChannelLoading(numSelectionsBeforeAdd, false);
                      }
                    });
                  }
                }
              });
            }
          }

          enqueueSnackbar({
            message: 'Channel settings imported successfully',
            variant: 'success'
          });
        } catch (error) {
          console.error('Error importing channel settings:', error);
          enqueueSnackbar({
            message: 'Error importing channel settings',
            variant: 'error'
          });
        }
      };

      reader.readAsText(file);
    },
    [ids, channelOptions, setPropertiesForChannel, enqueueSnackbar]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  const sx = styles(theme);

  return (
    <Box sx={sx.buttonsContainer}>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={exportChannelSettings}
        sx={sx.exportButton}
      >
        Export
      </Button>
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        sx={sx.importButton}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        Import
      </Button>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '12px',
    padding: '0 10px'
  },
  exportButton: {
    backgroundColor: theme.palette.gx.accent.greenBlue,
    padding: '7px 24px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.9)
    }
  },
  importButton: {
    borderStyle: 'dashed',
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    padding: '7px 24px',
    '&:hover': {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2)
    }
  }
});
