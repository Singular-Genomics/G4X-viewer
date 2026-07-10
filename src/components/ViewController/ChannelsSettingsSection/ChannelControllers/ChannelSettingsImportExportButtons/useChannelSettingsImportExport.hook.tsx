import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { ChannelsSettings, PropertiesUpdateType, useChannelsStore } from '../../../../../stores/ChannelsStore';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { validateChannelImportData } from './ChannelSettingsImportExportButtons.helpers';
import { MAX_UINT16_VALUE } from '../../../../../shared/constants';
import { MAX_CHANNELS } from '@hms-dbmi/viv';
import { List, ListItem } from '@mui/material';

type ContrastLimitsRange = {
  min: number;
  max: number;
};

type InactiveChannelConfigEntry = {
  name: string;
  color?: [number, number, number];
  contrastLimits?: ContrastLimitsRange;
  initialContrastLimits?: ContrastLimitsRange;
};

type ActiveChannelEntry = InactiveChannelConfigEntry & { visible?: boolean; soloed?: boolean };

export type ChannelSettingsExportSchema = {
  sourceFile: string | undefined;
  activeChannels: ActiveChannelEntry[] | 'NONE';
  inactiveChannels: InactiveChannelConfigEntry[] | 'NONE';
};

const sanitizeFileName = (raw: string) =>
  raw
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[^\w-]/g, '_');

