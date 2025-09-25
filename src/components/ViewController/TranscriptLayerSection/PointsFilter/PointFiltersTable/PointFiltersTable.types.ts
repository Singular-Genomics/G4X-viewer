import { GxFilterTableRowPropBase } from '../../../../../shared/components/GxFilterTable';
import { ColorMapEntry } from '../../../../../stores/BinaryFilesStore';

export type PointFiltersTableRowEntry = GxFilterTableRowPropBase & ColorMapEntry;
export type ColorPickerCellProps = { row: PointFiltersTableRowEntry };
