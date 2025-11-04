export const formatDetailsPopupData = (section: Record<string, any>): { label: string; value: any }[] => {
  return Object.entries(section).map(([key, value]) => {
    let formattedValue = value;

    // Round floats to max 2 decimal places
    if (typeof value === 'number' && !Number.isInteger(value)) {
      formattedValue = Math.round(value * 100) / 100;
    } else if (typeof value === 'object') {
      formattedValue = JSON.stringify(value);
    }

    return {
      label: key.split('_').join(' '),
      value: formattedValue
    };
  });
};
