export const formatDetailsPopupData = (
  section: Record<string, any>
): { label: string; value: any }[] => {
  return Object.entries(section).map(([key, value]) => ({
    label: key.split("_").join(" "),
    value: typeof value === "object" ? JSON.stringify(value) : value,
  }));
};
