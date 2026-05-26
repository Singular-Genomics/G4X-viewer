import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { ChannelsSettings, PropertiesUpdateType, useChannelsStore } from '../../../../../stores/ChannelsStore';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { validateChannelImportData } from './ChannelSettingsImportExportButtons.helpers';

export const useChannelSettingsImportExport = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [
    ids,
    selections,
    channelsVisible,
    colors,
    contrastLimits,
    channelsSettings,
    soloChannelIndex,
    presoloChannelsVisible,
    setPropertiesForChannel
  ] = useChannelsStore(
    useShallow((store) => [
      store.ids,
      store.selections,
      store.channelsVisible,
      store.colors,
      store.contrastLimits,
      store.channelsSettings,
      store.soloChannelIndex,
      store.presoloChannelsVisible,
      store.setPropertiesForChannel
    ])
  );

  const [channelOptions, metadata, generalDetails] = useViewerStore(
    useShallow((store) => [store.channelOptions, store.metadata, store.generalDetails])
  );

  const exportChannelSettings = () => {
    try {
      const exportData = {
        channels: ids.map((_, index) => {
          const name = channelOptions[(selections as any)[index].c];
          const perChannelSettings = channelsSettings?.[name];
          const isSoloed = soloChannelIndex === index;
          const visible =
            soloChannelIndex !== null
              ? (presoloChannelsVisible[index] ?? channelsVisible[index])
              : channelsVisible[index];
          return {
            name,
            visible,
            ...(soloChannelIndex !== null && { soloed: isSoloed }),
            color: colors[index],
            contrastLimits: contrastLimits[index],
            ...(perChannelSettings?.initialContrastLimits !== undefined && {
              initialContrastLimits: perChannelSettings.initialContrastLimits
            }),
            selection: selections[index]
          };
        })
      };

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
        const content = e.target?.result as string;
        let importData: unknown;
        try {
          importData = JSON.parse(content);
        } catch {
          enqueueSnackbar({ message: t('channelSettings.channelImportError'), variant: 'error' });
          return;
        }

        try {
          validateChannelImportData(importData);
        } catch {
          enqueueSnackbar({ message: t('channelSettings.channelImportInvalidFormat'), variant: 'error' });
          return;
        }

        try {
          const data = importData as {
            channels: any[];
            channelsSettings?: Record<string, any>;
          };
          const { addIsChannelLoading, setIsChannelLoading } = useViewerStore.getState();

          const newChannelsSettings: ChannelsSettings = {};
          data.channels.forEach((ch: any) => {
            if (ch.name) {
              newChannelsSettings[ch.name] = {
                ...(ch.color !== undefined && { color: ch.color }),
                ...(ch.initialContrastLimits !== undefined && { initialContrastLimits: ch.initialContrastLimits }),
                ...(ch.contrastLimits !== undefined && {
                  minValue: ch.contrastLimits[0],
                  maxValue: ch.contrastLimits[1]
                })
              };
            }
          });

          const mergedSettings: ChannelsSettings = { ...newChannelsSettings, ...(data.channelsSettings ?? {}) };
          if (Object.keys(mergedSettings).length > 0) {
            useChannelsStore.setState({ channelsSettings: mergedSettings });
          }

          data.channels.forEach((channelData: any, idx: number) => {
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

          if (ids.length > data.channels.length) {
            const { removeIsChannelLoading } = useViewerStore.getState();
            for (let i = ids.length - 1; i >= data.channels.length; i--) {
              useChannelsStore.getState().removeChannel(i);
              removeIsChannelLoading(i);
            }
          }

          if (data.channels.length > ids.length) {
            const channelsToAdd = data.channels.slice(ids.length);
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
                    channelsVisible: true,
                    colors: channelData.color || [255, 255, 255],
                    contrastLimits: (channelData.contrastLimits ?? [0, 65535]) as [number, number],
                    domains: (channelData.contrastLimits ?? [0, 65535]) as [number, number]
                  } as any);
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

          const soloIndex = data.channels.findIndex((ch: any) => ch.soloed === true);
          if (soloIndex !== -1) {
            const currentCount = useChannelsStore.getState().ids.length;
            useChannelsStore.setState({
              soloChannelIndex: soloIndex,
              presoloChannelsVisible: data.channels.map((ch: any) => ch.visible ?? true),
              channelsVisible: Array.from({ length: currentCount }, (_, i) => i === soloIndex)
            });
          } else {
            useChannelsStore.setState({ soloChannelIndex: null, presoloChannelsVisible: [] });
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

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  return {
    exportChannelSettings,
    getRootProps: dropzone.getRootProps,
    getInputProps: dropzone.getInputProps,
    isDragActive: dropzone.isDragActive,
    isDragAccept: dropzone.isDragAccept,
    isDragReject: dropzone.isDragReject
  };
};
