import { GxFilterTableRowPropBase } from '../../../../../shared/components/GxFilterTable';
import { CellSegmentationColormapEntry } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';

export type CellsFilterTableRowEntry = GxFilterTableRowPropBase & CellSegmentationColormapEntry;
