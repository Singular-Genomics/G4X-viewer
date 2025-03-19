import { SxProps, Theme } from "@mui/material";

export type GxCollapsibleSectionProps = {
  sectionTitle: string;
  defultState?: GxCollapsibleSectionState;
  disabled?: boolean;
  customStyles?: GxCollapsibleSectionStyles;
  unmountOnExit?: boolean;
};

type GxCollapsibleSectionState = "open" | "collapsed";

type GxCollapsibleSectionStyles = {
  sectionContainer?: SxProps<Theme>;
  headerContainer?: SxProps<Theme>;
  titleText?: SxProps<Theme>;
  contentContainer?: SxProps<Theme>;
};