export const useChannelSettingsImportExport = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [
    ids,
    selections,
    channelsVisible,
    channelsSettings,
    soloChannelIndex,
    presoloChannelsVisible,
    colors,
    contrastLimits
  ] = useChannelsStore(
    useShallow((store) => [
      store.ids,
      store.selections,
      store.channelsVisible,
      store.channelsSettings,
      store.soloChannelIndex,
      store.presoloChannelsVisible,
      store.colors,
      store.contrastLimits
    ])
  );

  const [channelOptions, metadata, generalDetails] = useViewerStore(
    useShallow((store) => [store.channelOptions, store.metadata, store.generalDetails])
  );

  const exportChannelSettings = () => {
    try {
      const sanitizedFileName = sanitizeFileName(generalDetails?.fileName ?? metadata?.Name);
      const activeChannelsIndicies = ids.map((_, index) => (selections as any)[index].c);
      const activeChannelNames = activeChannelsIndicies.map((idx) => channelOptions[idx]);
      const inactiveChannelNames = channelOptions.filter((_, index) => !activeChannelsIndicies.includes(index));

      const activeChannelsData = activeChannelNames.map((name, index) => {
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
          contrastLimits: {
            min: contrastLimits[index][0],
            max: contrastLimits[index][1]
          },
          ...(perChannelSettings?.initialContrastLimits !== undefined && {
            initialContrastLimits: {
              min: perChannelSettings.initialContrastLimits[0],
              max: perChannelSettings.initialContrastLimits[1]
            }
          })
        };
      });

      const inactiveChannelsData = inactiveChannelNames
        .map((name) => {
          const perChannelSettings = channelsSettings?.[name];
          return {
            name,
            ...(perChannelSettings?.color !== undefined && {
              color: perChannelSettings.color
            }),
            ...(perChannelSettings?.minValue !== undefined &&
              perChannelSettings?.maxValue !== undefined && {
                contrastLimits: {
                  min: perChannelSettings.minValue,
                  max: perChannelSettings.maxValue
                }
              }),
            ...(perChannelSettings?.initialContrastLimits !== undefined && {
              initialContrastLimits: {
                min: perChannelSettings.initialContrastLimits[0],
                max: perChannelSettings.initialContrastLimits[1]
              }
            })
          };
        })
        .filter((entry) => Object.keys(entry).length > 1);

      const exportData = {
        sourceFile: generalDetails?.fileName,
        activeChannels: Object.entries(activeChannelsData).length > 0 ? activeChannelsData : 'NONE',
        inactiveChannels: Object.entries(inactiveChannelsData).length > 0 ? inactiveChannelsData : 'NONE'
      };

      let jsonData;
      try {
        jsonData = JSON.stringify(exportData, null, 2);
      } catch (jsonError) {
        enqueueSnackbar({
          message: t('channelSettings.channelFormattingError'),
          variant: 'error'
        });
        return;
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      let fileName = 'channel-settings';
      if (sanitizedFileName) {
        fileName = `channel-settings_${sanitizedFileName}`;
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
        const { addIsChannelLoading, setIsChannelLoading } = useViewerStore.getState();
        const { setPropertiesForChannel } = useChannelsStore.getState();

        try {
          importData = JSON.parse(content);
        } catch {
          enqueueSnackbar({ message: t('channelSettings.channelImportError'), variant: 'error' });
          return;
        }

        const rawData = importData as ChannelSettingsExportSchema;

        try {
          validateChannelImportData(rawData);
        } catch (error) {
          console.error(error);
          enqueueSnackbar({ message: t('channelSettings.channelImportInvalidFormat'), variant: 'error' });
          return;
        }

        const warningMessages = [];
        try {
          if (rawData.sourceFile && generalDetails?.fileName && rawData.sourceFile !== generalDetails.fileName) {
            warningMessages.push(t('channelSettings.channelImportSourceFileMismatch'));
          }

          if (Array.isArray(rawData.activeChannels) && rawData.activeChannels.length > MAX_CHANNELS) {
            warningMessages.push(t('channelSettings.channelImportTooManyChannels'));
            rawData.activeChannels = rawData.activeChannels.slice(0, MAX_CHANNELS);
          }

          const activeChannels: ActiveChannelEntry[] = Array.isArray(rawData.activeChannels)
            ? rawData.activeChannels
            : [];

          const customConfigurations: InactiveChannelConfigEntry[] = Array.isArray(rawData.inactiveChannels)
            ? rawData.inactiveChannels
            : [];

          const newChannelsSettings: ChannelsSettings = {};

          activeChannels.forEach((entry) => {
            if (!channelOptions.includes(entry.name)) return;
            newChannelsSettings[entry.name] = {
              ...(entry.color !== undefined && { color: entry.color }),
              ...(entry.contrastLimits !== undefined && {
                minValue: entry.contrastLimits.min,
                maxValue: entry.contrastLimits.max
              }),
              ...(entry.initialContrastLimits !== undefined && {
                initialContrastLimits: [entry.initialContrastLimits.min, entry.initialContrastLimits.max] as [
                  number,
                  number
                ]
              })
            };
          });

          customConfigurations.forEach((entry) => {
            if (!channelOptions.includes(entry.name)) return;
            newChannelsSettings[entry.name] = {
              ...(entry.color !== undefined && { color: entry.color }),
              ...(entry.contrastLimits !== undefined && {
                minValue: entry.contrastLimits.min,
                maxValue: entry.contrastLimits.max
              }),
              ...(entry.initialContrastLimits !== undefined && {
                initialContrastLimits: [entry.initialContrastLimits.min, entry.initialContrastLimits.max] as [
                  number,
                  number
                ]
              })
            };
          });

          const mergedSettings: ChannelsSettings = { ...newChannelsSettings };
          if (Object.keys(mergedSettings).length > 0) {
            useChannelsStore.setState({ channelsSettings: mergedSettings });
          }

          activeChannels.forEach((channelData: any, idx: number) => {
            if (idx >= ids.length) return;

            const channelIndex = channelOptions.indexOf(channelData.name);
            if (channelIndex === -1) return;

            const s = newChannelsSettings[channelData.name];
            const newProps: Partial<PropertiesUpdateType> = {
              selections: { c: channelIndex, z: 0 }
            };

            if (channelData.visible !== undefined) newProps.channelsVisible = channelData.visible;
            if (s?.color !== undefined) newProps.colors = s.color;
            if (s?.minValue !== undefined && s?.maxValue !== undefined)
              newProps.contrastLimits = [s.minValue, s.maxValue];

            setPropertiesForChannel(idx, newProps);
          });

          if (ids.length > activeChannels.length) {
            const { removeIsChannelLoading } = useViewerStore.getState();
            for (let i = ids.length - 1; i >= activeChannels.length; i--) {
              useChannelsStore.getState().removeChannel(i);
              removeIsChannelLoading(i);
            }
          }

          if (activeChannels.length > ids.length) {
            const channelsToAdd = activeChannels.slice(ids.length);
            const channelIndicesToLoad: number[] = [];

            channelsToAdd.forEach((channelData: any) => {
              if (!channelData.name) return;
              const channelIndex = channelOptions.indexOf(channelData.name);
              if (channelIndex === -1) return;

              const s = newChannelsSettings[channelData.name];
              const contrastLimits: [number, number] =
                s?.minValue !== undefined && s?.maxValue !== undefined
                  ? [s.minValue, s.maxValue]
                  : [0, MAX_UINT16_VALUE];

              const numSelectionsBeforeAdd = useChannelsStore.getState().selections.length;
              channelIndicesToLoad.push(numSelectionsBeforeAdd);

              addIsChannelLoading(true);
              useChannelsStore.getState().addChannel({
                ids: String(Math.random()),
                selections: { c: channelIndex, z: 0 },
                channelsVisible: channelData.visible ?? true,
                colors: s?.color ?? [255, 255, 255],
                contrastLimits,
                domains: contrastLimits
              } as any);
            });

            if (channelIndicesToLoad.length > 0) {
              useViewerStore.setState({
                onViewportLoad: () => {
                  channelIndicesToLoad.forEach((channelIndex) => setIsChannelLoading(channelIndex, false));
                  useViewerStore.setState({ onViewportLoad: () => {} });
                }
              });
            }
          }

          const soloIndex = activeChannels.findIndex((ch: any) => ch.soloed === true);
          if (soloIndex !== -1) {
            const currentCount = useChannelsStore.getState().ids.length;
            useChannelsStore.setState({
              soloChannelIndex: soloIndex,
              presoloChannelsVisible: activeChannels.map((ch: any) => ch.visible ?? true),
              channelsVisible: Array.from({ length: currentCount }, (_, i) => i === soloIndex)
            });
          } else {
            useChannelsStore.setState({ soloChannelIndex: null, presoloChannelsVisible: [] });
          }

          if (warningMessages.length) {
            enqueueSnackbar({
              variant: 'gxSnackbar',
              message: t('general.warning'),
              titleMode: 'warning',
              persist: true,
              customContent: (
                <List>
                  {warningMessages.map((msg) => (
                    <ListItem>{msg}</ListItem>
                  ))}
                </List>
              )
            });
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
    [ids, channelOptions, generalDetails, enqueueSnackbar, t]
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
