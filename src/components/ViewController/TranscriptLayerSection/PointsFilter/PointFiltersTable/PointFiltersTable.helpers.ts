import { ColorMapEntry } from '../../../../../stores/ZarrDataStore';

// Metadata keys in first-seen order across all entries, so columns follow the order of the dataset's metadata
export const getMetadataKeys = (colorMapConfig: ColorMapEntry[]): string[] => {
  const keys = new Set<string>();
  colorMapConfig.forEach((entry) => {
    if (entry.metadata) {
      Object.keys(entry.metadata).forEach((key) => keys.add(key));
    }
  });
  return [...keys];
};

// A column is numeric when it holds at least one number and nothing but numbers / empty values, so it sorts numerically
export const isNumericMetadataKey = (colorMapConfig: ColorMapEntry[], key: string): boolean => {
  let hasNumber = false;
  for (const entry of colorMapConfig) {
    const value = entry.metadata?.[key];
    if (typeof value === 'number') {
      hasNumber = true;
    } else if (value !== null && value !== undefined) {
      return false;
    }
  }
  return hasNumber;
};

// Fallback header for keys without a translation, e.g. "mean_QS" -> "Mean QS"
export const formatMetadataKey = (key: string): string =>
  key
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());

export const formatMetadataValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);
