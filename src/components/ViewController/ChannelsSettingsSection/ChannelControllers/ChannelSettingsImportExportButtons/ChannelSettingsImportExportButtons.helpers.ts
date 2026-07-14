import { ChannelSettingsExportSchema } from './useChannelSettingsImportExport.hook';

export const validateChannelImportData = (data: ChannelSettingsExportSchema): void => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Root must be an object');
  }

  if (!('activeChannels' in data)) {
    throw new Error('Invalid channels JSON file - missing activeChannels');
  }

  if (data.activeChannels !== 'NONE') {
    if (!Array.isArray(data.activeChannels)) {
      throw new Error('Invalid channels JSON file - missing or invalid channel names');
    }

    for (const ch of data.activeChannels) {
      if (!ch || typeof ch !== 'object' || !('name' in ch) || typeof ch.name !== 'string') {
        throw new Error('Each activeChannel must have a string "name"');
      }

      if ('contrastLimits' in ch) {
        if (
          !ch.contrastLimits ||
          typeof ch.contrastLimits !== 'object' ||
          typeof ch.contrastLimits.min !== 'number' ||
          typeof ch.contrastLimits.max !== 'number'
        ) {
          throw new Error('Invalid customConfiguration "contrastLimits" - must have numeric min and max');
        }
      }

      if ('initialContrastLimits' in ch) {
        if (
          !ch.initialContrastLimits ||
          typeof ch.initialContrastLimits !== 'object' ||
          typeof ch.initialContrastLimits.min !== 'number' ||
          typeof ch.initialContrastLimits.max !== 'number'
        ) {
          throw new Error('Invalid customConfiguration "initialContrastLimits" - must have numeric min and max');
        }
      }

      if ('visible' in ch && typeof ch.visible !== 'boolean') {
        throw new Error('Invalid activeChannel "visible" field type.');
      }

      if ('soloed' in ch && typeof ch.soloed !== 'boolean') {
        throw new Error('Invalid activeChannel "soloed" field type.');
      }
    }
  }

  if (!('inactiveChannels' in data)) {
    throw new Error('Invalid channels JSON file - missing customConfigurations');
  }

  if (data.inactiveChannels !== 'NONE') {
    if (!Array.isArray(data.inactiveChannels)) {
      throw new Error('Invalid channels JSON file - invalid customConfigurations');
    }

    for (const ich of data.inactiveChannels) {
      if (!ich || typeof ich !== 'object' || !('name' in ich) || typeof ich.name !== 'string') {
        throw new Error('Each customConfiguration must have a string "name"');
      }

      if ('color' in ich) {
        if (!Array.isArray(ich.color) || ich.color.length !== 3 || ich.color.some((v) => typeof v !== 'number')) {
          throw new Error('Invalid customConfiguration "color" - must be [number, number, number]');
        }
      }

      if ('contrastLimits' in ich) {
        if (
          !ich.contrastLimits ||
          typeof ich.contrastLimits !== 'object' ||
          typeof ich.contrastLimits.min !== 'number' ||
          typeof ich.contrastLimits.max !== 'number'
        ) {
          throw new Error('Invalid customConfiguration "contrastLimits" - must have numeric min and max');
        }
      }

      if ('initialContrastLimits' in ich) {
        if (
          !ich.initialContrastLimits ||
          typeof ich.initialContrastLimits !== 'object' ||
          typeof ich.initialContrastLimits.min !== 'number' ||
          typeof ich.initialContrastLimits.max !== 'number'
        ) {
          throw new Error('Invalid customConfiguration "initialContrastLimits" - must have numeric min and max');
        }
      }
    }
  }
};
