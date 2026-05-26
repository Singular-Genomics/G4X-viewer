export const validateChannelImportData = (data: unknown): void => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Root must be an object');
  }
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.channels)) {
    throw new Error('Missing or invalid "channels" array');
  }
  for (const ch of obj.channels) {
    if (!ch || typeof ch !== 'object' || typeof (ch as Record<string, unknown>).name !== 'string') {
      throw new Error('Each channel must have a string "name"');
    }
  }
};
