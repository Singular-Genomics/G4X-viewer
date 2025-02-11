import { DetailsSectionData } from "./DetailsPopup.types";

export const formatDetailsPopupData = (
  section: DetailsSectionData
): { label: string; value: any }[] => {
  return Object.entries(section).map(([key, value]) => ({
    label: key.split("_").join(" "),
    value: typeof value === "object" ? JSON.stringify(value) : value,
  }));
};
