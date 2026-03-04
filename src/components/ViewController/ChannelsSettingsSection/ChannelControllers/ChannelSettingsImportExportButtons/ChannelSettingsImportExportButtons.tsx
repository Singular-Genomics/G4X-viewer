import { Box, Button, SxProps, Theme, Tooltip, alpha, useTheme } from '@mui/material';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { PropertiesUpdateType, useChannelsStore } from '../../../../../stores/ChannelsStore';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

export const ChannelSettingsImportExportButtons = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

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

  const [channelOptions, metadata, generalDetails] = useViewerStore(
    useShallow((store) => [store.channelOptions, store.metadata, store.generalDetails])
  );

  const exportChannelSettings = () => {
    try {
      // Filter out empty channel settings objects
      const filteredChannelsSettings: Record<string, any> = {};

      // Only include settings that have meaningful properties
      Object.entries(channelsSettings || {}).forEach(([key, value]) => {
        if (value && Object.keys(value).length > 0 && Object.values(value).some((v) => v !== undefined && v !== null)) {
          filteredChannelsSettings[key] = value;
        }
      });

      const exportData: {
        channelsSettings?: Record<string, any>;
        channels: any[];
      } = {
        channels: ids.map((_, index) => ({
          name: channelOptions[(selections as any)[index].c],
          visible: channelsVisible[index],
          color: colors[index],
          contrastLimits: contrastLimits[index],
          selection: selections[index]
        }))
      };

      // Only include channel settings if we have non-empty ones
      if (Object.keys(filteredChannelsSettings).length > 0) {
        exportData.channelsSettings = filteredChannelsSettings;
      }

      let jsonData;
      try {
        jsonData = JSON.stringify(exportData, null, 2);
      } catch (jsonError) {
        console.error('Error stringifying channel settings:', jsonError);
        enqueueSnackbar({
          message: t('channelSettings.channelFormattingError'),
          variant: 'error'
        });
        return;
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      let fileName = 'channel-settings';

      if (generalDetails && generalDetails.fileName) {
        const baseName = generalDetails.fileName.split('.').slice(0, -1).join('.');
        const sanitizedName = baseName.replace(/[^\w-]/g, '_');
        if (sanitizedName) {
          fileName = `channel-settings_${sanitizedName}`;
        }
      } else if (metadata && metadata.Name) {
        const baseName = metadata.Name.split('.').slice(0, -1).join('.');
        const sanitizedName = baseName.replace(/[^\w-]/g, '_');
        if (sanitizedName) {
          fileName = `channel-settings_${sanitizedName}`;
        }
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.json`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      enqueueSnackbar({
        message: t('channelSettings.channelExportSuccess'),
        variant: 'success'
      });
    } catch (error) {
      console.error('Error exporting channel settings:', error);
      enqueueSnackbar({
        message: t('channelSettings.channelExportError'),
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
                    const updatedSelection = {
                      ...channelData.selection,
                      c: channelIndex
                    };
                    newProps.selections = updatedSelection;
                  }

                  setPropertiesForChannel(idx, newProps);
                }
              }
            });

            if (importData.channels.length > ids.length) {
              const channelsToAdd = importData.channels.slice(ids.length);
              const channelIndicesToLoad: number[] = [];

              channelsToAdd.forEach((channelData: any) => {
                if (channelData.name) {
                  const channelName = channelData.name;
                  const channelIndex = channelOptions.indexOf(channelName);

                  if (channelIndex !== -1) {
                    const newSelection = channelData.selection
                      ? {
                          ...channelData.selection,
                          c: channelIndex
                        }
                      : {
                          z: 0,
                          c: channelIndex,
                          t: 0
                        };

                    const numSelectionsBeforeAdd = useChannelsStore.getState().selections.length;
                    channelIndicesToLoad.push(numSelectionsBeforeAdd);

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
                  }
                }
              });

              if (channelIndicesToLoad.length > 0) {
                let loadedCount = 0;
                useViewerStore.setState({
                  onViewportLoad: () => {
                    if (loadedCount < channelIndicesToLoad.length) {
                      setIsChannelLoading(channelIndicesToLoad[loadedCount], false);
                      loadedCount++;
                      if (loadedCount === channelIndicesToLoad.length) {
                        useViewerStore.setState({ onViewportLoad: () => {} });
                      }
                    }
                  }
                });
              }
            }
          }

          enqueueSnackbar({
            message: t('channelSettings.channelImportSuccess'),
            variant: 'success'
          });
        } catch (error) {
          console.error('Error importing channel settings:', error);
          enqueueSnackbar({
            message: t('channelSettings.channelImportError'),
            variant: 'error'
          });
        }
      };

      reader.readAsText(file);
    },
    [ids, channelOptions, setPropertiesForChannel, enqueueSnackbar, t]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  let dynamicButtonText = t('general.import');

  if (isDragActive) {
    if (isDragAccept) {
      dynamicButtonText = t('general.dropHere');
    } else if (isDragReject) {
      dynamicButtonText = t('general.invalidFile');
    } else {
      dynamicButtonText = t('general.dropFile');
    }
  }

  const importButtonStyle = {
    ...sx.importButton,
    ...(isDragActive && sx.importButtonActive),
    ...(isDragActive && isDragAccept && sx.importButtonAccept),
    ...(isDragActive && isDragReject && sx.importButtonReject)
  };

  return (
    <Box sx={sx.buttonsContainer}>
      <Tooltip
        title={t('tooltips.channelSettings.export')}
        arrow
        placement="top"
        enterDelay={500}
        leaveDelay={50}
      >
        <Button
          startIcon={<DownloadIcon />}
          onClick={exportChannelSettings}
          sx={sx.exportButton}
          fullWidth
        >
          {t('general.export')}
        </Button>
      </Tooltip>
      <Tooltip
        title={t('tooltips.channelSettings.import')}
        arrow
        placement="top"
        enterDelay={500}
        leaveDelay={50}
      >
        <Button
          startIcon={<UploadIcon />}
          sx={importButtonStyle}
          fullWidth
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {dynamicButtonText}
        </Button>
      </Tooltip>
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '12px',
    width: '100%',
    padding: '0'
  },
  exportButton: {
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.gx.primary.white,
    padding: '7px 16px',
    flex: 1
  },
  importButton: {
    borderStyle: 'dashed',
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    padding: '7px 16px',
    flex: 1
  },
  importButtonActive: {
    borderStyle: 'solid',
    borderWidth: '2px',
    backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.1)
  },
  importButtonAccept: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.1)
  },
  importButtonReject: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.1)
  }
});
