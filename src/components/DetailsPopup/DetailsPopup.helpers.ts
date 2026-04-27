export const formatDetailsPopupData = (
  section: Record<string, any>,
  smpInfoOrder: string[]
): { label: string; value: any }[] => {
  const orderedKeys = smpInfoOrder.filter((k) => k in section);
  const remainingKeys = Object.keys(section).filter((k) => !smpInfoOrder.includes(k));
  const keys = [...orderedKeys, ...remainingKeys];

  return keys.map((key) => {
    const value = section[key];
    let formattedValue = value;

    if (typeof value === 'number' && !Number.isInteger(value)) {
      formattedValue = Math.round(value * 100) / 100;
    } else if (Array.isArray(value)) {
      formattedValue = value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      formattedValue = JSON.stringify(value);
    }

    return {
      label: key.split('_').join(' '),
      value: formattedValue
    };
  });
};
