import { GxFilterTableRowPropBase } from '../../../../../shared/components/GxFilterTable';
import { ColorMapEntry } from '../../../../../stores/ZarrDataStore';

export type PointFiltersTableRowEntry = GxFilterTableRowPropBase & ColorMapEntry;
