import { SxProps, Theme } from "@mui/material";

export type CollapsibleSectionProps = {
  sectionTitle: string;
  defultState?: CollapsibleSectionState;
  disabled?: boolean;
  customStyles?: CollapsibleSectionStyles;
};

type CollapsibleSectionState = "open" | "collapsed";

type CollapsibleSectionStyles = {
  sectionContainer?: SxProps<Theme>;
  headerContainer?: SxProps<Theme>;
  titleText?: SxProps<Theme>;
  contentContainer?: SxProps<Theme>;
};
