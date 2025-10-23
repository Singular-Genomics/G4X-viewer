import { GetApplyQuickFilterFn, GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CellsFilterTableRowEntry } from './CellsFilterTable.types';
import { GxFilterTableColorCell } from '../../../../../shared/components/GxFilterTable/GxFilterTableColorCell';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';

export const useCellsFilterTableColumns = (): GridColDef<CellsFilterTableRowEntry>[] => {
  const { t } = useTranslation();
  const { cellColormapConfig, setCellColormapConfig } = useCellSegmentationLayerStore();

  const geneColorQuickFilter: GetApplyQuickFilterFn<any, unknown> = (value) => {
    if (!(value as string).startsWith('[')) {
      return null;
    }

    const parsedValue = (value as string).replace(/\[|\]/g, '').split(' ').map(Number);
    return (cellValue) => parsedValue.every((value) => (cellValue as Array<number>).includes(value));
  };

  const handleColorMapUpdate = (color: number[], geneName: string) => {
    const updatedConfig = cellColormapConfig.map((entry) =>
      entry.clusterId === geneName ? { ...entry, color } : entry
    );
    setCellColormapConfig(updatedConfig);
  };

  return [
    {
      field: 'clusterId',
      headerName: t('segmentation.clusterId'),
      headerAlign: 'center',
      filterable: true,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.clusterId}</Typography>
    },
    {
      field: 'color',
      headerAlign: 'center',
      headerName: t('segmentation.color'),
      filterable: false,
      flex: 1,
      getApplyQuickFilterFn: geneColorQuickFilter,
      renderCell: (params) => (
        <GxFilterTableColorCell
          currentColor={params.row.color}
          currnetValueName={params.row.clusterId}
          handleColorUpdate={handleColorMapUpdate}
        />
      )
    }
  ];
};
