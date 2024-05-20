import { ColorMapEntry } from "../../../../../stores/BinaryFilesStore";

export type PointFiltersTableRowProps = {
  id: string;
  geneName: string;
  geneColor: number[];
}

export type PointFiltersTableRowEntry = {
  id: string;
} & ColorMapEntry