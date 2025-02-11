export type DetailsSectionData = Record<string, any>;

export type DetailsData = Record<string, DetailsSectionData>;

export type DetailsPopupProps = {
  data: DetailsData;
};
